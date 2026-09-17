using Dominio.Comum;
using Dominio.Enums;

namespace Dominio.Entidades;

public class SolicitacaoOrcamento : EntidadeBase, IEntidadeEmpresa
{
    public Guid EmpresaId { get; private set; }
    public Guid ClienteId { get; private set; }
    public Guid ServicoId { get; private set; }
    public StatusSolicitacaoOrcamento Status { get; private set; }
    public string? ObservacoesCliente { get; private set; }

    // Relacionamentos EF Core
    public virtual Cliente? Cliente { get; private set; }
    public virtual Servico? Servico { get; private set; }

    private readonly List<RespostaSolicitacao> _respostas = new();
    public virtual IReadOnlyCollection<RespostaSolicitacao> Respostas => _respostas.AsReadOnly();

    // EF Core
    protected SolicitacaoOrcamento() : base() { }

    public SolicitacaoOrcamento(
        Guid empresaId,
        Guid clienteId,
        Guid servicoId,
        string? observacoesCliente = null) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirClienteId(clienteId);
        DefinirServicoId(servicoId);
        ObservacoesCliente = observacoesCliente?.Trim();
        Status = StatusSolicitacaoOrcamento.AguardandoAnalise;
    }

    public SolicitacaoOrcamento(
        Guid id,
        Guid empresaId,
        Guid clienteId,
        Guid servicoId,
        StatusSolicitacaoOrcamento status,
        string? observacoesCliente = null) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirClienteId(clienteId);
        DefinirServicoId(servicoId);
        Status = status;
        ObservacoesCliente = observacoesCliente?.Trim();
    }

    public RespostaSolicitacao AdicionarResposta(
        Guid perguntaServicoId,
        string? valorTexto = null,
        Guid? opcaoPerguntaId = null,
        string? caminhoArquivo = null,
        string? nomeArquivoOriginal = null)
    {
        var resposta = new RespostaSolicitacao(
            EmpresaId,
            Id,
            perguntaServicoId,
            valorTexto,
            opcaoPerguntaId,
            caminhoArquivo,
            nomeArquivoOriginal
        );

        _respostas.Add(resposta);
        RegistrarAtualizacao();
        return resposta;
    }

    public void IniciarAnalise()
    {
        if (Status == StatusSolicitacaoOrcamento.Cancelada || Status == StatusSolicitacaoOrcamento.Expirada)
            throw new ExcecaoDominio("Não é possível analisar uma solicitação cancelada ou expirada.");

        if (Status == StatusSolicitacaoOrcamento.AguardandoAnalise)
        {
            Status = StatusSolicitacaoOrcamento.EmAnalise;
            RegistrarAtualizacao();
        }
    }

    public void MarcarOrcamentoEnviado()
    {
        if (Status == StatusSolicitacaoOrcamento.Cancelada || Status == StatusSolicitacaoOrcamento.Expirada)
            throw new ExcecaoDominio("Não é possível enviar orçamento para solicitação cancelada ou expirada.");

        Status = StatusSolicitacaoOrcamento.OrcamentoEnviado;
        RegistrarAtualizacao();
    }

    public void MarcarOrcamentoAceito()
    {
        if (Status != StatusSolicitacaoOrcamento.OrcamentoEnviado)
            throw new ExcecaoDominio("Apenas solicitações com orçamento enviado podem ser aceitas.");

        Status = StatusSolicitacaoOrcamento.OrcamentoAceito;
        RegistrarAtualizacao();
    }

    public void MarcarOrcamentoRecusado()
    {
        if (Status != StatusSolicitacaoOrcamento.OrcamentoEnviado)
            throw new ExcecaoDominio("Apenas solicitações com orçamento enviado podem ser recusadas.");

        Status = StatusSolicitacaoOrcamento.OrcamentoRecusado;
        RegistrarAtualizacao();
    }

    public void Cancelar()
    {
        if (Status == StatusSolicitacaoOrcamento.OrcamentoAceito)
            throw new ExcecaoDominio("Não é possível cancelar uma solicitação com orçamento já aceito diretamente.");

        Status = StatusSolicitacaoOrcamento.Cancelada;
        RegistrarAtualizacao();
    }

    public void Expirar()
    {
        Status = StatusSolicitacaoOrcamento.Expirada;
        RegistrarAtualizacao();
    }

    private void DefinirEmpresaId(Guid empresaId)
    {
        if (empresaId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da empresa é obrigatório.");

        EmpresaId = empresaId;
    }

    private void DefinirClienteId(Guid clienteId)
    {
        if (clienteId == Guid.Empty)
            throw new ExcecaoDominio("O identificador da cliente é obrigatório.");

        ClienteId = clienteId;
    }

    private void DefinirServicoId(Guid servicoId)
    {
        if (servicoId == Guid.Empty)
            throw new ExcecaoDominio("O identificador do serviço é obrigatório.");

        ServicoId = servicoId;
    }
}
