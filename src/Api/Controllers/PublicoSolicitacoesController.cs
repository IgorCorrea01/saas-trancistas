using System.Text.Json;
using Aplicacao.Solicitacoes;
using Aplicacao.Solicitacoes.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/publico/{slugEmpresa}/solicitacoes")]
[AllowAnonymous]
public class PublicoSolicitacoesController : ControllerBase
{
    private readonly CriarSolicitacaoOrcamentoCasoDeUso _criarSolicitacaoOrcamentoCasoDeUso;

    public PublicoSolicitacoesController(CriarSolicitacaoOrcamentoCasoDeUso criarSolicitacaoOrcamentoCasoDeUso)
    {
        _criarSolicitacaoOrcamentoCasoDeUso = criarSolicitacaoOrcamentoCasoDeUso;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> EnviarSolicitacaoMultipart(
        string slugEmpresa,
        [FromForm] EnviarSolicitacaoFormModel formModel,
        CancellationToken cancellationToken)
    {
        if (formModel == null)
            return BadRequest(new { tipo = "validacao", mensagem = "Dados do formulário não fornecidos." });

        var respostasDeserializadas = new List<RespostaItemRequisicao>();

        // Deserializa lista de respostas de texto e opções enviadas como JSON string
        if (!string.IsNullOrWhiteSpace(formModel.RespostasJson))
        {
            try
            {
                var itensJson = JsonSerializer.Deserialize<List<RespostaJsonModel>>(formModel.RespostasJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (itensJson != null)
                {
                    foreach (var item in itensJson)
                    {
                        respostasDeserializadas.Add(new RespostaItemRequisicao(
                            item.PerguntaServicoId,
                            item.ValorTexto,
                            item.OpcaoPerguntaId,
                            null
                        ));
                    }
                }
            }
            catch (JsonException)
            {
                return BadRequest(new { tipo = "validacao", mensagem = "Formato de respostas JSON inválido." });
            }
        }

        // Mapeia fotos/arquivos enviados no multipart
        if (Request.Form.Files.Count > 0)
        {
            foreach (var file in Request.Form.Files)
            {
                // O nome do campo do arquivo no form pode ser o ID da pergunta (ex: "pergunta_1234..." ou o próprio Guid)
                var nomeCampo = file.Name.Replace("pergunta_", string.Empty).Replace("arquivo_", string.Empty);
                if (Guid.TryParse(nomeCampo, out var perguntaId))
                {
                    var stream = new MemoryStream();
                    await file.CopyToAsync(stream, cancellationToken);
                    stream.Position = 0;

                    var arquivoItem = new RespostaItemArquivo(
                        stream,
                        file.FileName,
                        file.ContentType
                    );

                    var respostaExistente = respostasDeserializadas.FirstOrDefault(r => r.PerguntaServicoId == perguntaId);
                    if (respostaExistente != null)
                    {
                        respostasDeserializadas.Remove(respostaExistente);
                    }

                    respostasDeserializadas.Add(new RespostaItemRequisicao(
                        perguntaId,
                        null,
                        null,
                        arquivoItem
                    ));
                }
            }
        }

        var requisicao = new CriarSolicitacaoPublicaRequisicao(
            formModel.NomeCliente,
            formModel.TelefoneCliente,
            formModel.EmailCliente,
            formModel.ServicoId,
            formModel.ObservacoesCliente,
            respostasDeserializadas
        );

        var resultado = await _criarSolicitacaoOrcamentoCasoDeUso.ExecutarAsync(slugEmpresa, requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Created(string.Empty, resultado.Dados);
    }
}

public class EnviarSolicitacaoFormModel
{
    public string NomeCliente { get; set; } = string.Empty;
    public string TelefoneCliente { get; set; } = string.Empty;
    public string? EmailCliente { get; set; }
    public Guid ServicoId { get; set; }
    public string? ObservacoesCliente { get; set; }
    public string? RespostasJson { get; set; }
}

public class RespostaJsonModel
{
    public Guid PerguntaServicoId { get; set; }
    public string? ValorTexto { get; set; }
    public Guid? OpcaoPerguntaId { get; set; }
}
