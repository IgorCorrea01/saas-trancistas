using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Api.Testes.Integracao;

public class SaudeEndpointTestes : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public SaudeEndpointTestes(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Deve_Retornar_200_Ok_No_Endpoint_De_Saude()
    {
        // Act
        var resposta = await _client.GetAsync("/api/saude");

        // Assert
        resposta.StatusCode.Should().Be(HttpStatusCode.OK);

        var conteudo = await resposta.Content.ReadAsStringAsync();
        var json = JsonDocument.Parse(conteudo);
        json.RootElement.GetProperty("status").GetString().Should().Be("Saudavel");
    }
}
