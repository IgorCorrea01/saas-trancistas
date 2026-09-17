using Aplicacao.Comum;
using Aplicacao.Orcamentos.DTOs;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Orcamentos;

public class RecusarOrcamentoPublicoCasoDeUso
{
    private readonly IAppDbContext _context;

    public RecusarOrcamentoPublicoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<DecisaoOrcamentoResposta>> ExecutarAsync(string tokenPublico, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(tokenPublico))
            return RespostaResultado<DecisaoOrcamentoResposta>.Falha("Token público inválido.");

        var tokenLimpo = tokenPublico.Trim();

        var orcamento = await _context.Orcamentos
            .IgnoreQueryFilters()
            .Include(o => o.SolicitacaoOrcamento)
            .FirstOrDefaultAsync(o => o.TokenPublico == tokenLimpo, cancellationToken);

        if (orcamento == null)
            return RespostaResultado<DecisaoOrcamentoResposta>.Falha("Orçamento não encontrado.");

        orcamento.VerificarExpiracao();

        if (orcamento.Status == StatusOrcamento.Expirado)
            return RespostaResultado<DecisaoOrcamentoResposta>.Falha("Este orçamento já expirou.");

        if (orcamento.Status == StatusOrcamento.Aceito)
            return RespostaResultado<DecisaoOrcamentoResposta>.Falha("Não é possível recusar um orçamento que já foi aceito.");

        if (orcamento.Status == StatusOrcamento.Recusado)
            return RespostaResultado<DecisaoOrcamentoResposta>.Ok(new DecisaoOrcamentoResposta(
                true,
                "Orçamento já havia sido recusado.",
                StatusOrcamento.Recusado,
                StatusOrcamento.Recusado.ToString(),
                ProntoParaAgendamento: false
            ));

        if (orcamento.Status != StatusOrcamento.Pendente)
            return RespostaResultado<DecisaoOrcamentoResposta>.Falha($"Não é possível recusar um orçamento com status '{orcamento.Status}'.");

        orcamento.Recusar();

        if (orcamento.SolicitacaoOrcamento != null)
        {
            orcamento.SolicitacaoOrcamento.MarcarOrcamentoRecusado();
        }

        await _context.SaveChangesAsync(cancellationToken);

        var resposta = new DecisaoOrcamentoResposta(
            true,
            "Orçamento recusado. Caso deseje um novo orçamento com outras opções ou modelos, entre em contato com a profissional.",
            StatusOrcamento.Recusado,
            StatusOrcamento.Recusado.ToString(),
            ProntoParaAgendamento: false
        );

        return RespostaResultado<DecisaoOrcamentoResposta>.Ok(resposta);
    }
}
