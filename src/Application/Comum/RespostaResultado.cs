namespace Aplicacao.Comum;

public class RespostaResultado<T>
{
    public bool Sucesso { get; }
    public T? Dados { get; }
    public string? Mensagem { get; }
    public IReadOnlyList<string> Erros { get; }

    protected RespostaResultado(bool sucesso, T? dados, string? mensagem, IEnumerable<string>? erros = null)
    {
        Sucesso = sucesso;
        Dados = dados;
        Mensagem = mensagem;
        Erros = erros?.ToList() ?? new List<string>();
    }

    public static RespostaResultado<T> Ok(T dados, string? mensagem = null)
        => new(true, dados, mensagem);

    public static RespostaResultado<T> Falha(string mensagem, IEnumerable<string>? erros = null)
        => new(false, default, mensagem, erros);

    public static RespostaResultado<T> Falha(string erro)
        => new(false, default, erro, new[] { erro });
}

public class RespostaResultado : RespostaResultado<object>
{
    private RespostaResultado(bool sucesso, string? mensagem, IEnumerable<string>? erros = null)
        : base(sucesso, null, mensagem, erros)
    {
    }

    public static RespostaResultado SucessoVazio(string? mensagem = null)
        => new(true, mensagem);

    public static new RespostaResultado Falha(string mensagem, IEnumerable<string>? erros = null)
        => new(false, mensagem, erros);

    public static new RespostaResultado Falha(string erro)
        => new(false, erro, new[] { erro });
}
