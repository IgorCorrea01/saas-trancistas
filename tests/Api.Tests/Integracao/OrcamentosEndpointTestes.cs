using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Controllers;
using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Orcamentos.DTOs;
using Aplicacao.Servicos.DTOs;
using Aplicacao.Solicitacoes.DTOs;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Api.Testes.Integracao;

public class OrcamentosEndpointTestes : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public OrcamentosEndpointTestes(CustomWebApplicationFactory factory)
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
    public async Task Deve_Executar_Fluxo_Completo_De_Criacao_E_Aceite_De_Orcamento()
    {
        // 1. Trancista se registra e gera serviços
        var (registro, _) = await CriarTrancistaAutenticadaAsync("OrcamentoFlow");
        await _client.PostAsync("/api/servicos/gerar-padrao", null);

        var respCatalogo = await _client.GetAsync($"/api/publico/{registro.Slug}/servicos");
        var servicos = await respCatalogo.Content.ReadFromJsonAsync<List<ServicoDetalhesResposta>>();
        var boxBraids = servicos!.First(s => s.Nome.Contains("Box Braids"));

        var perguntasObrigatorias = boxBraids.Perguntas.Where(p => p.Obrigatoria && p.Tipo != TipoPergunta.Arquivo).ToList();
        var pFoto = boxBraids.Perguntas.First(p => p.Tipo == TipoPergunta.Arquivo);

        // 2. Cliente envia solicitação pública
        using var formData = new MultipartFormDataContent();
        formData.Add(new StringContent("Tatiana Souza"), "NomeCliente");
        formData.Add(new StringContent("11988887777"), "TelefoneCliente");
        formData.Add(new StringContent(boxBraids.Id.ToString()), "ServicoId");

        var listaRespostasJson = perguntasObrigatorias.Select(p => new RespostaJsonModel
        {
            PerguntaServicoId = p.Id,
            OpcaoPerguntaId = p.Opcoes.FirstOrDefault()?.Id,
            ValorTexto = p.Opcoes.Count == 0 ? "Opção" : null
        }).ToList();

        formData.Add(new StringContent(JsonSerializer.Serialize(listaRespostasJson)), "RespostasJson");

        var bytesJpeg = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46 };
        var conteudoArquivo = new ByteArrayContent(bytesJpeg);
        conteudoArquivo.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        formData.Add(conteudoArquivo, $"pergunta_{pFoto.Id}", "cabelo.jpg");

        var respSolicitacao = await _client.PostAsync($"/api/publico/{registro.Slug}/solicitacoes", formData);
        respSolicitacao.StatusCode.Should().Be(HttpStatusCode.Created);
        var solicitacao = await respSolicitacao.Content.ReadFromJsonAsync<SolicitacaoOrcamentoResposta>();

        // 3. Trancista avalia e gera orçamento com 50% de sinal e material
        var criarOrcamentoReq = new CriarOrcamentoRequisicao(
            SolicitacaoOrcamentoId: solicitacao!.Id,
            ValorFinal: 360.00m,
            ValorSinal: 180.00m,
            ValorMaterial: 80.00m,
            DescricaoMaterial: "3 pacotes de Jumbo Ser Mulher cor 1B",
            FormasPagamento: "Sinal via Pix chave: 11988887777. Restante no cartão ou dinheiro.",
            Observacoes: "Chegar com cabelo limpo.",
            ValidadeDias: 3
        );

        var respCriarOrcamento = await _client.PostAsJsonAsync("/api/orcamentos", criarOrcamentoReq);
        respCriarOrcamento.StatusCode.Should().Be(HttpStatusCode.Created);

        var orcamento = await respCriarOrcamento.Content.ReadFromJsonAsync<OrcamentoResposta>();
        orcamento.Should().NotBeNull();
        orcamento!.ValorFinal.Should().Be(360.00m);
        orcamento.ValorSinal.Should().Be(180.00m);
        orcamento.ValorRestanteNoAtendimento.Should().Be(180.00m);
        orcamento.TokenPublico.Should().NotBeNullOrWhiteSpace();

        // 4. Cliente visualiza proposta pública via Token
        var respPublicoOrcamento = await _client.GetAsync($"/api/publico/orcamentos/{orcamento.TokenPublico}");
        respPublicoOrcamento.StatusCode.Should().Be(HttpStatusCode.OK);
        var orcamentoPublico = await respPublicoOrcamento.Content.ReadFromJsonAsync<OrcamentoPublicoResposta>();
        orcamentoPublico.Should().NotBeNull();
        orcamentoPublico!.ValorFinal.Should().Be(360.00m);
        orcamentoPublico.ValorSinal.Should().Be(180.00m);
        orcamentoPublico.ValorRestanteNoAtendimento.Should().Be(180.00m);
        orcamentoPublico.Status.Should().Be(StatusOrcamento.Pendente);

        // 5. Cliente aceita proposta pública
        var respAceite = await _client.PostAsync($"/api/publico/orcamentos/{orcamento.TokenPublico}/aceitar", null);
        respAceite.StatusCode.Should().Be(HttpStatusCode.OK);
        var decisao = await respAceite.Content.ReadFromJsonAsync<DecisaoOrcamentoResposta>();
        decisao.Should().NotBeNull();
        decisao!.NovoStatus.Should().Be(StatusOrcamento.Aceito);
        decisao.ProntoParaAgendamento.Should().BeTrue();
    }

    [Fact]
    public async Task Deve_Garantir_Isolamento_MultiTenant_Em_Orcamentos()
    {
        // Arrange: Trancista 1 cria orçamento
        var (reg1, _) = await CriarTrancistaAutenticadaAsync("TrancistaOrc1");
        await _client.PostAsync("/api/servicos/gerar-padrao", null);

        var respCatalogo = await _client.GetAsync($"/api/publico/{reg1.Slug}/servicos");
        var servicos = await respCatalogo.Content.ReadFromJsonAsync<List<ServicoDetalhesResposta>>();
        var servico = servicos!.First();

        using var formData = new MultipartFormDataContent();
        formData.Add(new StringContent("Cliente T1"), "NomeCliente");
        formData.Add(new StringContent("11912345678"), "TelefoneCliente");
        formData.Add(new StringContent(servico.Id.ToString()), "ServicoId");

        var respSol = await _client.PostAsync($"/api/publico/{reg1.Slug}/solicitacoes", formData);
        var sol = await respSol.Content.ReadFromJsonAsync<SolicitacaoOrcamentoResposta>();

        var criarOrcReq = new CriarOrcamentoRequisicao(sol!.Id, 250m, 100m, 0, null, null, null, 3);
        var respOrc = await _client.PostAsJsonAsync("/api/orcamentos", criarOrcReq);
        var orc1 = await respOrc.Content.ReadFromJsonAsync<OrcamentoResposta>();

        // Arrange: Trancista 2 se autentica
        var (reg2, _) = await CriarTrancistaAutenticadaAsync("TrancistaOrc2");

        // Act: Trancista 2 tenta acessar o orçamento da Trancista 1
        var respObter = await _client.GetAsync($"/api/orcamentos/{orc1!.Id}");

        // Assert: Trancista 2 recebe 404 Not Found
        respObter.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
