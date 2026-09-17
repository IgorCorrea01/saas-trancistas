using Dominio.Enums;

namespace Aplicacao.Servicos.DTOs;

public record OpcaoPerguntaRequisicao(
    string Texto,
    int Ordem
);

public record OpcaoPerguntaResposta(
    Guid Id,
    string Texto,
    int Ordem
);

public record PerguntaServicoRequisicao(
    string Enunciado,
    string? DescricaoAjuda,
    TipoPergunta Tipo,
    bool Obrigatoria,
    int Ordem,
    List<OpcaoPerguntaRequisicao>? Opcoes
);

public record PerguntaServicoResposta(
    Guid Id,
    string Enunciado,
    string? DescricaoAjuda,
    TipoPergunta Tipo,
    string TipoDescricao,
    bool Obrigatoria,
    int Ordem,
    IReadOnlyList<OpcaoPerguntaResposta> Opcoes
);

public record ConfigurarFormularioRequisicao(
    List<PerguntaServicoRequisicao> Perguntas
);
