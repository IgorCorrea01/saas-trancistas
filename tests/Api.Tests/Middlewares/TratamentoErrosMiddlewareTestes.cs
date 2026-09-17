using System.IO;
using System.Text.Json;
using Api.Middlewares;
using Api.Modelos;
using Dominio.Comum;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Api.Testes.Middlewares;

public class TratamentoErrosMiddlewareTestes
{
    private readonly ILogger<TratamentoErrosMiddleware> _logger = Substitute.For<ILogger<TratamentoErrosMiddleware>>();
    private readonly IHostEnvironment _environment = Substitute.For<IHostEnvironment>();

    [Fact]
    public async Task Deve_Retornar_400_BadRequest_Com_Tipo_Dominio_Quando_ExcecaoDominio_Ocorrer()
    {
        // Arrange
        _environment.EnvironmentName.Returns("Production");
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        var middleware = new TratamentoErrosMiddleware(
            _ => throw new ExcecaoDominio("Regra de teste violada."),
            _logger,
            _environment
        );

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(400);
        context.Response.ContentType.Should().Be("application/json");

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        var conteudo = await reader.ReadToEndAsync();

        var respostaErro = JsonSerializer.Deserialize<RespostaErro>(conteudo, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        respostaErro.Should().NotBeNull();
        respostaErro!.Tipo.Should().Be("dominio");
        respostaErro.Mensagem.Should().Be("Regra de teste violada.");
    }
}
