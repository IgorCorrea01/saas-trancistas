using System.Net;
using System.Text.Json;
using Api.Modelos;
using Dominio.Comum;

namespace Api.Middlewares;

public class TratamentoErrosMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TratamentoErrosMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public TratamentoErrosMiddleware(
        RequestDelegate _next,
        ILogger<TratamentoErrosMiddleware> logger,
        IHostEnvironment environment)
    {
        this._next = _next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await TratarExcecaoAsync(context, ex);
        }
    }

    private async Task TratarExcecaoAsync(HttpContext context, Exception exception)
    {
        var codigoStatus = HttpStatusCode.InternalServerError;
        var resposta = new RespostaErro();

        switch (exception)
        {
            case ExcecaoDominio exDominio:
                codigoStatus = HttpStatusCode.BadRequest;
                resposta.Tipo = "dominio";
                resposta.Mensagem = exDominio.Message;
                _logger.LogWarning(exception, "Regra de domínio violada: {Mensagem}", exDominio.Message);
                break;

            case ArgumentException exArgumento:
                codigoStatus = HttpStatusCode.BadRequest;
                resposta.Tipo = "validacao";
                resposta.Mensagem = exArgumento.Message;
                _logger.LogWarning(exception, "Parâmetro ou validação inválida: {Mensagem}", exArgumento.Message);
                break;

            case KeyNotFoundException exNaoEncontrado:
                codigoStatus = HttpStatusCode.NotFound;
                resposta.Tipo = "nao_encontrado";
                resposta.Mensagem = exNaoEncontrado.Message;
                _logger.LogWarning(exception, "Recurso não encontrado: {Mensagem}", exNaoEncontrado.Message);
                break;

            case UnauthorizedAccessException exAcesso:
                codigoStatus = HttpStatusCode.Unauthorized;
                resposta.Tipo = "nao_autorizado";
                resposta.Mensagem = exAcesso.Message;
                _logger.LogWarning(exception, "Acesso não autorizado: {Mensagem}", exAcesso.Message);
                break;

            default:
                codigoStatus = HttpStatusCode.InternalServerError;
                resposta.Tipo = "erro_interno";
                resposta.Mensagem = "Ocorreu um erro interno inesperado ao processar a requisição.";

                if (_environment.IsDevelopment())
                {
                    resposta.Erros = new[] { exception.ToString() };
                }

                _logger.LogError(exception, "Erro não tratado capturado pelo middleware global: {Mensagem}", exception.Message);
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)codigoStatus;

        var jsonOpcoes = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var resultadoJson = JsonSerializer.Serialize(resposta, jsonOpcoes);
        await context.Response.WriteAsync(resultadoJson);
    }
}
