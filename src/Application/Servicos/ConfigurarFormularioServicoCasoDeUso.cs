using Aplicacao.Comum;
using Aplicacao.Servicos.DTOs;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Servicos;

public class ConfigurarFormularioServicoCasoDeUso
{
    private readonly IAppDbContext _context;

    public ConfigurarFormularioServicoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<ServicoDetalhesResposta>> ExecutarAsync(Guid servicoId, ConfigurarFormularioRequisicao requisicao, CancellationToken cancellationToken = default)
    {
        if (servicoId == Guid.Empty)
            return RespostaResultado<ServicoDetalhesResposta>.Falha("Identificador do serviço inválido.");

        if (requisicao == null || requisicao.Perguntas == null)
            return RespostaResultado<ServicoDetalhesResposta>.Falha("Requisição de formulário inválida.");

        var servico = await _context.Servicos
            .Include(s => s.Perguntas)
                .ThenInclude(p => p.Opcoes)
            .FirstOrDefaultAsync(s => s.Id == servicoId, cancellationToken);

        if (servico == null)
            return RespostaResultado<ServicoDetalhesResposta>.Falha("Serviço não encontrado.");

        // Remove perguntas e opções existentes
        var perguntasAntigas = servico.Perguntas.ToList();
        servico.LimparPerguntas();
        if (perguntasAntigas.Count > 0)
        {
            _context.PerguntasServico.RemoveRange(perguntasAntigas);
        }

        // Adiciona novas perguntas e opções explicitamente no DbContext
        for (var i = 0; i < requisicao.Perguntas.Count; i++)
        {
            var pReq = requisicao.Perguntas[i];
            if (string.IsNullOrWhiteSpace(pReq.Enunciado))
                return RespostaResultado<ServicoDetalhesResposta>.Falha($"O enunciado da pergunta na posição {i + 1} é obrigatório.");

            var pergunta = servico.AdicionarPergunta(
                pReq.Enunciado,
                pReq.Tipo,
                pReq.Obrigatoria,
                pReq.Ordem == 0 ? i + 1 : pReq.Ordem,
                pReq.DescricaoAjuda
            );
            _context.PerguntasServico.Add(pergunta);

            if ((pReq.Tipo == TipoPergunta.EscolhaUnica || pReq.Tipo == TipoPergunta.MultiplasEscolhas) && pReq.Opcoes != null)
            {
                for (var j = 0; j < pReq.Opcoes.Count; j++)
                {
                    var oReq = pReq.Opcoes[j];
                    if (!string.IsNullOrWhiteSpace(oReq.Texto))
                    {
                        var opcao = pergunta.AdicionarOpcao(oReq.Texto, oReq.Ordem == 0 ? j + 1 : oReq.Ordem);
                        _context.OpcoesPergunta.Add(opcao);
                    }
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Monta DTO de retorno
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

        return RespostaResultado<ServicoDetalhesResposta>.Ok(resposta, "Formulário do serviço configurado com sucesso.");
    }
}
