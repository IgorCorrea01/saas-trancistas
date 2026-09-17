using Aplicacao.Comum;
using Aplicacao.Orcamentos.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Orcamentos;

public class ObterOrcamentoPorSolicitacaoIdCasoDeUso
{
    private readonly IAppDbContext _context;

    public ObterOrcamentoPorSolicitacaoIdCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<OrcamentoResposta>> ExecutarAsync(Guid solicitacaoId, CancellationToken cancellationToken = default)
    {
        if (solicitacaoId == Guid.Empty)
            return RespostaResultado<OrcamentoResposta>.Falha("Identificador da solicitação inválido.");

        var orcamento = await _context.Orcamentos
            .OrderByDescending(o => o.DataCriacao)
            .FirstOrDefaultAsync(o => o.SolicitacaoOrcamentoId == solicitacaoId, cancellationToken);

        if (orcamento == null)
            return RespostaResultado<OrcamentoResposta>.Falha("Nenhum orçamento encontrado para esta solicitação.");

        orcamento.VerificarExpiracao();

        var urlPublica = $"/publico/orcamentos/{orcamento.TokenPublico}";

        var resposta = new OrcamentoResposta(
            orcamento.Id,
            orcamento.SolicitacaoOrcamentoId,
            orcamento.ValorFinal,
            orcamento.ValorSinal,
            orcamento.ValorMaterial,
            orcamento.ValorRestanteNoAtendimento,
            orcamento.DescricaoMaterial,
            orcamento.FormasPagamento,
            orcamento.Observacoes,
            orcamento.Validade,
            orcamento.TokenPublico,
            urlPublica,
            orcamento.Status,
            orcamento.Status.ToString(),
            orcamento.DataCriacao
        );

        return RespostaResultado<OrcamentoResposta>.Ok(resposta);
    }
}
