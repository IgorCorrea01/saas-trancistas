using Dominio.Comum;

namespace Dominio.Entidades;

public class Usuario : EntidadeBase, IEntidadeEmpresa
{
    public Guid EmpresaId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public bool Ativo { get; private set; }

    // Relacionamento de navegação opcional para EF Core
    public virtual Empresa? Empresa { get; private set; }

    // EF Core
    protected Usuario() : base() { }

    public Usuario(Guid empresaId, string nome, string email, string senhaHash) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirNome(nome);
        DefinirEmail(email);
        DefinirSenhaHash(senhaHash);
        Ativo = true;
    }

    public Usuario(Guid id, Guid empresaId, string nome, string email, string senhaHash, bool ativo = true) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirNome(nome);
        DefinirEmail(email);
        DefinirSenhaHash(senhaHash);
        Ativo = ativo;
    }

    public void AtualizarPerfil(string nome, string email)
    {
        DefinirNome(nome);
        DefinirEmail(email);
        RegistrarAtualizacao();
    }

    public void AlterarSenha(string novaSenhaHash)
    {
        DefinirSenhaHash(novaSenhaHash);
        RegistrarAtualizacao();
    }

    public void Ativar()
    {
        Ativo = true;
        RegistrarAtualizacao();
    }

    public void Desativar()
    {
        Ativo = false;
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
            throw new ExcecaoDominio("O nome do usuário é obrigatório.");

        Nome = nome.Trim();
    }

    private void DefinirEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ExcecaoDominio("O e-mail do usuário é obrigatório.");

        if (!email.Contains('@') || !email.Contains('.'))
            throw new ExcecaoDominio("O e-mail informado é inválido.");

        Email = email.Trim().ToLowerInvariant();
    }

    private void DefinirSenhaHash(string senhaHash)
    {
        if (string.IsNullOrWhiteSpace(senhaHash))
            throw new ExcecaoDominio("O hash da senha é obrigatório.");

        SenhaHash = senhaHash;
    }
}
