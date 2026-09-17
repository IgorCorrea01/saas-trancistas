using Aplicacao.Comum;
using Dominio.Entidades;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Api.Testes.Infraestrutura;

public class MultiTenancyFiltroTestes
{
    [Fact]
    public async Task Deve_Isolar_Consultas_Por_Empresa_Automaticamente()
    {
        // Arrange
        var empresaAId = Guid.NewGuid();
        var empresaBId = Guid.NewGuid();

        var contextoEmpresa = Substitute.For<IContextoEmpresa>();
        contextoEmpresa.EmpresaId.Returns(empresaAId);

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var db = new AppDbContext(options, contextoEmpresa))
        {
            var empA = new Empresa(empresaAId, "Empresa A", "empresa-a");
            var empB = new Empresa(empresaBId, "Empresa B", "empresa-b");

            var userA = new Usuario(empresaAId, "Usuario A", "usera@teste.com", "hashA");
            var userB = new Usuario(empresaBId, "Usuario B", "userb@teste.com", "hashB");

            db.Empresas.AddRange(empA, empB);
            db.Usuarios.AddRange(userA, userB);
            await db.SaveChangesAsync();
        }

        // Act & Assert para Empresa A
        using (var dbConsulta = new AppDbContext(options, contextoEmpresa))
        {
            var usuarios = await dbConsulta.Usuarios.ToListAsync();
            usuarios.Should().HaveCount(1);
            usuarios.First().Nome.Should().Be("Usuario A");
            usuarios.First().EmpresaId.Should().Be(empresaAId);

            // Verificação de bypass seguro para operações de sistema
            var todosUsuarios = await dbConsulta.Usuarios.IgnoreQueryFilters().ToListAsync();
            todosUsuarios.Should().HaveCount(2);
        }

        // Act & Assert para Empresa B
        var contextoEmpresaB = Substitute.For<IContextoEmpresa>();
        contextoEmpresaB.EmpresaId.Returns(empresaBId);

        using (var dbConsultaB = new AppDbContext(options, contextoEmpresaB))
        {
            var usuarios = await dbConsultaB.Usuarios.ToListAsync();
            usuarios.Should().HaveCount(1);
            usuarios.First().Nome.Should().Be("Usuario B");
            usuarios.First().EmpresaId.Should().Be(empresaBId);
        }
    }
}
