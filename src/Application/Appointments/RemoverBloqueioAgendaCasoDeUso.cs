using Aplicacao.Comum;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class RemoverBloqueioAgendaCasoDeUso
{
    private readonly IAppDbContext _context;

    public RemoverBloqueioAgendaCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado> ExecutarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado.Falha("Identificador do bloqueio inválido.");

        var bloqueio = await _context.BloqueiosAgenda
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (bloqueio == null)
            return RespostaResultado.Falha("Bloqueio de agenda não encontrado.");

        _context.BloqueiosAgenda.Remove(bloqueio);
        await _context.SaveChangesAsync(cancellationToken);

        return RespostaResultado.SucessoVazio("Bloqueio de agenda removido com sucesso.");
    }
}
