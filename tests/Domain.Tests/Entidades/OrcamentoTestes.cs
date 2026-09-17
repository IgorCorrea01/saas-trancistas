using Dominio.Comum;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Dominio.Testes.Entidades;

public class OrcamentoTestes
{
    [Fact]
    public void Deve_Criar_Orcamento_Com_Valores_Validos_E_Calcular_Restante_Corretamente()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var solicitacaoId = Guid.NewGuid();
        var valorFinal = 380.00m;
        var valorSinal = 190.00m;
        var valorMaterial = 80.00m;
        var descricaoMaterial = "3 pacotes de Jumbo cor 1B";
        var formasPagamento = "Pix para o sinal, cartão ou dinheiro no atendimento";
        var validade = DateTime.UtcNow.AddDays(3);

        // Act
        var orcamento = new Orcamento(
            empresaId,
            solicitacaoId,
            valorFinal,
            valorSinal,
            valorMaterial,
            descricaoMaterial,
            formasPagamento,
            "Chegar com o cabelo lavado e desembaraçado",
            validade
        );

        // Assert
        orcamento.Id.Should().NotBeEmpty();
        orcamento.EmpresaId.Should().Be(empresaId);
        orcamento.SolicitacaoOrcamentoId.Should().Be(solicitacaoId);
        orcamento.ValorFinal.Should().Be(valorFinal);
        orcamento.ValorSinal.Should().Be(valorSinal);
        orcamento.ValorMaterial.Should().Be(valorMaterial);
        orcamento.ValorRestanteNoAtendimento.Should().Be(190.00m);
        orcamento.DescricaoMaterial.Should().Be(descricaoMaterial);
        orcamento.FormasPagamento.Should().Be(formasPagamento);
        orcamento.Status.Should().Be(StatusOrcamento.Pendente);
        orcamento.TokenPublico.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_Valor_Final_For_Menor_Ou_Igual_A_Zero()
    {
        // Act
        var acao = () => new Orcamento(
            Guid.NewGuid(),
            Guid.NewGuid(),
            valorFinal: 0,
            valorSinal: 0,
            valorMaterial: 0,
            descricaoMaterial: null,
            formasPagamento: null,
            observacoes: null,
            validade: DateTime.UtcNow.AddDays(2)
        );

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O valor final do orçamento deve ser maior que zero.");
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_Valor_Sinal_For_Maior_Que_Valor_Final()
    {
        // Act
        var acao = () => new Orcamento(
            Guid.NewGuid(),
            Guid.NewGuid(),
            valorFinal: 200m,
            valorSinal: 250m,
            valorMaterial: 50m,
            descricaoMaterial: null,
            formasPagamento: null,
            observacoes: null,
            validade: DateTime.UtcNow.AddDays(2)
        );

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O valor do sinal não pode ser superior ao valor total do orçamento.");
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_Validade_For_No_Passado()
    {
        // Act
        var acao = () => new Orcamento(
            Guid.NewGuid(),
            Guid.NewGuid(),
            valorFinal: 200m,
            valorSinal: 100m,
            valorMaterial: 0,
            descricaoMaterial: null,
            formasPagamento: null,
            observacoes: null,
            validade: DateTime.UtcNow.AddDays(-1)
        );

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("A data de validade do orçamento deve ser no futuro.");
    }

    [Fact]
    public void Deve_Aceitar_E_Recusar_Orcamento_Respeitando_Transicoes()
    {
        // Arrange
        var orcamento = new Orcamento(
            Guid.NewGuid(),
            Guid.NewGuid(),
            valorFinal: 300m,
            valorSinal: 150m,
            valorMaterial: 60m,
            descricaoMaterial: null,
            formasPagamento: null,
            observacoes: null,
            validade: DateTime.UtcNow.AddDays(3)
        );

        // Act & Assert
        orcamento.Aceitar();
        orcamento.Status.Should().Be(StatusOrcamento.Aceito);

        // Não pode recusar após aceitar
        var acaoRecusa = () => orcamento.Recusar();
        acaoRecusa.Should().Throw<ExcecaoDominio>();
    }
}
