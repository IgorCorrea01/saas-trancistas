using Dominio.Comum;
using Dominio.Entidades;
using FluentAssertions;
using Xunit;

namespace Dominio.Testes.Entidades;

public class EmpresaTestes
{
    [Fact]
    public void Deve_Criar_Empresa_Valida_Com_Sucesso()
    {
        // Arrange
        var nome = "Studio Afro Hair";
        var slug = "studio-afro-hair";

        // Act
        var empresa = new Empresa(nome, slug);

        // Assert
        empresa.Id.Should().NotBeEmpty();
        empresa.Nome.Should().Be(nome);
        empresa.Slug.Should().Be(slug);
        empresa.Ativa.Should().BeTrue();
        empresa.DataCriacao.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Deve_Lancar_Excecao_Quando_Nome_For_Invalido(string? nomeInvalido)
    {
        // Act
        var acao = () => new Empresa(nomeInvalido!, "studio-slug");

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O nome da empresa é obrigatório.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Deve_Lancar_Excecao_Quando_Slug_For_Invalido(string? slugInvalido)
    {
        // Act
        var acao = () => new Empresa("Studio Afro", slugInvalido!);

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O slug da empresa é obrigatório.");
    }

    [Fact]
    public void Deve_Desativar_E_Reativar_Empresa_Com_Sucesso()
    {
        // Arrange
        var empresa = new Empresa("Studio Afro", "studio-afro");

        // Act
        empresa.Desativar();
        var dataDesativacao = empresa.DataAtualizacao;

        // Assert
        empresa.Ativa.Should().BeFalse();
        dataDesativacao.Should().NotBeNull();

        // Act
        empresa.Ativar();

        // Assert
        empresa.Ativa.Should().BeTrue();
        empresa.DataAtualizacao.Should().BeOnOrAfter(dataDesativacao!.Value);
    }
}
