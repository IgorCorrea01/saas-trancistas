using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class CriarBloqueioAgendaCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public CriarBloqueioAgendaCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<BloqueioAgendaResposta>> ExecutarAsync(
        CriarBloqueioAgendaRequisicao requisicao,
        CancellationToken cancellationToken = default)
    {
        if (!_contextoEmpresa.EmpresaId.HasValue)
            return RespostaResultado<BloqueioAgendaResposta>.Falha("Nenhuma empresa identificada no contexto da requisição.");

        if (requisicao == null)
            return RespostaResultado<BloqueioAgendaResposta>.Falha("Dados da requisição inválidos.");

        if (string.IsNullOrWhiteSpace(requisicao.Motivo))
            return RespostaResultado<BloqueioAgendaResposta>.Falha("O motivo do bloqueio é obrigatório.");

        if (requisicao.DataFim <= requisicao.DataInicio)
            return RespostaResultado<BloqueioAgendaResposta>.Falha("A data/hora de término do bloqueio deve ser após a data/hora de início.");

        var bloqueio = new BloqueioAgenda(
            _contextoEmpresa.EmpresaId.Value,
            requisicao.DataInicio.ToUniversalTime(),
            requisicao.DataFim.ToUniversalTime(),
            requisicao.Motivo
        );

        _context.BloqueiosAgenda.Add(bloqueio);
        await _context.SaveChangesAsync(cancellationToken);

        var resposta = new BloqueioAgendaResposta(
            bloqueio.Id,
            bloqueio.DataInicio,
            bloqueio.DataFim,
            bloqueio.Motivo,
            bloqueio.DataCriacao
        );

        return RespostaResultado<BloqueioAgendaResposta>.Ok(resposta, "Bloqueio de agenda criado com sucesso.");
    }
}
