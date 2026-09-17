using Aplicacao.Comum;
using Aplicacao.Servicos.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Servicos;

public class AlternarStatusServicoCasoDeUso
{
    private readonly IAppDbContext _context;

    public AlternarStatusServicoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<ServicoResposta>> ExecutarAsync(Guid id, bool ativar, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado<ServicoResposta>.Falha("Identificador do serviço inválido.");

        var servico = await _context.Servicos
            .Include(s => s.Perguntas)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (servico == null)
            return RespostaResultado<ServicoResposta>.Falha("Serviço não encontrado.");

        if (ativar)
            servico.Ativar();
        else
            servico.Desativar();

        await _context.SaveChangesAsync(cancellationToken);

        var resposta = new ServicoResposta(
            servico.Id,
            servico.Nome,
            servico.Descricao,
            servico.PrecoBase,
            servico.DuracaoEstimadaMinutos,
            servico.Ativo,
            servico.Perguntas.Count,
            servico.DataCriacao
        );

        return RespostaResultado<ServicoResposta>.Ok(resposta, ativar ? "Serviço ativado com sucesso." : "Serviço desativado com sucesso.");
    }
}
