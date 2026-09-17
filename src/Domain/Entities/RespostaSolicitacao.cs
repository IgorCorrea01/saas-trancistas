using Dominio.Comum;

namespace Dominio.Entidades;

public class RespostaSolicitacao : EntidadeBase, IEntidadeEmpresa
{
    public Guid SolicitacaoOrcamentoId { get; private set; }
    public Guid PerguntaServicoId { get; private set; }
    public Guid EmpresaId { get; private set; }
    public Guid? OpcaoPerguntaId { get; private set; }
    public string? ValorTexto { get; private set; }
    public string? CaminhoArquivo { get; private set; }
    public string? NomeArquivoOriginal { get; private set; }

    // Relacionamento opcional para EF Core
    public virtual PerguntaServico? PerguntaServico { get; private set; }
    public virtual OpcaoPergunta? OpcaoPergunta { get; private set; }

    // EF Core
    protected RespostaSolicitacao() : base() { }

    public RespostaSolicitacao(
        Guid empresaId,
        Guid solicitacaoOrcamentoId,
        Guid perguntaServicoId,
        string? valorTexto = null,
        Guid? opcaoPerguntaId = null,
        string? caminhoArquivo = null,
        string? nomeArquivoOriginal = null) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirSolicitacaoOrcamentoId(solicitacaoOrcamentoId);
        DefinirPerguntaServicoId(perguntaServicoId);
        OpcaoPerguntaId = opcaoPerguntaId;
        ValorTexto = valorTexto?.Trim();
        CaminhoArquivo = caminhoArquivo?.Trim();
        NomeArquivoOriginal = nomeArquivoOriginal?.Trim();
    }

    public RespostaSolicitacao(
        Guid id,
        Guid empresaId,
        Guid solicitacaoOrcamentoId,
        Guid perguntaServicoId,
        string? valorTexto = null,
        Guid? opcaoPerguntaId = null,
        string? caminhoArquivo = null,
        string? nomeArquivoOriginal = null) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirSolicitacaoOrcamentoId(solicitacaoOrcamentoId);
        DefinirPerguntaServicoId(perguntaServicoId);
        OpcaoPerguntaId = opcaoPerguntaId;
        ValorTexto = valorTexto?.Trim();
        CaminhoArquivo = caminhoArquivo?.Trim();
        NomeArquivoOriginal = nomeArquivoOriginal?.Trim();
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirSolicitacaoOrcamentoId(Guid solicitacaoOrcamentoId)
    {
        if (solicitacaoOrcamentoId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da solicitação de orçamento é obrigatório.");

        SolicitacaoOrcamentoId = solicitacaoOrcamentoId;
    }

    private void DefinirPerguntaServicoId(Guid perguntaServicoId)
    {
        if (perguntaServicoId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da pergunta do serviço é obrigatório.");

        PerguntaServicoId = perguntaServicoId;
    }
}
