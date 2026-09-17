namespace Aplicacao.Interfaces;

public interface IServicoCriptografia
{
    string GerarHash(string texto);
    bool Verificar(string texto, string hash);
}
