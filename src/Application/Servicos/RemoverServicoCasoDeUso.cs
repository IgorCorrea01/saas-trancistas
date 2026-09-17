using Aplicacao.Comum;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Servicos;

public class RemoverServicoCasoDeUso
{
    private readonly IAppDbContext _context;

    public RemoverServicoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado> ExecutarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado.Falha("Identificador do serviço inválido.");

        var servico = await _context.Servicos
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (servico == null)
            return RespostaResultado.Falha("Serviço não encontrado.");

        _context.Servicos.Remove(servico);
        await _context.SaveChangesAsync(cancellationToken);

        return RespostaResultado.SucessoVazio("Serviço removido com sucesso.");
    }
}
