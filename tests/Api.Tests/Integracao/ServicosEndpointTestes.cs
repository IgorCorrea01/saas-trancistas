using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Servicos.DTOs;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Api.Testes.Integracao;

public class ServicosEndpointTestes : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ServicosEndpointTestes(CustomWebApplicationFactory factory)
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
    public async Task Deve_Criar_Servico_De_Tranca_E_Configurar_Formulario_Com_Sucesso()
    {
        // Arrange
        var (registro, _) = await CriarTrancistaAutenticadaAsync("KnotlessExpert");

        // 1. Criar Serviço
        var criarReq = new CriarServicoRequisicao(
            Nome: "Knotless Braids Especial",
            Descricao: "Tranças sem nó com acabamento perfeito",
            PrecoBase: 350.00m,
            DuracaoEstimadaMinutos: 360
        );

        var respCriar = await _client.PostAsJsonAsync("/api/servicos", criarReq);
        respCriar.StatusCode.Should().Be(HttpStatusCode.Created);
        var servicoCriado = await respCriar.Content.ReadFromJsonAsync<ServicoResposta>();
        servicoCriado.Should().NotBeNull();
        servicoCriado!.Nome.Should().Be("Knotless Braids Especial");

        // 2. Configurar Formulário
        var configReq = new ConfigurarFormularioRequisicao(
            Perguntas: new List<PerguntaServicoRequisicao>
            {
                new(
                    Enunciado: "Qual o comprimento?",
                    DescricaoAjuda: null,
                    Tipo: TipoPergunta.EscolhaUnica,
                    Obrigatoria: true,
                    Ordem: 1,
                    Opcoes: new List<OpcaoPerguntaRequisicao>
                    {
                        new("Chanel", 1),
                        new("Longo", 2)
                    }
                ),
                new(
                    Enunciado: "Envie foto do cabelo atual",
                    DescricaoAjuda: null,
                    Tipo: TipoPergunta.Arquivo,
                    Obrigatoria: true,
                    Ordem: 2,
                    Opcoes: null
                )
            }
        );

        var respConfig = await _client.PutAsJsonAsync($"/api/servicos/{servicoCriado.Id}/formulario", configReq);
        respConfig.StatusCode.Should().Be(HttpStatusCode.OK);

        var detalhes = await respConfig.Content.ReadFromJsonAsync<ServicoDetalhesResposta>();
        detalhes.Should().NotBeNull();
        detalhes!.Perguntas.Should().HaveCount(2);

        // 3. Catálogo Público para Clientes
        var respPublico = await _client.GetAsync($"/api/publico/{registro.Slug}/servicos");
        respPublico.StatusCode.Should().Be(HttpStatusCode.OK);

        var catalogo = await respPublico.Content.ReadFromJsonAsync<List<ServicoDetalhesResposta>>();
        catalogo.Should().NotBeNull();
        catalogo!.Should().Contain(s => s.Id == servicoCriado.Id);
    }

    [Fact]
    public async Task Deve_Gerar_Catalogo_Padrao_De_Trancas_Automaticamente()
    {
        // Arrange
        var (_, _) = await CriarTrancistaAutenticadaAsync("TemplateTest");

        // Act
        var resposta = await _client.PostAsync("/api/servicos/gerar-padrao", null);

        // Assert
        resposta.StatusCode.Should().Be(HttpStatusCode.OK);
        var servicos = await resposta.Content.ReadFromJsonAsync<List<ServicoResposta>>();
        servicos.Should().NotBeNull();
        servicos!.Should().HaveCountGreaterThanOrEqualTo(4);
        servicos.Should().Contain(s => s.Nome.Contains("Box Braids"));
        servicos.Should().Contain(s => s.Nome.Contains("Nagô"));
    }

    [Fact]
    public async Task Deve_Garantir_Isolamento_MultiTenant_Entre_Trancistas()
    {
        // Arrange: Trancista 1 cria um serviço
        var (reg1, _) = await CriarTrancistaAutenticadaAsync("TrancistaUm");
        var criarReq = new CriarServicoRequisicao("Trança Exclusiva da Trancista 1", "Desc", 400m, 300);
        var respCriar = await _client.PostAsJsonAsync("/api/servicos", criarReq);
        var servico1 = await respCriar.Content.ReadFromJsonAsync<ServicoResposta>();

        // Arrange: Trancista 2 se autentica
        var (reg2, _) = await CriarTrancistaAutenticadaAsync("TrancistaDois");

        // Act: Trancista 2 tenta acessar o serviço da Trancista 1
        var respObter = await _client.GetAsync($"/api/servicos/{servico1!.Id}");

        // Assert: Deve retornar 404 Not Found devido ao filtro de tenant
        respObter.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
