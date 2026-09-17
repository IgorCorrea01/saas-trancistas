using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Dashboard.DTOs;
using FluentAssertions;
using Xunit;

namespace Api.Testes.Integracao;

public class DashboardEndpointTestes : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public DashboardEndpointTestes(CustomWebApplicationFactory factory)
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
    public async Task Deve_Retornar_Metricas_E_Visao_Geral_Do_Dashboard_Para_Trancista_Autenticada()
    {
        // Arrange
        var (_, _) = await CriarTrancistaAutenticadaAsync("DashboardTest");

        // Act
        var resposta = await _client.GetAsync("/api/dashboard");

        // Assert
        resposta.StatusCode.Should().Be(HttpStatusCode.OK);
        var dashboard = await resposta.Content.ReadFromJsonAsync<DashboardResumoResposta>();
        dashboard.Should().NotBeNull();
        dashboard!.Metricas.Should().NotBeNull();
        dashboard.ProximosAgendamentos.Should().NotBeNull();
        dashboard.UltimasSolicitacoes.Should().NotBeNull();
    }

    [Fact]
    public async Task Nao_Deve_Permitir_Acesso_Ao_Dashboard_Sem_Autenticacao()
    {
        // Arrange: Cliente não autenticado
        var clienteAnonimo = new CustomWebApplicationFactory().CreateClient();

        // Act
        var resposta = await clienteAnonimo.GetAsync("/api/dashboard");

        // Assert
        resposta.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
