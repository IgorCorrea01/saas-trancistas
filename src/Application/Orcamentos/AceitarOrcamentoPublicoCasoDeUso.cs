using Aplicacao.Comum;
using Aplicacao.Orcamentos.DTOs;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Orcamentos;

public class AceitarOrcamentoPublicoCasoDeUso
{
    private readonly IAppDbContext _context;

    public AceitarOrcamentoPublicoCasoDeUso(IAppDbContext context)
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
            return RespostaResultado<DecisaoOrcamentoResposta>.Falha("Este orçamento já expirou e não pode ser aceito.");

        if (orcamento.Status == StatusOrcamento.Aceito)
            return RespostaResultado<DecisaoOrcamentoResposta>.Ok(new DecisaoOrcamentoResposta(
                true,
                "Orçamento já havia sido aceito.",
                StatusOrcamento.Aceito,
                StatusOrcamento.Aceito.ToString(),
                ProntoParaAgendamento: true
            ));

        if (orcamento.Status != StatusOrcamento.Pendente)
            return RespostaResultado<DecisaoOrcamentoResposta>.Falha($"Não é possível aceitar um orçamento com status '{orcamento.Status}'.");

        orcamento.Aceitar();

        if (orcamento.SolicitacaoOrcamento != null)
        {
            orcamento.SolicitacaoOrcamento.MarcarOrcamentoAceito();
        }

        await _context.SaveChangesAsync(cancellationToken);

        var resposta = new DecisaoOrcamentoResposta(
            true,
            "Orçamento aceito com sucesso! Agora você pode prosseguir para escolher a data e horário do seu agendamento.",
            StatusOrcamento.Aceito,
            StatusOrcamento.Aceito.ToString(),
            ProntoParaAgendamento: true
        );

        return RespostaResultado<DecisaoOrcamentoResposta>.Ok(resposta);
    }
}
