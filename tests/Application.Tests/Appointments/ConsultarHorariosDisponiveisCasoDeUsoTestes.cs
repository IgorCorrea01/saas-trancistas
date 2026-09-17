using Aplicacao.Appointments;
using Aplicacao.Comum;
using Dominio.Entidades;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Application.Tests.Appointments;

public class ConsultarHorariosDisponiveisCasoDeUsoTestes
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
    public async Task Deve_Calcular_Disponibilidade_De_Slots_Considerando_Duracao_E_Bloqueios()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Afro Queen", "afro-queen-agenda");
        var servico = new Servico(empresa.Id, "Box Braids", "Desc", 250m, 360); // 6 horas
        db.Empresas.Add(empresa);
        db.Servicos.Add(servico);

        var dataAmanha = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        // Bloqueio das 12:00 às 13:00 (almoço)
        var inicioAlmoco = dataAmanha.ToDateTime(new TimeOnly(12, 0), DateTimeKind.Utc);
        var fimAlmoco = dataAmanha.ToDateTime(new TimeOnly(13, 0), DateTimeKind.Utc);
        var bloqueio = new BloqueioAgenda(empresa.Id, inicioAlmoco, fimAlmoco, "Almoço");
        db.BloqueiosAgenda.Add(bloqueio);

        await db.SaveChangesAsync();

        var casoDeUso = new ConsultarHorariosDisponiveisCasoDeUso(db);

        // Act
        var resultado = await casoDeUso.ExecutarAsync("afro-queen-agenda", servico.Id, dataAmanha);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.DuracaoMinutos.Should().Be(360);
        resultado.Dados.Slots.Should().NotBeEmpty();

        // Um slot das 08:00 (8h às 14h = 6h) conflita com o almoço das 12h às 13h -> Disponível: false
        var slot8h = resultado.Dados.Slots.FirstOrDefault(s => s.HorarioInicioFormatado == "08:00");
        slot8h.Should().NotBeNull();
        slot8h!.Disponivel.Should().BeFalse();

        // Um slot das 14:00 (14h às 20h = 6h) ultrapassa o horário de fechamento das 19:00 -> Disponível: false
        var slot14h = resultado.Dados.Slots.FirstOrDefault(s => s.HorarioInicioFormatado == "14:00");
        slot14h.Should().NotBeNull();
        slot14h!.Disponivel.Should().BeFalse();
    }
}
