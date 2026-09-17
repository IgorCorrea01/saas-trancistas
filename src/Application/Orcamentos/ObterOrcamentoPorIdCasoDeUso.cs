using Aplicacao.Comum;
using Aplicacao.Orcamentos.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Orcamentos;

public class ObterOrcamentoPorIdCasoDeUso
{
    private readonly IAppDbContext _context;

    public ObterOrcamentoPorIdCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<OrcamentoResposta>> ExecutarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado<OrcamentoResposta>.Falha("Identificador do orçamento inválido.");

        var orcamento = await _context.Orcamentos
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (orcamento == null)
            return RespostaResultado<OrcamentoResposta>.Falha("Orçamento não encontrado.");

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
