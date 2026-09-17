using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Controllers;
using Aplicacao.Appointments.DTOs;
using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Orcamentos.DTOs;
using Aplicacao.Servicos.DTOs;
using Aplicacao.Solicitacoes.DTOs;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Api.Testes.Integracao;

public class AgendamentosEndpointTestes : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AgendamentosEndpointTestes(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<(RegistrarEmpresaResposta Registro, HttpClient ClienteAutenticado)> CriarTrancistaAutenticadaAsync(string prefixo)
    {
        var requisicao = new RegistrarEmpresaRequisicao(
            NomeEmpresa: $"Studio {prefixo}",
            Slug: $"studio-{prefixo.ToLowerInvariant()}-{Guid.NewGuid():N}",
            NomeUsuario: $"Trancista {prefixo}",
            Email: $"{prefixo.ToLowerInvariant()}_{Guid.NewGuid():N}@studio.com",
            Senha: "SenhaForte123@"
        );

        var resposta = await _client.PostAsJsonAsync("/api/autenticacao/registrar", requisicao);
        resposta.StatusCode.Should().Be(HttpStatusCode.Created);

        var registro = await resposta.Content.ReadFromJsonAsync<RegistrarEmpresaResposta>();

        var clienteAutenticado = _client;
        clienteAutenticado.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registro!.Token);

        return (registro, clienteAutenticado);
    }

    [Fact]
    public async Task Deve_Executar_Jornada_Completa_Da_Cliente_Ate_O_Agendamento()
    {
        // 1. Trancista se registra e gera catálogo
        var (registro, _) = await CriarTrancistaAutenticadaAsync("JornadaAgenda");
        await _client.PostAsync("/api/servicos/gerar-padrao", null);

        var respCatalogo = await _client.GetAsync($"/api/publico/{registro.Slug}/servicos");
        var servicos = await respCatalogo.Content.ReadFromJsonAsync<List<ServicoDetalhesResposta>>();
        var nagô = servicos!.First(s => s.Nome.Contains("Nagô"));

        var perguntasObrigatorias = nagô.Perguntas.Where(p => p.Obrigatoria && p.Tipo != TipoPergunta.Arquivo).ToList();
        var perguntasFotosObrigatorias = nagô.Perguntas.Where(p => p.Obrigatoria && p.Tipo == TipoPergunta.Arquivo).ToList();

        // 2. Cliente envia solicitação com fotos
        using var formData = new MultipartFormDataContent();
        formData.Add(new StringContent("Valéria Santos"), "NomeCliente");
        formData.Add(new StringContent("11977776666"), "TelefoneCliente");
        formData.Add(new StringContent(nagô.Id.ToString()), "ServicoId");

        var listaRespostasJson = perguntasObrigatorias.Select(p => new RespostaJsonModel
        {
            PerguntaServicoId = p.Id,
            OpcaoPerguntaId = p.Opcoes.FirstOrDefault()?.Id,
            ValorTexto = p.Opcoes.Count == 0 ? "Opção" : null
        }).ToList();

        formData.Add(new StringContent(JsonSerializer.Serialize(listaRespostasJson)), "RespostasJson");

        var bytesJpeg = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46 };
        foreach (var pFoto in perguntasFotosObrigatorias)
        {
            var conteudoArquivo = new ByteArrayContent(bytesJpeg);
            conteudoArquivo.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            formData.Add(conteudoArquivo, $"pergunta_{pFoto.Id}", "cabelo.jpg");
        }

        var respSolicitacao = await _client.PostAsync($"/api/publico/{registro.Slug}/solicitacoes", formData);
        var conteudoSol = await respSolicitacao.Content.ReadAsStringAsync();
        respSolicitacao.StatusCode.Should().Be(HttpStatusCode.Created, because: conteudoSol);
        var solicitacao = await respSolicitacao.Content.ReadFromJsonAsync<SolicitacaoOrcamentoResposta>();

        // 3. Trancista envia orçamento
        var criarOrcReq = new CriarOrcamentoRequisicao(
            SolicitacaoOrcamentoId: solicitacao!.Id,
            ValorFinal: 180.00m,
            ValorSinal: 90.00m,
            ValorMaterial: 30.00m,
            DescricaoMaterial: "Fibra inclusa",
            FormasPagamento: "Pix",
            Observacoes: null,
            ValidadeDias: 5
        );
        var respOrc = await _client.PostAsJsonAsync("/api/orcamentos", criarOrcReq);
        var conteudoOrc = await respOrc.Content.ReadAsStringAsync();
        respOrc.StatusCode.Should().Be(HttpStatusCode.Created, because: conteudoOrc);
        var orcamento = await respOrc.Content.ReadFromJsonAsync<OrcamentoResposta>();
        orcamento.Should().NotBeNull();
        orcamento!.TokenPublico.Should().NotBeNullOrWhiteSpace();

        // 4. Cliente aceita orçamento
        await _client.PostAsync($"/api/publico/orcamentos/{orcamento!.TokenPublico}/aceitar", null);

        // 5. Cliente consulta horários disponíveis para o dia seguinte
        var dataAmanha = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var respDisp = await _client.GetAsync($"/api/publico/{registro.Slug}/agenda/disponibilidade?servicoId={nagô.Id}&data={dataAmanha:yyyy-MM-dd}");
        respDisp.StatusCode.Should().Be(HttpStatusCode.OK);
        var disp = await respDisp.Content.ReadFromJsonAsync<DisponibilidadeDiaResposta>();
        disp.Should().NotBeNull();
        disp!.Slots.Should().NotBeEmpty();

        var primeiroSlotDisponivel = disp.Slots.FirstOrDefault(s => s.Disponivel);
        primeiroSlotDisponivel.Should().NotBeNull();

        // 6. Cliente realiza o agendamento
        var agendarReq = new CriarAgendamentoPublicoRequisicao(
            TokenOrcamento: orcamento.TokenPublico,
            HorarioInicio: primeiroSlotDisponivel!.HorarioInicio,
            Observacoes: "Chegarei 10 minutos antes."
        );

        var respAgendamento = await _client.PostAsJsonAsync("/api/publico/agendamentos", agendarReq);
        var conteudoErro = await respAgendamento.Content.ReadAsStringAsync();
        respAgendamento.StatusCode.Should().Be(HttpStatusCode.Created, because: conteudoErro);
        var agendamento = await respAgendamento.Content.ReadFromJsonAsync<AgendamentoResposta>();
        agendamento.Should().NotBeNull();
        agendamento!.NomeCliente.Should().Be("Valéria Santos");
        agendamento.Status.Should().Be(StatusAgendamento.Agendado);

        // 7. Trancista lista e confirma o agendamento no painel
        var respListarAgenda = await _client.GetAsync("/api/agendamentos");
        respListarAgenda.StatusCode.Should().Be(HttpStatusCode.OK);
        var agenda = await respListarAgenda.Content.ReadFromJsonAsync<List<AgendamentoResposta>>();
        agenda.Should().NotBeNull();
        agenda!.Should().Contain(a => a.Id == agendamento.Id);

        // Confirma
        var patchStatus = new AtualizarStatusAgendamentoRequisicao(StatusAgendamento.Confirmado, null);
        var respPatch = await _client.PatchAsJsonAsync($"/api/agendamentos/{agendamento.Id}/status", patchStatus);
        respPatch.StatusCode.Should().Be(HttpStatusCode.OK);
        var agendamentoConfirmado = await respPatch.Content.ReadFromJsonAsync<AgendamentoResposta>();
        agendamentoConfirmado!.Status.Should().Be(StatusAgendamento.Confirmado);
    }
}
