using Dominio.Comum;
using Dominio.Enums;

namespace Dominio.Entidades;

public class Agendamento : EntidadeBase, IEntidadeEmpresa
{
    public Guid EmpresaId { get; private set; }
    public Guid ClienteId { get; private set; }
    public Guid ServicoId { get; private set; }
    public Guid? OrcamentoId { get; private set; }
    public DateTime DataInicio { get; private set; }
    public DateTime DataFim { get; private set; }
    public StatusAgendamento Status { get; private set; }
    public string? Observacoes { get; private set; }

    // Relacionamentos EF Core
    public virtual Cliente? Cliente { get; private set; }
    public virtual Servico? Servico { get; private set; }
    public virtual Orcamento? Orcamento { get; private set; }

    // EF Core
    protected Agendamento() : base() { }

    public Agendamento(
        Guid empresaId,
        Guid clienteId,
        Guid servicoId,
        DateTime dataInicio,
        DateTime dataFim,
        Guid? orcamentoId = null,
        string? observacoes = null) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirClienteId(clienteId);
        DefinirServicoId(servicoId);
        DefinirPeriodo(dataInicio, dataFim);

        OrcamentoId = orcamentoId;
        Observacoes = observacoes?.Trim();
        Status = StatusAgendamento.Agendado;
    }

    public Agendamento(
        Guid id,
        Guid empresaId,
        Guid clienteId,
        Guid servicoId,
        DateTime dataInicio,
        DateTime dataFim,
        StatusAgendamento status,
        Guid? orcamentoId = null,
        string? observacoes = null) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirClienteId(clienteId);
        DefinirServicoId(servicoId);
        DefinirPeriodo(dataInicio, dataFim);

        OrcamentoId = orcamentoId;
        Status = status;
        Observacoes = observacoes?.Trim();
    }

    public void Confirmar()
    {
        if (Status == StatusAgendamento.Cancelado)
            throw new ExcecaoDominio("Não é possível confirmar um agendamento que foi cancelado.");

        if (Status == StatusAgendamento.Concluido)
            throw new ExcecaoDominio("Este agendamento já foi concluído.");

        Status = StatusAgendamento.Confirmado;
        RegistrarAtualizacao();
    }

    public void Concluir()
    {
        if (Status == StatusAgendamento.Cancelado)
            throw new ExcecaoDominio("Não é possível concluir um agendamento cancelado.");

        Status = StatusAgendamento.Concluido;
        RegistrarAtualizacao();
    }

    public void Cancelar(string? motivo = null)
    {
        if (Status == StatusAgendamento.Concluido)
            throw new ExcecaoDominio("Não é possível cancelar um agendamento já concluído.");

        Status = StatusAgendamento.Cancelado;
        if (!string.IsNullOrWhiteSpace(motivo))
        {
            Observacoes = string.IsNullOrWhiteSpace(Observacoes)
                ? $"Cancelado: {motivo.Trim()}"
                : $"{Observacoes} | Cancelado: {motivo.Trim()}";
        }

        RegistrarAtualizacao();
    }

    public void MarcarNaoCompareceu()
    {
        if (Status == StatusAgendamento.Concluido || Status == StatusAgendamento.Cancelado)
            throw new ExcecaoDominio("Não é possível marcar falta em um agendamento concluído ou cancelado.");

        Status = StatusAgendamento.NaoCompareceu;
        RegistrarAtualizacao();
    }

    public void Remarcar(DateTime novaDataInicio, DateTime novaDataFim)
    {
        if (Status == StatusAgendamento.Concluido || Status == StatusAgendamento.Cancelado)
            throw new ExcecaoDominio("Não é possível remarcar um agendamento concluído ou cancelado.");

        DefinirPeriodo(novaDataInicio, novaDataFim);
        Status = StatusAgendamento.Agendado;
        RegistrarAtualizacao();
    }

    public bool ConflitaCom(DateTime inicio, DateTime fim)
    {
        // Se o agendamento foi cancelado, não gera conflito na agenda
        if (Status == StatusAgendamento.Cancelado)
            return false;

        // Há sobreposição se o início é antes do fim do outro e o fim é depois do início do outro
        return DataInicio < fim && DataFim > inicio;
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirClienteId(Guid clienteId)
    {
        if (clienteId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da cliente é obrigatório.");

        ClienteId = clienteId;
    }

    private void DefinirServicoId(Guid servicoId)
    {
        if (servicoId == Guid.Empty)
            throw new ExcecaoDominio("O identificador do serviço é obrigatório.");

        ServicoId = servicoId;
    }

    private void DefinirPeriodo(DateTime dataInicio, DateTime dataFim)
    {
        if (dataFim <= dataInicio)
            throw new ExcecaoDominio("O horário de término deve ser posterior ao horário de início.");

        DataInicio = dataInicio;
        DataFim = dataFim;
    }
}
