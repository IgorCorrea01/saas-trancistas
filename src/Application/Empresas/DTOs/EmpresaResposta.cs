namespace Aplicacao.Empresas.DTOs;

public record EmpresaResposta(
    Guid Id,
    string Nome,
    string Slug,
    bool Ativa,
    string HorarioAbertura,
    string HorarioFechamento,
    string DiasFuncionamento,
    int IntervaloMinutos,
    DateTime DataCriacao,
    DateTime? DataAtualizacao
);

public record AtualizarEmpresaRequisicao(
    string Nome,
    string Slug,
    string? HorarioAbertura = null,
    string? HorarioFechamento = null,
    string? DiasFuncionamento = null,
    int? IntervaloMinutos = null
);
