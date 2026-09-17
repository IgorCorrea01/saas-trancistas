using Aplicacao.Comum;
using Aplicacao.Dashboard;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Application.Tests.Dashboard;

public class ObterDashboardResumoCasoDeUsoTestes
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
    public async Task Deve_Calcular_Metricas_E_Consolidar_Resumo_Do_Dashboard()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        _contextoEmpresa.EmpresaId.Returns(empresaId);

        using var db = CriarDbContextInMemory();
        var cliente = new Cliente(empresaId, "Camila", "11988889999");
        var servico = new Servico(empresaId, "Box Braids", "Desc", 300m, 360);

        var sol1 = new SolicitacaoOrcamento(empresaId, cliente.Id, servico.Id);
        sol1.MarcarOrcamentoEnviado();
        sol1.MarcarOrcamentoAceito();

        var orc1 = new Orcamento(empresaId, sol1.Id, 320m, 160m, 60m, null, "Pix", null, DateTime.UtcNow.AddDays(3));
        orc1.Aceitar();

        var agendamento = new Agendamento(
            empresaId,
            cliente.Id,
            servico.Id,
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(1).AddHours(6),
            orc1.Id
        );
        agendamento.Confirmar();

        db.Clientes.Add(cliente);
        db.Servicos.Add(servico);
        db.SolicitacoesOrcamento.Add(sol1);
        db.Orcamentos.Add(orc1);
        db.Agendamentos.Add(agendamento);
        await db.SaveChangesAsync();

        var casoDeUso = new ObterDashboardResumoCasoDeUso(db);

        // Act
        var resultado = await casoDeUso.ExecutarAsync();

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.Metricas.TotalSolicitacoes.Should().Be(1);
        resultado.Dados.Metricas.OrcamentosEnviados.Should().Be(1);
        resultado.Dados.Metricas.OrcamentosAceitos.Should().Be(1);
        resultado.Dados.Metricas.TaxaConversaoPercentual.Should().Be(100m);
        resultado.Dados.Metricas.FaturamentoTotal.Should().Be(320m);
        resultado.Dados.Metricas.TotalSinaisRecebidos.Should().Be(160m);
        resultado.Dados.Metricas.TotalRestanteReceber.Should().Be(160m);
        resultado.Dados.Metricas.AgendamentosConfirmados.Should().Be(1);
        resultado.Dados.ProximosAgendamentos.Should().HaveCount(1);
    }
}
