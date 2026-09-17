using System.Security.Cryptography;
using Dominio.Comum;
using Dominio.Enums;

namespace Dominio.Entidades;

public class Orcamento : EntidadeBase, IEntidadeEmpresa
{
    public Guid EmpresaId { get; private set; }
    public Guid SolicitacaoOrcamentoId { get; private set; }
    public decimal ValorFinal { get; private set; }
    public decimal ValorSinal { get; private set; }
    public decimal ValorMaterial { get; private set; }
    public string? DescricaoMaterial { get; private set; }
    public string? FormasPagamento { get; private set; }
    public string? Observacoes { get; private set; }
    public DateTime Validade { get; private set; }
    public string TokenPublico { get; private set; } = string.Empty;
    public StatusOrcamento Status { get; private set; }

    public decimal ValorRestanteNoAtendimento => ValorFinal - ValorSinal;

    // Relacionamento EF Core
    public virtual SolicitacaoOrcamento? SolicitacaoOrcamento { get; private set; }

    // EF Core
    protected Orcamento() : base() { }

    public Orcamento(
        Guid empresaId,
        Guid solicitacaoOrcamentoId,
        decimal valorFinal,
        decimal valorSinal,
        decimal valorMaterial,
        string? descricaoMaterial,
        string? formasPagamento,
        string? observacoes,
        DateTime validade) : base()
    {
        DefinirEmpresaId(empresaId);
        DefinirSolicitacaoOrcamentoId(solicitacaoOrcamentoId);
        DefinirValores(valorFinal, valorSinal, valorMaterial);
        DefinirValidade(validade);

        DescricaoMaterial = descricaoMaterial?.Trim();
        FormasPagamento = formasPagamento?.Trim();
        Observacoes = observacoes?.Trim();
        Status = StatusOrcamento.Pendente;
        TokenPublico = GerarTokenPublicoSeguro();
    }

    public Orcamento(
        Guid id,
        Guid empresaId,
        Guid solicitacaoOrcamentoId,
        decimal valorFinal,
        decimal valorSinal,
        decimal valorMaterial,
        string? descricaoMaterial,
        string? formasPagamento,
        string? observacoes,
        DateTime validade,
        string tokenPublico,
        StatusOrcamento status) : base(id)
    {
        DefinirEmpresaId(empresaId);
        DefinirSolicitacaoOrcamentoId(solicitacaoOrcamentoId);
        DefinirValores(valorFinal, valorSinal, valorMaterial);
        DefinirValidade(validade);

        DescricaoMaterial = descricaoMaterial?.Trim();
        FormasPagamento = formasPagamento?.Trim();
        Observacoes = observacoes?.Trim();
        TokenPublico = tokenPublico;
        Status = status;
    }

    public void Aceitar()
    {
        VerificarExpiracao();

        if (Status == StatusOrcamento.Expirado)
            throw new ExcecaoDominio("Este orçamento expirou e não pode mais ser aceito. Solicite um novo orçamento à trancista.");

        if (Status == StatusOrcamento.Cancelado)
            throw new ExcecaoDominio("Este orçamento foi cancelado.");

        if (Status == StatusOrcamento.Aceito)
            throw new ExcecaoDominio("Este orçamento já foi aceito anteriormente.");

        if (Status == StatusOrcamento.Recusado)
            throw new ExcecaoDominio("Este orçamento já foi recusado.");

        Status = StatusOrcamento.Aceito;
        RegistrarAtualizacao();
    }

    public void Recusar()
    {
        VerificarExpiracao();

        if (Status == StatusOrcamento.Expirado)
            throw new ExcecaoDominio("Este orçamento já expirou.");

        if (Status == StatusOrcamento.Cancelado)
            throw new ExcecaoDominio("Este orçamento foi cancelado.");

        if (Status == StatusOrcamento.Aceito)
            throw new ExcecaoDominio("Não é possível recusar um orçamento já aceito.");

        if (Status == StatusOrcamento.Recusado)
            throw new ExcecaoDominio("Este orçamento já foi recusado.");

        Status = StatusOrcamento.Recusado;
        RegistrarAtualizacao();
    }

    public void Cancelar()
    {
        if (Status == StatusOrcamento.Aceito)
            throw new ExcecaoDominio("Não é possível cancelar um orçamento já aceito.");

        Status = StatusOrcamento.Cancelado;
        RegistrarAtualizacao();
    }

    public void VerificarExpiracao()
    {
        if (Status == StatusOrcamento.Pendente && DateTime.UtcNow > Validade)
        {
            Status = StatusOrcamento.Expirado;
            RegistrarAtualizacao();
        }
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

    private void DefinirValores(decimal valorFinal, decimal valorSinal, decimal valorMaterial)
    {
        if (valorFinal <= 0)
            throw new ExcecaoDominio("O valor final do orçamento deve ser maior que zero.");

        if (valorSinal < 0)
            throw new ExcecaoDominio("O valor do sinal não pode ser negativo.");

        if (valorSinal > valorFinal)
            throw new ExcecaoDominio("O valor do sinal não pode ser superior ao valor total do orçamento.");

        if (valorMaterial < 0)
            throw new ExcecaoDominio("O valor do material não pode ser negativo.");

        if (valorMaterial > valorFinal)
            throw new ExcecaoDominio("O valor do material não pode ser superior ao valor total do orçamento.");

        ValorFinal = valorFinal;
        ValorSinal = valorSinal;
        ValorMaterial = valorMaterial;
    }

    private void DefinirValidade(DateTime validade)
    {
        if (validade <= DateTime.UtcNow)
            throw new ExcecaoDominio("A data de validade do orçamento deve ser no futuro.");

        Validade = validade;
    }

    private static string GerarTokenPublicoSeguro()
    {
        var bytes = RandomNumberGenerator.GetBytes(24);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }
}
