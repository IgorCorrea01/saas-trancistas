using Dominio.Comum;

namespace Dominio.Entidades;

public class BloqueioAgenda : EntidadeBase, IEntidadeEmpresa
{
    public Guid EmpresaId { get; private set; }
    public DateTime DataInicio { get; private set; }
    public DateTime DataFim { get; private set; }
    public string Motivo { get; private set; } = string.Empty;

    // EF Core
    protected BloqueioAgenda() : base() { }

    public BloqueioAgenda(
        Guid empresaId,
        DateTime dataInicio,
        DateTime dataFim,
        string motivo) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirPeriodo(dataInicio, dataFim);
        DefinirMotivo(motivo);
    }

    public BloqueioAgenda(
        Guid id,
        Guid empresaId,
        DateTime dataInicio,
        DateTime dataFim,
        string motivo) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirPeriodo(dataInicio, dataFim);
        DefinirMotivo(motivo);
    }

    public bool ConflitaCom(DateTime inicio, DateTime fim)
    {
        return DataInicio < fim && DataFim > inicio;
    }

    public void Atualizar(DateTime dataInicio, DateTime dataFim, string motivo)
    {
        DefinirPeriodo(dataInicio, dataFim);
        DefinirMotivo(motivo);
        RegistrarAtualizacao();
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirPeriodo(DateTime dataInicio, DateTime dataFim)
    {
        if (dataFim <= dataInicio)
            throw new ExcecaoDominio("O horário de término do bloqueio deve ser posterior ao horário de início.");

        DataInicio = dataInicio;
        DataFim = dataFim;
    }

    private void DefinirMotivo(string motivo)
    {
        if (string.IsNullOrWhiteSpace(motivo))
            throw new ExcecaoDominio("O motivo do bloqueio de agenda é obrigatório.");

        Motivo = motivo.Trim();
    }
}
