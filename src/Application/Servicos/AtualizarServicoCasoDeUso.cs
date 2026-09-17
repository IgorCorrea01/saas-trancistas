using Aplicacao.Comum;
using Aplicacao.Servicos.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Servicos;

public class AtualizarServicoCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public AtualizarServicoCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<ServicoResposta>> ExecutarAsync(Guid id, AtualizarServicoRequisicao requisicao, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado<ServicoResposta>.Falha("Identificador do serviço inválido.");

        if (requisicao == null)
            return RespostaResultado<ServicoResposta>.Falha("Dados da requisição inválidos.");

        if (string.IsNullOrWhiteSpace(requisicao.Nome))
            return RespostaResultado<ServicoResposta>.Falha("O nome do serviço é obrigatório.");

        if (requisicao.PrecoBase < 0)
            return RespostaResultado<ServicoResposta>.Falha("O preço base não pode ser negativo.");

        if (requisicao.DuracaoEstimadaMinutos <= 0)
            return RespostaResultado<ServicoResposta>.Falha("A duração estimada deve ser maior que zero.");

        var servico = await _context.Servicos
            .Include(s => s.Perguntas)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (servico == null)
            return RespostaResultado<ServicoResposta>.Falha("Serviço não encontrado.");

        servico.AtualizarDados(
            requisicao.Nome,
            requisicao.Descricao,
            requisicao.PrecoBase,
            requisicao.DuracaoEstimadaMinutos
        );

        await _context.SaveChangesAsync(cancellationToken);

        var resposta = new ServicoResposta(
            servico.Id,
            servico.Nome,
            servico.Descricao,
            servico.PrecoBase,
            servico.DuracaoEstimadaMinutos,
            servico.Ativo,
            servico.Perguntas.Count,
            servico.DataCriacao
        );

        return RespostaResultado<ServicoResposta>.Ok(resposta, "Serviço atualizado com sucesso.");
    }
}
