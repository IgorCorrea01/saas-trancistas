using Aplicacao.Interfaces;
using Dominio.Comum;
using Microsoft.Extensions.Configuration;

namespace Infraestrutura.Armazenamento;

public class ArmazenamentoArquivosLocal : IArmazenamentoArquivos
{
    private readonly string _diretorioBase;
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

    public ArmazenamentoArquivosLocal(IConfiguration configuration)
    {
        var caminhoConfig = configuration["Armazenamento:DiretorioLocal"];
        _diretorioBase = !string.IsNullOrWhiteSpace(caminhoConfig)
            ? Path.GetFullPath(caminhoConfig)
            : Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "uploads");

        if (!Directory.Exists(_diretorioBase))
        {
            Directory.CreateDirectory(_diretorioBase);
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

        // Validação de assinatura mágica de imagem
        var bufferAssinatura = new byte[8];
        var posicaoOriginal = fluxoArquivo.Position;
        var bytesLidos = await fluxoArquivo.ReadAsync(bufferAssinatura.AsMemory(0, 8), cancellationToken);
        fluxoArquivo.Position = posicaoOriginal;

        if (!ValidarAssinaturaImagem(bufferAssinatura, extensao))
            throw new ExcecaoDominio("O arquivo enviado não é uma imagem válida.");

        var dataAtual = DateTime.UtcNow;
        var subdiretorio = Path.Combine(dataAtual.Year.ToString(), dataAtual.Month.ToString("D2"));
        var diretorioDestino = Path.Combine(_diretorioBase, subdiretorio);

        if (!Directory.Exists(diretorioDestino))
        {
            Directory.CreateDirectory(diretorioDestino);
        }

        var nomeArquivoSeguro = $"{Guid.NewGuid():N}{extensao.ToLowerInvariant()}";
        var caminhoCompleto = Path.Combine(diretorioDestino, nomeArquivoSeguro);

        using (var streamDestino = new FileStream(caminhoCompleto, FileMode.Create, FileAccess.Write))
        {
            await fluxoArquivo.CopyToAsync(streamDestino, cancellationToken);
        }

        var caminhoRelativo = Path.Combine(subdiretorio, nomeArquivoSeguro).Replace('\\', '/');
        return caminhoRelativo;
    }

    public Task RemoverAsync(string caminhoRelativo, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo))
            return Task.CompletedTask;

        var caminhoNormalizado = caminhoRelativo.Replace('/', Path.DirectorySeparatorChar);
        var caminhoCompleto = Path.Combine(_diretorioBase, caminhoNormalizado);

        if (File.Exists(caminhoCompleto))
        {
            File.Delete(caminhoCompleto);
        }

        return Task.CompletedTask;
    }

    public Task<(Stream Fluxo, string ContentType)?> ObterAsync(string caminhoRelativo, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo))
            return Task.FromResult<(Stream Fluxo, string ContentType)?>(null);

        var caminhoNormalizado = caminhoRelativo.Replace('/', Path.DirectorySeparatorChar);
        var caminhoCompleto = Path.Combine(_diretorioBase, caminhoNormalizado);

        if (!File.Exists(caminhoCompleto))
            return Task.FromResult<(Stream Fluxo, string ContentType)?>(null);

        var extensao = Path.GetExtension(caminhoCompleto);
        var contentType = ContentTypesPermitidos.TryGetValue(extensao, out var mime) ? mime : "application/octet-stream";

        Stream stream = new FileStream(caminhoCompleto, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<(Stream Fluxo, string ContentType)?>((stream, contentType));
    }

    private static bool ValidarAssinaturaImagem(byte[] bytes, string extensao)
    {
        if (bytes.Length < 4) return false;

        // JPEG: FF D8 FF
        if (extensao.Equals(".jpg", StringComparison.OrdinalIgnoreCase) || extensao.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
        {
            return bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
        }

        // PNG: 89 50 4E 47
        if (extensao.Equals(".png", StringComparison.OrdinalIgnoreCase))
        {
            return bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        }

        // WEBP: RIFF....WEBP
        if (extensao.Equals(".webp", StringComparison.OrdinalIgnoreCase))
        {
            return bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46;
        }

        return false;
    }
}
