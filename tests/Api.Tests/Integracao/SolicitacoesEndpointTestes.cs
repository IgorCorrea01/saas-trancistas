using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Controllers;
using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Servicos.DTOs;
using Aplicacao.Solicitacoes.DTOs;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Api.Testes.Integracao;

public class SolicitacoesEndpointTestes : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SolicitacoesEndpointTestes(CustomWebApplicationFactory factory)
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
    public async Task Deve_Enviar_Solicitacao_Publica_E_Gerenciar_Pelo_Painel_Da_Trancista()
    {
        // 1. Arrange: Trancista se cadastra e gera catálogo de serviços
        var (registro, _) = await CriarTrancistaAutenticadaAsync("SolicitacaoFlow");
        await _client.PostAsync("/api/servicos/gerar-padrao", null);

        // Obtém catálogo público para pegar o ID do serviço e da pergunta
        var respCatalogo = await _client.GetAsync($"/api/publico/{registro.Slug}/servicos");
        var servicos = await respCatalogo.Content.ReadFromJsonAsync<List<ServicoDetalhesResposta>>();
        servicos.Should().NotBeNull();
        var boxBraids = servicos!.First(s => s.Nome.Contains("Box Braids"));

        var perguntasObrigatorias = boxBraids.Perguntas.Where(p => p.Obrigatoria && p.Tipo != TipoPergunta.Arquivo).ToList();
        var pFoto = boxBraids.Perguntas.First(p => p.Tipo == TipoPergunta.Arquivo);

        // 2. Act: Cliente envia solicitação com respostas e foto válida (JPEG com magic bytes FF D8 FF)
        using var formData = new MultipartFormDataContent();
        formData.Add(new StringContent("Juliana Mendes"), "NomeCliente");
        formData.Add(new StringContent("11987654321"), "TelefoneCliente");
        formData.Add(new StringContent("juliana@gmail.com"), "EmailCliente");
        formData.Add(new StringContent(boxBraids.Id.ToString()), "ServicoId");
        formData.Add(new StringContent("Tenho disponibilidade nas quintas-feiras."), "ObservacoesCliente");

        var listaRespostasJson = new List<RespostaJsonModel>();
        foreach (var p in perguntasObrigatorias)
        {
            if (p.Opcoes.Count > 0)
            {
                listaRespostasJson.Add(new RespostaJsonModel
                {
                    PerguntaServicoId = p.Id,
                    OpcaoPerguntaId = p.Opcoes.First().Id
                });
            }
            else
            {
                listaRespostasJson.Add(new RespostaJsonModel
                {
                    PerguntaServicoId = p.Id,
                    ValorTexto = "Resposta de teste"
                });
            }
        }

        var respostasJson = JsonSerializer.Serialize(listaRespostasJson);
        formData.Add(new StringContent(respostasJson), "RespostasJson");

        // Simula imagem JPEG válida com magic bytes FF D8 FF E0
        var bytesJpegValidos = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46 };
        var conteudoArquivo = new ByteArrayContent(bytesJpegValidos);
        conteudoArquivo.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        formData.Add(conteudoArquivo, $"pergunta_{pFoto.Id}", "cabelo_atual.jpg");

        var respEnvio = await _client.PostAsync($"/api/publico/{registro.Slug}/solicitacoes", formData);
        respEnvio.StatusCode.Should().Be(HttpStatusCode.Created);

        var solicitacaoCriada = await respEnvio.Content.ReadFromJsonAsync<SolicitacaoOrcamentoResposta>();
        solicitacaoCriada.Should().NotBeNull();
        solicitacaoCriada!.NomeCliente.Should().Be("Juliana Mendes");
        solicitacaoCriada.Status.Should().Be(StatusSolicitacaoOrcamento.AguardandoAnalise);

        // 3. Act: Trancista lista solicitações autenticada
        var respListar = await _client.GetAsync("/api/solicitacoes-orcamento");
        respListar.StatusCode.Should().Be(HttpStatusCode.OK);
        var lista = await respListar.Content.ReadFromJsonAsync<List<SolicitacaoOrcamentoResposta>>();
        lista.Should().NotBeNull();
        lista!.Should().Contain(s => s.Id == solicitacaoCriada.Id);

        // 4. Act: Trancista visualiza detalhes com foto
        var respDetalhes = await _client.GetAsync($"/api/solicitacoes-orcamento/{solicitacaoCriada.Id}");
        respDetalhes.StatusCode.Should().Be(HttpStatusCode.OK);
        var detalhes = await respDetalhes.Content.ReadFromJsonAsync<SolicitacaoOrcamentoDetalhesResposta>();
        detalhes.Should().NotBeNull();
        detalhes!.Respostas.Should().HaveCountGreaterThanOrEqualTo(2);
        detalhes.Respostas.Should().Contain(r => !string.IsNullOrEmpty(r.CaminhoArquivo));

        // 5. Act: Trancista atualiza status para 'EmAnalise'
        var patchReq = new AtualizarStatusSolicitacaoRequisicao(StatusSolicitacaoOrcamento.EmAnalise);
        var respPatch = await _client.PatchAsJsonAsync($"/api/solicitacoes-orcamento/{solicitacaoCriada.Id}/status", patchReq);
        respPatch.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Deve_Garantir_Isolamento_MultiTenant_Em_Solicitacoes()
    {
        // Arrange: Trancista 1 e Trancista 2
        var (reg1, _) = await CriarTrancistaAutenticadaAsync("TrancistaSolicitacao1");
        await _client.PostAsync("/api/servicos/gerar-padrao", null);

        var respCatalogo = await _client.GetAsync($"/api/publico/{reg1.Slug}/servicos");
        var servicos = await respCatalogo.Content.ReadFromJsonAsync<List<ServicoDetalhesResposta>>();
        var servico = servicos!.First();

        // Cliente envia solicitação para Trancista 1
        using var formData = new MultipartFormDataContent();
        formData.Add(new StringContent("Cliente da Trancista 1"), "NomeCliente");
        formData.Add(new StringContent("11911112222"), "TelefoneCliente");
        formData.Add(new StringContent(servico.Id.ToString()), "ServicoId");

        var respEnvio = await _client.PostAsync($"/api/publico/{reg1.Slug}/solicitacoes", formData);
        var solicitacao1 = await respEnvio.Content.ReadFromJsonAsync<SolicitacaoOrcamentoResposta>();

        // Arrange: Trancista 2 se autentica
        var (reg2, _) = await CriarTrancistaAutenticadaAsync("TrancistaSolicitacao2");

        // Act: Trancista 2 tenta acessar a solicitação da Trancista 1
        var respObter = await _client.GetAsync($"/api/solicitacoes-orcamento/{solicitacao1!.Id}");

        // Assert: Trancista 2 não pode ver dados da Trancista 1
        respObter.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
