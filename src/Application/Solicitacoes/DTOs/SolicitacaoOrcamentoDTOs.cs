using Dominio.Enums;

namespace Aplicacao.Solicitacoes.DTOs;

public record RespostaItemArquivo(
    Stream Conteudo,
    string NomeArquivoOriginal,
    string ContentType
);

public record RespostaItemRequisicao(
    Guid PerguntaServicoId,
    string? ValorTexto,
    Guid? OpcaoPerguntaId,
    RespostaItemArquivo? Arquivo
);

public record CriarSolicitacaoPublicaRequisicao(
    string NomeCliente,
    string TelefoneCliente,
    string? EmailCliente,
    Guid ServicoId,
    string? ObservacoesCliente,
    List<RespostaItemRequisicao> Respostas
);

public record ClienteResumoResposta(
    Guid Id,
    string Nome,
    string Telefone,
    string? Email
);

public record SolicitacaoOrcamentoResposta(
    Guid Id,
    Guid ClienteId,
    string NomeCliente,
    string TelefoneCliente,
    Guid ServicoId,
    string NomeServico,
    decimal PrecoBaseServico,
    StatusSolicitacaoOrcamento Status,
    string StatusDescricao,
    int QuantidadeRespostas,
    int QuantidadeFotos,
    DateTime DataCriacao
);

public record RespostaSolicitacaoDetalhesResposta(
    Guid Id,
    Guid PerguntaServicoId,
    string EnunciadoPergunta,
    TipoPergunta TipoPergunta,
    string? ValorTexto,
    Guid? OpcaoPerguntaId,
    string? TextoOpcao,
    string? CaminhoArquivo,
    string? NomeArquivoOriginal
);

public record SolicitacaoOrcamentoDetalhesResposta(
    Guid Id,
    ClienteResumoResposta Cliente,
    Guid ServicoId,
    string NomeServico,
    string? DescricaoServico,
    decimal PrecoBaseServico,
    int DuracaoEstimadaMinutos,
    StatusSolicitacaoOrcamento Status,
    string StatusDescricao,
    string? ObservacoesCliente,
    DateTime DataCriacao,
    DateTime? DataAtualizacao,
    IReadOnlyList<RespostaSolicitacaoDetalhesResposta> Respostas
);
