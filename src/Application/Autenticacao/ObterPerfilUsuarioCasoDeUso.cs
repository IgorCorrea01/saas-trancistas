using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Comum;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Autenticacao;

public class ObterPerfilUsuarioCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ObterPerfilUsuarioCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<UsuarioPerfilResposta>> ExecutarAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        if (usuarioId == Guid.Empty)
            return RespostaResultado<UsuarioPerfilResposta>.Falha("Identificador do usuário inválido.");

        // O filtro de tenant já isola os usuários da empresa autenticada
        var usuario = await _context.Usuarios
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Id == usuarioId, cancellationToken);

        if (usuario == null)
            return RespostaResultado<UsuarioPerfilResposta>.Falha("Usuário não encontrado.");

        var resposta = new UsuarioPerfilResposta(
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            usuario.Ativo,
            usuario.EmpresaId,
            usuario.Empresa?.Nome ?? string.Empty,
            usuario.Empresa?.Slug ?? string.Empty
        );

        return RespostaResultado<UsuarioPerfilResposta>.Ok(resposta);
    }
}
