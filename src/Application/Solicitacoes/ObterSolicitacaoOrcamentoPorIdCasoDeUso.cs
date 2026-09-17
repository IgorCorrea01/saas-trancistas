using Aplicacao.Comum;
using Aplicacao.Solicitacoes.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Solicitacoes;

public class ObterSolicitacaoOrcamentoPorIdCasoDeUso
{
    private readonly IAppDbContext _context;

    public ObterSolicitacaoOrcamentoPorIdCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<SolicitacaoOrcamentoDetalhesResposta>> ExecutarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado<SolicitacaoOrcamentoDetalhesResposta>.Falha("Identificador da solicitação inválido.");

        var solicitacao = await _context.SolicitacoesOrcamento
            .Include(s => s.Cliente)
            .Include(s => s.Servico)
            .Include(s => s.Respostas)
                .ThenInclude(r => r.PerguntaServico)
            .Include(s => s.Respostas)
                .ThenInclude(r => r.OpcaoPergunta)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (solicitacao == null)
            return RespostaResultado<SolicitacaoOrcamentoDetalhesResposta>.Falha("Solicitação de orçamento não encontrada.");

        var clienteDto = new ClienteResumoResposta(
            solicitacao.ClienteId,
            solicitacao.Cliente?.Nome ?? string.Empty,
            solicitacao.Cliente?.Telefone ?? string.Empty,
            solicitacao.Cliente?.Email
        );

        var respostasDto = solicitacao.Respostas
            .Select(r => new RespostaSolicitacaoDetalhesResposta(
                r.Id,
                r.PerguntaServicoId,
                r.PerguntaServico?.Enunciado ?? string.Empty,
                r.PerguntaServico?.Tipo ?? Dominio.Enums.TipoPergunta.Texto,
                r.ValorTexto,
                r.OpcaoPerguntaId,
                r.OpcaoPergunta?.Texto,
                r.CaminhoArquivo,
                r.NomeArquivoOriginal
            ))
            .ToList();

        var detalhes = new SolicitacaoOrcamentoDetalhesResposta(
            solicitacao.Id,
            clienteDto,
            solicitacao.ServicoId,
            solicitacao.Servico?.Nome ?? string.Empty,
            solicitacao.Servico?.Descricao,
            solicitacao.Servico?.PrecoBase ?? 0m,
            solicitacao.Servico?.DuracaoEstimadaMinutos ?? 0,
            solicitacao.Status,
            solicitacao.Status.ToString(),
            solicitacao.ObservacoesCliente,
            solicitacao.DataCriacao,
            solicitacao.DataAtualizacao,
            respostasDto
        );

        return RespostaResultado<SolicitacaoOrcamentoDetalhesResposta>.Ok(detalhes);
    }
}
