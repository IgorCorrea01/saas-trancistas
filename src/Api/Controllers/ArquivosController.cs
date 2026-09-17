using Aplicacao.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/arquivos")]
[AllowAnonymous]
public class ArquivosController : ControllerBase
{
    private readonly IArmazenamentoArquivos _armazenamentoArquivos;

    public ArquivosController(IArmazenamentoArquivos armazenamentoArquivos)
    {
        _armazenamentoArquivos = armazenamentoArquivos;
    }

    [HttpGet("{**caminho}")]
    public async Task<IActionResult> ObterArquivo(string caminho, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(caminho))
            return NotFound();

        var arquivo = await _armazenamentoArquivos.ObterAsync(caminho, cancellationToken);
        if (arquivo == null)
            return NotFound(new { tipo = "nao_encontrado", mensagem = "Arquivo de imagem não encontrado." });

        return File(arquivo.Value.Fluxo, arquivo.Value.ContentType);
    }
}
