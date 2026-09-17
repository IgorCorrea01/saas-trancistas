using Aplicacao.Comum;
using Aplicacao.Orcamentos.DTOs;
using Dominio.Entidades;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Orcamentos;

public class CriarOrcamentoCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public CriarOrcamentoCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<OrcamentoResposta>> ExecutarAsync(
        CriarOrcamentoRequisicao requisicao,
        CancellationToken cancellationToken = default)
    {
        if (!_contextoEmpresa.EmpresaId.HasValue)
            return RespostaResultado<OrcamentoResposta>.Falha("Nenhuma empresa identificada no contexto da requisição.");

        if (requisicao == null)
            return RespostaResultado<OrcamentoResposta>.Falha("Dados do orçamento inválidos.");

        if (requisicao.SolicitacaoOrcamentoId == Guid.Empty)
            return RespostaResultado<OrcamentoResposta>.Falha("O identificador da solicitação é obrigatório.");

        if (requisicao.ValorFinal <= 0)
            return RespostaResultado<OrcamentoResposta>.Falha("O valor final do orçamento deve ser maior que zero.");

        if (requisicao.ValorSinal < 0)
            return RespostaResultado<OrcamentoResposta>.Falha("O valor do sinal não pode ser negativo.");

        if (requisicao.ValorSinal > requisicao.ValorFinal)
            return RespostaResultado<OrcamentoResposta>.Falha("O valor do sinal não pode ser maior que o valor total do orçamento.");

        if (requisicao.ValorMaterial < 0)
            return RespostaResultado<OrcamentoResposta>.Falha("O valor do material não pode ser negativo.");

        if (requisicao.ValorMaterial > requisicao.ValorFinal)
            return RespostaResultado<OrcamentoResposta>.Falha("O valor do material não pode ser maior que o valor total do orçamento.");

        var validadeDias = requisicao.ValidadeDias <= 0 ? 3 : requisicao.ValidadeDias;
        var validade = DateTime.UtcNow.AddDays(validadeDias);

        // Busca a solicitação no tenant atual
        var solicitacao = await _context.SolicitacoesOrcamento
            .FirstOrDefaultAsync(s => s.Id == requisicao.SolicitacaoOrcamentoId, cancellationToken);

        if (solicitacao == null)
            return RespostaResultado<OrcamentoResposta>.Falha("Solicitação de orçamento não encontrada.");

        if (solicitacao.Status == StatusSolicitacaoOrcamento.Cancelada || solicitacao.Status == StatusSolicitacaoOrcamento.Expirada)
            return RespostaResultado<OrcamentoResposta>.Falha("Não é possível gerar orçamento para solicitação cancelada ou expirada.");

        // Verifica se já existe um orçamento ativo para esta solicitação
        var orcamentoExistente = await _context.Orcamentos
            .FirstOrDefaultAsync(o => o.SolicitacaoOrcamentoId == solicitacao.Id && o.Status == StatusOrcamento.Pendente, cancellationToken);

        if (orcamentoExistente != null)
        {
            // Cancela o anterior se for gerar um novo
            orcamentoExistente.Cancelar();
        }

        var orcamento = new Orcamento(
            _contextoEmpresa.EmpresaId.Value,
            solicitacao.Id,
            requisicao.ValorFinal,
            requisicao.ValorSinal,
            requisicao.ValorMaterial,
            requisicao.DescricaoMaterial,
            requisicao.FormasPagamento,
            requisicao.Observacoes,
            validade
        );

        _context.Orcamentos.Add(orcamento);

        // Atualiza status da solicitação para OrcamentoEnviado
        solicitacao.MarcarOrcamentoEnviado();

        await _context.SaveChangesAsync(cancellationToken);

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

        return RespostaResultado<OrcamentoResposta>.Ok(resposta, "Orçamento gerado com sucesso. Envie o link para a cliente!");
    }
}
