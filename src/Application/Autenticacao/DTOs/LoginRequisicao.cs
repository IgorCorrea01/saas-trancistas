namespace Aplicacao.Autenticacao.DTOs;

public record LoginRequisicao(
    string Email,
    string Senha
);

public record LoginResposta(
    string Token,
    DateTime ExpiraEm,
    Guid UsuarioId,
    string NomeUsuario,
    string Email,
    Guid EmpresaId,
    string NomeEmpresa
);

public record UsuarioPerfilResposta(
    Guid Id,
    string Nome,
    string Email,
    bool Ativo,
    Guid EmpresaId,
    string NomeEmpresa,
    string SlugEmpresa
);
