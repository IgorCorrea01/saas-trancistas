using Aplicacao.Comum;
using Aplicacao.Servicos.DTOs;
using Dominio.Entidades;

namespace Aplicacao.Servicos;

public class CriarServicoCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public CriarServicoCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<ServicoResposta>> ExecutarAsync(CriarServicoRequisicao requisicao, CancellationToken cancellationToken = default)
    {
        if (!_contextoEmpresa.EmpresaId.HasValue)
            return RespostaResultado<ServicoResposta>.Falha("Nenhuma empresa identificada no contexto da requisição.");

        if (requisicao == null)
            return RespostaResultado<ServicoResposta>.Falha("Dados da requisição inválidos.");

        if (string.IsNullOrWhiteSpace(requisicao.Nome))
            return RespostaResultado<ServicoResposta>.Falha("O nome do serviço é obrigatório.");

        if (requisicao.PrecoBase < 0)
            return RespostaResultado<ServicoResposta>.Falha("O preço base não pode ser negativo.");

        if (requisicao.DuracaoEstimadaMinutos <= 0)
            return RespostaResultado<ServicoResposta>.Falha("A duração estimada deve ser maior que zero.");

        var servico = new Servico(
            _contextoEmpresa.EmpresaId.Value,
            requisicao.Nome,
            requisicao.Descricao,
            requisicao.PrecoBase,
            requisicao.DuracaoEstimadaMinutos
        );

        _context.Servicos.Add(servico);
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

        return RespostaResultado<ServicoResposta>.Ok(resposta, "Serviço de trança criado com sucesso.");
    }
}
