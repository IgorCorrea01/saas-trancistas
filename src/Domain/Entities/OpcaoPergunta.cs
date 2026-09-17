using Dominio.Comum;

namespace Dominio.Entidades;

public class OpcaoPergunta : EntidadeBase, IEntidadeEmpresa
{
    public Guid PerguntaServicoId { get; private set; }
    public Guid EmpresaId { get; private set; }
    public string Texto { get; private set; } = string.Empty;
    public int Ordem { get; private set; }

    // EF Core
    protected OpcaoPergunta() : base() { }

    public OpcaoPergunta(Guid empresaId, Guid perguntaServicoId, string texto, int ordem = 0) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirPerguntaServicoId(perguntaServicoId);
        DefinirTexto(texto);
        Ordem = ordem;
    }

    public OpcaoPergunta(Guid id, Guid empresaId, Guid perguntaServicoId, string texto, int ordem = 0) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirPerguntaServicoId(perguntaServicoId);
        DefinirTexto(texto);
        Ordem = ordem;
    }

    public void Atualizar(string texto, int ordem)
    {
        DefinirTexto(texto);
        Ordem = ordem;
        RegistrarAtualizacao();
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirPerguntaServicoId(Guid perguntaServicoId)
    {
        if (perguntaServicoId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da pergunta do serviço é obrigatório.");

        PerguntaServicoId = perguntaServicoId;
    }

    private void DefinirTexto(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            throw new ExcecaoDominio("O texto da opção é obrigatório.");

        Texto = texto.Trim();
    }
}
