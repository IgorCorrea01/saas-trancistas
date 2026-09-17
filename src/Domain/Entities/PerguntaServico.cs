using Dominio.Comum;
using Dominio.Enums;

namespace Dominio.Entidades;

public class PerguntaServico : EntidadeBase, IEntidadeEmpresa
{
    public Guid ServicoId { get; private set; }
    public Guid EmpresaId { get; private set; }
    public string Enunciado { get; private set; } = string.Empty;
    public string? DescricaoAjuda { get; private set; }
    public TipoPergunta Tipo { get; private set; }
    public bool Obrigatoria { get; private set; }
    public int Ordem { get; private set; }

    private readonly List<OpcaoPergunta> _opcoes = new();
    public virtual IReadOnlyCollection<OpcaoPergunta> Opcoes => _opcoes.AsReadOnly();

    // EF Core
    protected PerguntaServico() : base() { }

    public PerguntaServico(
        Guid empresaId,
        Guid servicoId,
        string Enunciado,
        TipoPergunta tipo,
        bool obrigatoria = true,
        int ordem = 0,
        string? descricaoAjuda = null) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirServicoId(servicoId);
        DefinirEnunciado(Enunciado);
        Tipo = tipo;
        Obrigatoria = obrigatoria;
        Ordem = ordem;
        DescricaoAjuda = descricaoAjuda?.Trim();
    }

    public PerguntaServico(
        Guid id,
        Guid empresaId,
        Guid servicoId,
        string Enunciado,
        TipoPergunta tipo,
        bool obrigatoria = true,
        int ordem = 0,
        string? descricaoAjuda = null) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirServicoId(servicoId);
        DefinirEnunciado(Enunciado);
        Tipo = tipo;
        Obrigatoria = obrigatoria;
        Ordem = ordem;
        DescricaoAjuda = descricaoAjuda?.Trim();
    }

    public void Atualizar(string Enunciado, TipoPergunta tipo, bool obrigatoria, int ordem, string? descricaoAjuda)
    {
        DefinirEnunciado(Enunciado);
        Tipo = tipo;
        Obrigatoria = obrigatoria;
        Ordem = ordem;
        DescricaoAjuda = descricaoAjuda?.Trim();
        RegistrarAtualizacao();
    }

    public OpcaoPergunta AdicionarOpcao(string texto, int ordem = 0)
    {
        if (Tipo != TipoPergunta.EscolhaUnica && Tipo != TipoPergunta.MultiplasEscolhas)
            throw new ExcecaoDominio("Apenas perguntas de Escolha Única ou Múltiplas Escolhas podem ter opções.");

        var opcao = new OpcaoPergunta(EmpresaId, Id, texto, ordem);
        _opcoes.Add(opcao);
        RegistrarAtualizacao();
        return opcao;
    }

    public void RemoverOpcao(Guid opcaoId)
    {
        var opcao = _opcoes.FirstOrDefault(o => o.Id == opcaoId);
        if (opcao != null)
        {
            _opcoes.Remove(opcao);
            RegistrarAtualizacao();
        }
    }

    public void LimparOpcoes()
    {
        _opcoes.Clear();
        RegistrarAtualizacao();
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirServicoId(Guid servicoId)
    {
        if (servicoId == Guid.Empty)
            throw new ExcecaoDominio("O identificador do serviço é obrigatório.");

        ServicoId = servicoId;
    }

    private void DefinirEnunciado(string enunciado)
    {
        if (string.IsNullOrWhiteSpace(enunciado))
            throw new ExcecaoDominio("O enunciado da pergunta é obrigatório.");

        Enunciado = enunciado.Trim();
    }
}
