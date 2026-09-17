using Aplicacao.Comum;
using Aplicacao.Empresas.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Empresas;

public class ObterEmpresaAtualCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ObterEmpresaAtualCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<EmpresaResposta>> ExecutarAsync(CancellationToken cancellationToken = default)
    {
        if (!_contextoEmpresa.EmpresaId.HasValue)
            return RespostaResultado<EmpresaResposta>.Falha("Nenhuma empresa identificada no contexto da requisição.");

        var empresa = await _context.Empresas
            .FirstOrDefaultAsync(e => e.Id == _contextoEmpresa.EmpresaId.Value, cancellationToken);

        if (empresa == null)
            return RespostaResultado<EmpresaResposta>.Falha("Empresa não encontrada.");

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

        return RespostaResultado<EmpresaResposta>.Ok(resposta);
    }
}
