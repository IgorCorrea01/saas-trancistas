using Aplicacao.Comum;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Solicitacoes;

public class AtualizarStatusSolicitacaoCasoDeUso
{
    private readonly IAppDbContext _context;

    public AtualizarStatusSolicitacaoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado> ExecutarAsync(Guid id, StatusSolicitacaoOrcamento novoStatus, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado.Falha("Identificador da solicitação inválido.");

        var solicitacao = await _context.SolicitacoesOrcamento
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (solicitacao == null)
            return RespostaResultado.Falha("Solicitação de orçamento não encontrada.");

        switch (novoStatus)
        {
            case StatusSolicitacaoOrcamento.EmAnalise:
                solicitacao.IniciarAnalise();
                break;
            case StatusSolicitacaoOrcamento.Cancelada:
                solicitacao.Cancelar();
                break;
            default:
                return RespostaResultado.Falha("Transição de status não suportada diretamente por esta ação.");
        }

        await _context.SaveChangesAsync(cancellationToken);
        return RespostaResultado.SucessoVazio($"Status da solicitação atualizado para '{novoStatus}'.");
    }
}
