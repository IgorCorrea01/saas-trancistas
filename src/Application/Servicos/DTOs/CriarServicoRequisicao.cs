namespace Aplicacao.Servicos.DTOs;

public record CriarServicoRequisicao(
    string Nome,
    string? Descricao,
    decimal PrecoBase,
    int DuracaoEstimadaMinutos
);

public record AtualizarServicoRequisicao(
    string Nome,
    string? Descricao,
    decimal PrecoBase,
    int DuracaoEstimadaMinutos
);

public record ServicoResposta(
    Guid Id,
    string Nome,
    string? Descricao,
    decimal PrecoBase,
    int DuracaoEstimadaMinutos,
    bool Ativo,
    int QuantidadePerguntas,
    DateTime DataCriacao
);

public record ServicoDetalhesResposta(
    Guid Id,
    string Nome,
    string? Descricao,
    decimal PrecoBase,
    int DuracaoEstimadaMinutos,
    bool Ativo,
    DateTime DataCriacao,
    DateTime? DataAtualizacao,
    IReadOnlyList<PerguntaServicoResposta> Perguntas
);
