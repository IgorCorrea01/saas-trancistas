using Aplicacao.Comum;
using FluentAssertions;
using Xunit;

namespace Aplicacao.Testes.Comum;

public class RespostaResultadoTestes
{
    [Fact]
    public void Deve_Criar_Resultado_De_Sucesso_Com_Dados()
    {
        // Arrange
        var dados = new { Id = Guid.NewGuid(), Nome = "Box Braids" };

        // Act
        var resultado = RespostaResultado<object>.Ok(dados, "Sucesso");

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().Be(dados);
        resultado.Mensagem.Should().Be("Sucesso");
        resultado.Erros.Should().BeEmpty();
    }

    [Fact]
    public void Deve_Criar_Resultado_De_Falha_Com_Erros()
    {
        // Act
        var resultado = RespostaResultado.Falha("Erro na operação", new[] { "Campo inválido", "Valor negativo" });

        // Assert
        resultado.Sucesso.Should().BeFalse();
        resultado.Mensagem.Should().Be("Erro na operação");
        resultado.Erros.Should().HaveCount(2);
    }
}
