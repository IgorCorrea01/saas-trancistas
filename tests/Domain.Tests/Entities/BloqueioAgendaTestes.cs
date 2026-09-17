using Dominio.Comum;
using Dominio.Entidades;
using FluentAssertions;
using Xunit;

namespace Domain.Tests.Entities;

public class BloqueioAgendaTestes
{
    [Fact]
    public void Deve_Criar_Bloqueio_Valido()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var inicio = DateTime.UtcNow.AddDays(2).Date.AddHours(12);
        var fim = inicio.AddHours(1);

        // Act
        var bloqueio = new BloqueioAgenda(empresaId, inicio, fim, "Intervalo de Almoço");

        // Assert
        bloqueio.Id.Should().NotBeEmpty();
        bloqueio.EmpresaId.Should().Be(empresaId);
        bloqueio.DataInicio.Should().Be(inicio);
        bloqueio.DataFim.Should().Be(fim);
        bloqueio.Motivo.Should().Be("Intervalo de Almoço");
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_Motivo_Estiver_Vazio()
    {
        // Act
        var acao = () => new BloqueioAgenda(
            Guid.NewGuid(),
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(1).AddHours(2),
            "   "
        );

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O motivo do bloqueio de agenda é obrigatório.");
    }
}
