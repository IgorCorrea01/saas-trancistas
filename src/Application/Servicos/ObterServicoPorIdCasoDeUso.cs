using Aplicacao.Comum;
using Aplicacao.Servicos.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Servicos;

public class ObterServicoPorIdCasoDeUso
{
    private readonly IAppDbContext _context;

    public ObterServicoPorIdCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<ServicoDetalhesResposta>> ExecutarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado<ServicoDetalhesResposta>.Falha("Identificador do serviço inválido.");

        var servico = await _context.Servicos
            .Include(s => s.Perguntas.OrderBy(p => p.Ordem))
                .ThenInclude(p => p.Opcoes.OrderBy(o => o.Ordem))
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (servico == null)
            return RespostaResultado<ServicoDetalhesResposta>.Falha("Serviço não encontrado.");

        var perguntasDto = servico.Perguntas
            .OrderBy(p => p.Ordem)
            .Select(p => new PerguntaServicoResposta(
                p.Id,
                p.Enunciado,
                p.DescricaoAjuda,
                p.Tipo,
                p.Tipo.ToString(),
                p.Obrigatoria,
                p.Ordem,
                p.Opcoes.OrderBy(o => o.Ordem).Select(o => new OpcaoPerguntaResposta(o.Id, o.Texto, o.Ordem)).ToList()
            )).ToList();

        var resposta = new ServicoDetalhesResposta(
            servico.Id,
            servico.Nome,
            servico.Descricao,
            servico.PrecoBase,
            servico.DuracaoEstimadaMinutos,
            servico.Ativo,
            servico.DataCriacao,
            servico.DataAtualizacao,
            perguntasDto
        );

        return RespostaResultado<ServicoDetalhesResposta>.Ok(resposta);
    }
}
