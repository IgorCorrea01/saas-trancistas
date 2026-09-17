using Dominio.Comum;
using Dominio.Entidades;
using FluentAssertions;
using Xunit;

namespace Dominio.Testes.Entidades;

public class UsuarioTestes
{
    [Fact]
    public void Deve_Criar_Usuario_Valido_Com_Sucesso()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var nome = "Ana Paula";
        var email = "ana@studio.com";
        var senhaHash = "$2a$11$q9h8y...";

        // Act
        var usuario = new Usuario(empresaId, nome, email, senhaHash);

        // Assert
        usuario.Id.Should().NotBeEmpty();
        usuario.EmpresaId.Should().Be(empresaId);
        usuario.Nome.Should().Be(nome);
        usuario.Email.Should().Be(email);
        usuario.SenhaHash.Should().Be(senhaHash);
        usuario.Ativo.Should().BeTrue();
    }

    [Theory]
    [InlineData("email-invalido")]
    [InlineData("email@semdominio")]
    [InlineData("")]
    [InlineData(null)]
    public void Deve_Lancar_Excecao_Quando_Email_For_Invalido(string? emailInvalido)
    {
        // Act
        var acao = () => new Usuario(Guid.NewGuid(), "Ana", emailInvalido!, "hash");

        // Assert
        acao.Should().Throw<ExcecaoDominio>();
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_EmpresaId_For_Vazio()
    {
        // Act
        var acao = () => new Usuario(Guid.Empty, "Ana", "ana@studio.com", "hash");

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O identificador da empresa é obrigatório.");
    }
}
