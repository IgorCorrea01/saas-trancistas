using Dominio.Comum;
using Dominio.Enums;

namespace Dominio.Entidades;

public class Servico : EntidadeBase, IEntidadeEmpresa
{
    public Guid EmpresaId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public decimal PrecoBase { get; private set; }
    public int DuracaoEstimadaMinutos { get; private set; }
    public bool Ativo { get; private set; }

    private readonly List<PerguntaServico> _perguntas = new();
    public virtual IReadOnlyCollection<PerguntaServico> Perguntas => _perguntas.AsReadOnly();

    // EF Core
    protected Servico() : base() { }

    public Servico(
        Guid empresaId,
        string nome,
        string? descricao,
        decimal precoBase,
        int duracaoEstimadaMinutos) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirNome(nome);
        Descricao = descricao?.Trim();
        DefinirPrecoBase(precoBase);
        DefinirDuracaoEstimada(duracaoEstimadaMinutos);
        Ativo = true;
    }

    public Servico(
        Guid id,
        Guid empresaId,
        string nome,
        string? descricao,
        decimal precoBase,
        int duracaoEstimadaMinutos,
        bool ativo = true) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirNome(nome);
        Descricao = descricao?.Trim();
        DefinirPrecoBase(precoBase);
        DefinirDuracaoEstimada(duracaoEstimadaMinutos);
        Ativo = ativo;
    }

    public void AtualizarDados(string nome, string? descricao, decimal precoBase, int duracaoEstimadaMinutos)
    {
        DefinirNome(nome);
        Descricao = descricao?.Trim();
        DefinirPrecoBase(precoBase);
        DefinirDuracaoEstimada(duracaoEstimadaMinutos);
        RegistrarAtualizacao();
    }

    public void Ativar()
    {
        Ativo = true;
        RegistrarAtualizacao();
    }

    public void Desativar()
    {
        Ativo = false;
        RegistrarAtualizacao();
    }

    public PerguntaServico AdicionarPergunta(
        string enunciado,
        TipoPergunta tipo,
        bool obrigatoria = true,
        int ordem = 0,
        string? descricaoAjuda = null)
    {
        var pergunta = new PerguntaServico(EmpresaId, Id, enunciado, tipo, obrigatoria, ordem, descricaoAjuda);
        _perguntas.Add(pergunta);
        RegistrarAtualizacao();
        return pergunta;
    }

    public void RemoverPergunta(Guid perguntaId)
    {
        var pergunta = _perguntas.FirstOrDefault(p => p.Id == perguntaId);
        if (pergunta != null)
        {
            _perguntas.Remove(pergunta);
            RegistrarAtualizacao();
        }
    }

    public void LimparPerguntas()
    {
        _perguntas.Clear();
        RegistrarAtualizacao();
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ExcecaoDominio("O nome do serviço é obrigatório.");

        Nome = nome.Trim();
    }

    private void DefinirPrecoBase(decimal precoBase)
    {
        if (precoBase < 0)
            throw new ExcecaoDominio("O preço base do serviço não pode ser negativo.");

        PrecoBase = precoBase;
    }

    private void DefinirDuracaoEstimada(int duracaoEstimadaMinutos)
    {
        if (duracaoEstimadaMinutos <= 0)
            throw new ExcecaoDominio("A duração estimada do serviço deve ser maior que zero.");

        DuracaoEstimadaMinutos = duracaoEstimadaMinutos;
    }
}
