namespace Api.Modelos;

public class RespostaErro
{
    public string Tipo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public IReadOnlyList<string> Erros { get; set; } = Array.Empty<string>();

    public RespostaErro() { }

    public RespostaErro(string tipo, string mensagem, IEnumerable<string>? erros = null)
    {
        Tipo = tipo;
        Mensagem = mensagem;
        Erros = erros?.ToList() ?? new List<string>();
    }
}
