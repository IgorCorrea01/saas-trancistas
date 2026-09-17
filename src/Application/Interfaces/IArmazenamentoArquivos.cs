namespace Aplicacao.Interfaces;

public interface IArmazenamentoArquivos
{
    Task<string> SalvarAsync(Stream fluxoArquivo, string nomeArquivoOriginal, string contentType, CancellationToken cancellationToken = default);
    Task RemoverAsync(string caminhoRelativo, CancellationToken cancellationToken = default);
    Task<(Stream Fluxo, string ContentType)?> ObterAsync(string caminhoRelativo, CancellationToken cancellationToken = default);
}
