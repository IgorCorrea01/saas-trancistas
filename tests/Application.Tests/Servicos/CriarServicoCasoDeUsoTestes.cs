using Aplicacao.Comum;
using Aplicacao.Servicos;
using Aplicacao.Servicos.DTOs;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Aplicacao.Testes.Servicos;

public class CriarServicoCasoDeUsoTestes
{
    private readonly IContextoEmpresa _contextoEmpresa = Substitute.For<IContextoEmpresa>();

    private AppDbContext CriarDbContextInMemory()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options, _contextoEmpresa);
    }

    [Fact]
    public async Task Deve_Criar_Servico_De_Tranca_Com_Sucesso()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        _contextoEmpresa.EmpresaId.Returns(empresaId);

        using var db = CriarDbContextInMemory();
        var casoDeUso = new CriarServicoCasoDeUso(db, _contextoEmpresa);

        var requisicao = new CriarServicoRequisicao(
            Nome: "Fulani Braids",
            Descricao: "Tranças com detalhes nagô e soltas atrás",
            PrecoBase: 300.00m,
            DuracaoEstimadaMinutos: 360
        );

        // Act
        var resultado = await casoDeUso.ExecutarAsync(requisicao);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.Nome.Should().Be("Fulani Braids");
        resultado.Dados.PrecoBase.Should().Be(300.00m);
        resultado.Dados.DuracaoEstimadaMinutos.Should().Be(360);
        resultado.Dados.Ativo.Should().BeTrue();

        var noBanco = await db.Servicos.FirstOrDefaultAsync(s => s.Nome == "Fulani Braids");
        noBanco.Should().NotBeNull();
        noBanco!.EmpresaId.Should().Be(empresaId);
    }
}
