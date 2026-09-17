using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class ListarBloqueiosAgendaCasoDeUso
{
    private readonly IAppDbContext _context;

    public ListarBloqueiosAgendaCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<IReadOnlyList<BloqueioAgendaResposta>>> ExecutarAsync(
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.BloqueiosAgenda.AsNoTracking();

        if (dataInicio.HasValue)
        {
            query = query.Where(b => b.DataInicio >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(b => b.DataFim <= dataFim.Value);
        }

        var bloqueios = await query
            .OrderBy(b => b.DataInicio)
            .Select(b => new BloqueioAgendaResposta(
                b.Id,
                b.DataInicio,
                b.DataFim,
                b.Motivo,
                b.DataCriacao
            ))
            .ToListAsync(cancellationToken);

        return RespostaResultado<IReadOnlyList<BloqueioAgendaResposta>>.Ok(bloqueios);
    }
}
