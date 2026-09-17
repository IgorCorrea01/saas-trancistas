namespace Aplicacao.Autenticacao.DTOs;

public record RegistrarEmpresaRequisicao(
    string NomeEmpresa,
    string Slug,
    string NomeUsuario,
    string Email,
    string Senha
);

public record RegistrarEmpresaResposta(
    Guid EmpresaId,
    string NomeEmpresa,
    string Slug,
    Guid UsuarioId,
    string NomeUsuario,
    string Email,
    string Token,
    DateTime ExpiraEm
);
