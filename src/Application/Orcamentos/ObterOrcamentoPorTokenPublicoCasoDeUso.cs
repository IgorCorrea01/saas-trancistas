using Aplicacao.Comum;
using Aplicacao.Orcamentos.DTOs;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Orcamentos;

public class ObterOrcamentoPorTokenPublicoCasoDeUso
{
    private readonly IAppDbContext _context;

    public ObterOrcamentoPorTokenPublicoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<OrcamentoPublicoResposta>> ExecutarAsync(string tokenPublico, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(tokenPublico))
            return RespostaResultado<OrcamentoPublicoResposta>.Falha("Token público do orçamento inválido.");

        var tokenLimpo = tokenPublico.Trim();

        // Consulta pública (ignora query filters de tenant pois cliente não possui JWT de login)
        var orcamento = await _context.Orcamentos
            .IgnoreQueryFilters()
            .Include(o => o.SolicitacaoOrcamento)
                .ThenInclude(s => s!.Cliente)
            .Include(o => o.SolicitacaoOrcamento)
                .ThenInclude(s => s!.Servico)
            .FirstOrDefaultAsync(o => o.TokenPublico == tokenLimpo, cancellationToken);

        if (orcamento == null)
            return RespostaResultado<OrcamentoPublicoResposta>.Falha("Orçamento não encontrado.");

        orcamento.VerificarExpiracao();

        // Busca dados da empresa
        var empresa = await _context.Empresas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Id == orcamento.EmpresaId, cancellationToken);

        var solicitacao = orcamento.SolicitacaoOrcamento;
        var cliente = solicitacao?.Cliente;
        var servico = solicitacao?.Servico;

        var expirado = orcamento.Status == StatusOrcamento.Expirado || DateTime.UtcNow > orcamento.Validade;

        var resposta = new OrcamentoPublicoResposta(
            orcamento.TokenPublico,
            empresa?.Nome ?? "Studio de Tranças",
            empresa?.Slug,
            cliente?.Nome ?? "Cliente",
            servico?.Nome ?? "Serviço de Tranças",
            servico?.Descricao,
            servico?.DuracaoEstimadaMinutos ?? 0,
            orcamento.ValorFinal,
            orcamento.ValorSinal,
            orcamento.ValorMaterial,
            orcamento.ValorRestanteNoAtendimento,
            orcamento.DescricaoMaterial,
            orcamento.FormasPagamento,
            orcamento.Observacoes,
            orcamento.Validade,
            expirado,
            orcamento.Status,
            orcamento.Status.ToString(),
            orcamento.DataCriacao
        );

        return RespostaResultado<OrcamentoPublicoResposta>.Ok(resposta);
    }
}
