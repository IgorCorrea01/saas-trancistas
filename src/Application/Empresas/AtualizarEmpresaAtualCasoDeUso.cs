using Aplicacao.Comum;
using Aplicacao.Empresas.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Empresas;

public class AtualizarEmpresaAtualCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public AtualizarEmpresaAtualCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<EmpresaResposta>> ExecutarAsync(AtualizarEmpresaRequisicao requisicao, CancellationToken cancellationToken = default)
    {
        if (!_contextoEmpresa.EmpresaId.HasValue)
            return RespostaResultado<EmpresaResposta>.Falha("Nenhuma empresa identificada no contexto da requisição.");

        if (requisicao == null)
            return RespostaResultado<EmpresaResposta>.Falha("Dados da requisição inválidos.");

        if (string.IsNullOrWhiteSpace(requisicao.Nome))
            return RespostaResultado<EmpresaResposta>.Falha("O nome da empresa é obrigatório.");

        if (string.IsNullOrWhiteSpace(requisicao.Slug))
            return RespostaResultado<EmpresaResposta>.Falha("O slug da empresa é obrigatório.");

        var slugNormalizado = requisicao.Slug.Trim().ToLowerInvariant();

        // Verifica se outra empresa já utiliza esse slug
        var slugEmUso = await _context.Empresas
            .IgnoreQueryFilters()
            .AnyAsync(e => e.Slug == slugNormalizado && e.Id != _contextoEmpresa.EmpresaId.Value, cancellationToken);

        if (slugEmUso)
            return RespostaResultado<EmpresaResposta>.Falha("Este slug já está em uso por outra empresa.");

        var empresa = await _context.Empresas
            .FirstOrDefaultAsync(e => e.Id == _contextoEmpresa.EmpresaId.Value, cancellationToken);

        if (empresa == null)
            return RespostaResultado<EmpresaResposta>.Falha("Empresa não encontrada.");

        empresa.Atualizar(
            requisicao.Nome,
            slugNormalizado,
            requisicao.HorarioAbertura,
            requisicao.HorarioFechamento,
            requisicao.DiasFuncionamento,
            requisicao.IntervaloMinutos
        );
        await _context.SaveChangesAsync(cancellationToken);

        var resposta = new EmpresaResposta(
            empresa.Id,
            empresa.Nome,
            empresa.Slug,
            empresa.Ativa,
            empresa.HorarioAbertura,
            empresa.HorarioFechamento,
            empresa.DiasFuncionamento,
            empresa.IntervaloMinutos,
            empresa.DataCriacao,
            empresa.DataAtualizacao
        );

        return RespostaResultado<EmpresaResposta>.Ok(resposta, "Dados da empresa atualizados com sucesso.");
    }
}
