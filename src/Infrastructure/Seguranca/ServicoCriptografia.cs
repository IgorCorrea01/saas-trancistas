using Aplicacao.Interfaces;

namespace Infraestrutura.Seguranca;

public class ServicoCriptografia : IServicoCriptografia
{
    public string GerarHash(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            throw new ArgumentException("O texto para geração de hash não pode ser vazio.", nameof(texto));

        return BCrypt.Net.BCrypt.HashPassword(texto);
    }

    public bool Verificar(string texto, string hash)
    {
        if (string.IsNullOrWhiteSpace(texto) || string.IsNullOrWhiteSpace(hash))
            return false;

        return BCrypt.Net.BCrypt.Verify(texto, hash);
    }
}
