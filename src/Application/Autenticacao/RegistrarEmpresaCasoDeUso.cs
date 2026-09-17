using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Comum;
using Aplicacao.Interfaces;
using Dominio.Comum;
using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Autenticacao;

public class RegistrarEmpresaCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IServicoCriptografia _servicoCriptografia;
    private readonly ITokenJwtService _tokenJwtService;

    public RegistrarEmpresaCasoDeUso(
        IAppDbContext context,
        IServicoCriptografia servicoCriptografia,
        ITokenJwtService tokenJwtService)
    {
        _context = context;
        _servicoCriptografia = servicoCriptografia;
        _tokenJwtService = tokenJwtService;
    }

    public async Task<RespostaResultado<RegistrarEmpresaResposta>> ExecutarAsync(RegistrarEmpresaRequisicao requisicao, CancellationToken cancellationToken = default)
    {
        if (requisicao == null)
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("Requisição inválida.");

        if (string.IsNullOrWhiteSpace(requisicao.NomeEmpresa))
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("O nome da empresa é obrigatório.");

        if (string.IsNullOrWhiteSpace(requisicao.Slug))
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("O slug da empresa é obrigatório.");

        if (string.IsNullOrWhiteSpace(requisicao.NomeUsuario))
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("O nome do usuário é obrigatório.");

        if (string.IsNullOrWhiteSpace(requisicao.Email))
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("O e-mail do usuário é obrigatório.");

        if (string.IsNullOrWhiteSpace(requisicao.Senha) || requisicao.Senha.Length < 6)
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("A senha deve conter no mínimo 6 caracteres.");

        var slugNormalizado = requisicao.Slug.Trim().ToLowerInvariant();
        var emailNormalizado = requisicao.Email.Trim().ToLowerInvariant();

        // Verifica unicidade de slug
        var slugExiste = await _context.Empresas
            .IgnoreQueryFilters()
            .AnyAsync(e => e.Slug == slugNormalizado, cancellationToken);

        if (slugExiste)
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("Já existe uma empresa cadastrada com este slug.");

        // Verifica unicidade de e-mail
        var emailExiste = await _context.Usuarios
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == emailNormalizado, cancellationToken);

        if (emailExiste)
            return RespostaResultado<RegistrarEmpresaResposta>.Falha("Já existe um usuário cadastrado com este e-mail.");

        // Cria a Empresa
        var empresa = new Empresa(requisicao.NomeEmpresa, slugNormalizado);
        _context.Empresas.Add(empresa);

        // Cria o Usuário Administrador inicial
        var senhaHash = _servicoCriptografia.GerarHash(requisicao.Senha);
        var usuario = new Usuario(empresa.Id, requisicao.NomeUsuario, emailNormalizado, senhaHash);
        _context.Usuarios.Add(usuario);

        await _context.SaveChangesAsync(cancellationToken);

        // Gera token JWT
        var (token, expiraEm) = _tokenJwtService.GerarToken(usuario, empresa);

        var resposta = new RegistrarEmpresaResposta(
            empresa.Id,
            empresa.Nome,
            empresa.Slug,
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            token,
            expiraEm
        );

        return RespostaResultado<RegistrarEmpresaResposta>.Ok(resposta, "Empresa e usuário registrados com sucesso.");
    }
}
