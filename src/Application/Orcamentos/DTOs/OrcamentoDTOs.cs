using Dominio.Enums;

namespace Aplicacao.Orcamentos.DTOs;

public record CriarOrcamentoRequisicao(
    Guid SolicitacaoOrcamentoId,
    decimal ValorFinal,
    decimal ValorSinal,
    decimal ValorMaterial,
    string? DescricaoMaterial,
    string? FormasPagamento,
    string? Observacoes,
    int ValidadeDias = 3
);

public record OrcamentoResposta(
    Guid Id,
    Guid SolicitacaoOrcamentoId,
    decimal ValorFinal,
    decimal ValorSinal,
    decimal ValorMaterial,
    decimal ValorRestanteNoAtendimento,
    string? DescricaoMaterial,
    string? FormasPagamento,
    string? Observacoes,
    DateTime Validade,
    string TokenPublico,
    string UrlPublica,
    StatusOrcamento Status,
    string StatusDescricao,
    DateTime DataCriacao
);

public record OrcamentoPublicoResposta(
    string TokenPublico,
    string NomeEmpresa,
    string? SlugEmpresa,
    string NomeCliente,
    string NomeServico,
    string? DescricaoServico,
    int DuracaoEstimadaMinutos,
    decimal ValorFinal,
    decimal ValorSinal,
    decimal ValorMaterial,
    decimal ValorRestanteNoAtendimento,
    string? DescricaoMaterial,
    string? FormasPagamento,
    string? Observacoes,
    DateTime Validade,
    bool Expirado,
    StatusOrcamento Status,
    string StatusDescricao,
    DateTime DataCriacao
);

public record DecisaoOrcamentoResposta(
    bool Sucesso,
    string Mensagem,
    StatusOrcamento NovoStatus,
    string StatusDescricao,
    bool ProntoParaAgendamento
);
