using Amazon.S3;
using Amazon.S3.Model;
using Aplicacao.Interfaces;
using Dominio.Comum;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infraestrutura.Armazenamento;

public class ArmazenamentoArquivosS3 : IArmazenamentoArquivos
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<ArmazenamentoArquivosS3> _logger;
    private const long TamanhoMaximoBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly HashSet<string> ExtensoesPermitidas = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    private static readonly Dictionary<string, string> ContentTypesPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" },
        { ".webp", "image/webp" }
    };

    public ArmazenamentoArquivosS3(IConfiguration configuration, ILogger<ArmazenamentoArquivosS3> logger)
    {
        _logger = logger;
        _bucketName = configuration["Armazenamento:S3:BucketName"] ?? "trancas-fotos";

        var serviceUrl = configuration["Armazenamento:S3:ServiceUrl"];
        var accessKey = configuration["Armazenamento:S3:AccessKey"];
        var secretKey = configuration["Armazenamento:S3:SecretKey"];

        var s3Config = new AmazonS3Config
        {
            ForcePathStyle = true,
        };

        if (!string.IsNullOrWhiteSpace(serviceUrl))
        {
            s3Config.ServiceURL = serviceUrl;
        }

        if (!string.IsNullOrWhiteSpace(accessKey) && !string.IsNullOrWhiteSpace(secretKey))
        {
            _s3Client = new AmazonS3Client(accessKey, secretKey, s3Config);
        }
        else
        {
            _s3Client = new AmazonS3Client(s3Config);
        }
    }

    public async Task<string> SalvarAsync(Stream fluxoArquivo, string nomeArquivoOriginal, string contentType, CancellationToken cancellationToken = default)
    {
        if (fluxoArquivo == null || fluxoArquivo.Length == 0)
            throw new ExcecaoDominio("O arquivo enviado está vazio.");

        if (fluxoArquivo.Length > TamanhoMaximoBytes)
            throw new ExcecaoDominio("O arquivo ultrapassa o tamanho máximo permitido de 10 MB.");

        var extensao = Path.GetExtension(nomeArquivoOriginal);
        if (string.IsNullOrWhiteSpace(extensao) || !ExtensoesPermitidas.Contains(extensao))
            throw new ExcecaoDominio("Formato de arquivo não suportado. Formatos aceitos: JPG, PNG e WEBP.");

        var dataAtual = DateTime.UtcNow;
        var subdiretorio = $"{dataAtual.Year}/{dataAtual.Month:D2}";
        var nomeArquivoSeguro = $"{Guid.NewGuid():N}{extensao.ToLowerInvariant()}";
        var chaveObjeto = $"{subdiretorio}/{nomeArquivoSeguro}";

        var mimeType = ContentTypesPermitidos.TryGetValue(extensao, out var mime) ? mime : contentType;

        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = chaveObjeto,
            InputStream = fluxoArquivo,
            ContentType = mimeType,
            DisablePayloadSigning = true, // Obrigatório para Cloudflare R2
        };

        await _s3Client.PutObjectAsync(putRequest, cancellationToken);
        _logger.LogInformation("Arquivo salvo com sucesso no bucket S3/R2 '{Bucket}': {Key}", _bucketName, chaveObjeto);

        return chaveObjeto;
    }

    public async Task RemoverAsync(string caminhoRelativo, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo))
            return;

        try
        {
            var chaveObjeto = caminhoRelativo.Replace('\\', '/').TrimStart('/');
            await _s3Client.DeleteObjectAsync(_bucketName, chaveObjeto, cancellationToken);
            _logger.LogInformation("Arquivo removido do bucket S3/R2 '{Bucket}': {Key}", _bucketName, chaveObjeto);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao remover arquivo '{Key}' do bucket S3/R2.", caminhoRelativo);
        }
    }

    public async Task<(Stream Fluxo, string ContentType)?> ObterAsync(string caminhoRelativo, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo))
            return null;

        try
        {
            var chaveObjeto = caminhoRelativo.Replace('\\', '/').TrimStart('/');
            var response = await _s3Client.GetObjectAsync(_bucketName, chaveObjeto, cancellationToken);
            var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;

            var extensao = Path.GetExtension(chaveObjeto);
            var contentType = response.Headers.ContentType;
            if (string.IsNullOrWhiteSpace(contentType) && ContentTypesPermitidos.TryGetValue(extensao, out var mime))
            {
                contentType = mime;
            }

            return (memoryStream, contentType ?? "application/octet-stream");
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter arquivo '{Key}' do bucket S3/R2.", caminhoRelativo);
            return null;
        }
    }
}
