using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Comum;
using Aplicacao.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Autenticacao;

public class AutenticarUsuarioCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IServicoCriptografia _servicoCriptografia;
    private readonly ITokenJwtService _tokenJwtService;

    public AutenticarUsuarioCasoDeUso(
        IAppDbContext context,
        IServicoCriptografia servicoCriptografia,
        ITokenJwtService tokenJwtService)
    {
        _context = context;
        _servicoCriptografia = servicoCriptografia;
        _tokenJwtService = tokenJwtService;
    }

    public async Task<RespostaResultado<LoginResposta>> ExecutarAsync(LoginRequisicao requisicao, CancellationToken cancellationToken = default)
    {
        if (requisicao == null)
            return RespostaResultado<LoginResposta>.Falha("Requisição inválida.");

        if (string.IsNullOrWhiteSpace(requisicao.Email) || string.IsNullOrWhiteSpace(requisicao.Senha))
            return RespostaResultado<LoginResposta>.Falha("E-mail e senha são obrigatórios.");

        var emailNormalizado = requisicao.Email.Trim().ToLowerInvariant();

        // Busca o usuário sem filtro de tenant (pois o usuário ainda não está autenticado)
        var usuario = await _context.Usuarios
            .IgnoreQueryFilters()
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Email == emailNormalizado, cancellationToken);

        if (usuario == null)
            return RespostaResultado<LoginResposta>.Falha("Credenciais inválidas ou conta inativa.");

        if (!usuario.Ativo)
            return RespostaResultado<LoginResposta>.Falha("Usuário inativo. Entre em contato com o suporte.");

        if (usuario.Empresa == null || !usuario.Empresa.Ativa)
            return RespostaResultado<LoginResposta>.Falha("A empresa vinculada está desativada.");

        // Valida senha criptografada
        var senhaValida = _servicoCriptografia.Verificar(requisicao.Senha, usuario.SenhaHash);
        if (!senhaValida)
            return RespostaResultado<LoginResposta>.Falha("Credenciais inválidas ou conta inativa.");

        // Gera token JWT
        var (token, expiraEm) = _tokenJwtService.GerarToken(usuario, usuario.Empresa);

        var resposta = new LoginResposta(
            token,
            expiraEm,
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            usuario.EmpresaId,
            usuario.Empresa.Nome
        );

        return RespostaResultado<LoginResposta>.Ok(resposta, "Autenticação realizada com sucesso.");
    }
}
