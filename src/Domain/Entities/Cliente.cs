using Dominio.Comum;

namespace Dominio.Entidades;

public class Cliente : EntidadeBase, IEntidadeEmpresa
{
    public Guid EmpresaId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Telefone { get; private set; } = string.Empty;
    public string? Email { get; private set; }

    // EF Core
    protected Cliente() : base() { }

    public Cliente(Guid empresaId, string nome, string telefone, string? email = null) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirNome(nome);
        DefinirTelefone(telefone);
        DefinirEmail(email);
    }

    public Cliente(Guid id, Guid empresaId, string nome, string telefone, string? email = null) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirNome(nome);
        DefinirTelefone(telefone);
        DefinirEmail(email);
    }

    public void AtualizarContato(string nome, string telefone, string? email)
    {
        DefinirNome(nome);
        DefinirTelefone(telefone);
        DefinirEmail(email);
        RegistrarAtualizacao();
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ExcecaoDominio("O nome da cliente é obrigatório.");

        Nome = nome.Trim();
    }

    private void DefinirTelefone(string telefone)
    {
        if (string.IsNullOrWhiteSpace(telefone))
            throw new ExcecaoDominio("O telefone/WhatsApp da cliente é obrigatório.");

        // Remove caracteres não numéricos para padronização
        var apenasDigitos = new string(telefone.Where(char.IsDigit).ToArray());
        if (apenasDigitos.Length < 10)
            throw new ExcecaoDominio("O telefone informado deve conter DDD e número válidos.");

        Telefone = apenasDigitos;
    }

    private void DefinirEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            Email = null;
            return;
        }

        if (!email.Contains('@') || !email.Contains('.'))
            throw new ExcecaoDominio("O e-mail informado é inválido.");

        Email = email.Trim().ToLowerInvariant();
    }
}
