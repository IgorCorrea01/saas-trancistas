using Dominio.Comum;

namespace Dominio.Entidades;

public class Empresa : EntidadeBase
{
    public string Nome { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public bool Ativa { get; private set; }
    public string HorarioAbertura { get; private set; } = "08:00";
    public string HorarioFechamento { get; private set; } = "19:00";
    public string DiasFuncionamento { get; private set; } = "1,2,3,4,5,6"; // 1=Segunda a 6=Sábado, 0=Domingo
    public int IntervaloMinutos { get; private set; } = 60;

    // EF Core
    protected Empresa() : base() { }

    public Empresa(string nome, string slug) : base()
    {
        DefinirNome(nome);
        DefinirSlug(slug);
        Ativa = true;
        HorarioAbertura = "08:00";
        HorarioFechamento = "19:00";
        DiasFuncionamento = "1,2,3,4,5,6";
        IntervaloMinutos = 60;
    }

    public Empresa(Guid id, string nome, string slug, bool ativa = true) : base(id)
    {
        DefinirNome(nome);
        DefinirSlug(slug);
        Ativa = ativa;
        HorarioAbertura = "08:00";
        HorarioFechamento = "19:00";
        DiasFuncionamento = "1,2,3,4,5,6";
        IntervaloMinutos = 60;
    }

    public void Atualizar(
        string nome,
        string slug,
        string? horarioAbertura = null,
        string? horarioFechamento = null,
        string? diasFuncionamento = null,
        int? intervaloMinutos = null)
    {
        DefinirNome(nome);
        DefinirSlug(slug);

        if (!string.IsNullOrWhiteSpace(horarioAbertura))
            HorarioAbertura = horarioAbertura.Trim();

        if (!string.IsNullOrWhiteSpace(horarioFechamento))
            HorarioFechamento = horarioFechamento.Trim();

        if (!string.IsNullOrWhiteSpace(diasFuncionamento))
            DiasFuncionamento = diasFuncionamento.Trim();

        if (intervaloMinutos.HasValue && intervaloMinutos.Value > 0)
            IntervaloMinutos = intervaloMinutos.Value;

        RegistrarAtualizacao();
    }

    public void Ativar()
    {
        Ativa = true;
        RegistrarAtualizacao();
    }

    public void Desativar()
    {
        Ativa = false;
        RegistrarAtualizacao();
    }

    private void DefinirNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ExcecaoDominio("O nome da empresa é obrigatório.");

        Nome = nome.Trim();
    }

    private void DefinirSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ExcecaoDominio("O slug da empresa é obrigatório.");

        Slug = slug.Trim().ToLowerInvariant();
    }
}
