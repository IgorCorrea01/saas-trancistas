using Dominio.Comum;
using Dominio.Entidades;
using FluentAssertions;
using Xunit;

namespace Dominio.Testes.Entidades;

public class ClienteTestes
{
    [Fact]
    public void Deve_Criar_Cliente_Com_Dados_Validos()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var nome = "Mariana Costa";
        var telefone = "(11) 98765-4321";
        var email = "mariana@gmail.com";

        // Act
        var cliente = new Cliente(empresaId, nome, telefone, email);

        // Assert
        cliente.Id.Should().NotBeEmpty();
        cliente.EmpresaId.Should().Be(empresaId);
        cliente.Nome.Should().Be(nome);
        cliente.Telefone.Should().Be("11987654321");
        cliente.Email.Should().Be(email);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Deve_Lancar_Excecao_Quando_Nome_For_Invalido(string? nomeInvalido)
    {
        // Act
        var acao = () => new Cliente(Guid.NewGuid(), nomeInvalido!, "11987654321");

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O nome da cliente é obrigatório.");
    }

    [Theory]
    [InlineData("123")]
    [InlineData("abc")]
    [InlineData("")]
    [InlineData(null)]
    public void Deve_Lancar_Excecao_Quando_Telefone_For_Invalido(string? telefoneInvalido)
    {
        // Act
        var acao = () => new Cliente(Guid.NewGuid(), "Mariana", telefoneInvalido!);

        // Assert
        acao.Should().Throw<ExcecaoDominio>();
    }
}
