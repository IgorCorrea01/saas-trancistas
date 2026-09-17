using Dominio.Comum;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Domain.Tests.Entities;

public class AgendamentoTestes
{
    [Fact]
    public void Deve_Criar_Agendamento_Valido()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var servicoId = Guid.NewGuid();
        var dataInicio = DateTime.UtcNow.AddDays(1);
        var dataFim = dataInicio.AddHours(6);

        // Act
        var agendamento = new Agendamento(
            empresaId,
            clienteId,
            servicoId,
            dataInicio,
            dataFim,
            orcamentoId: null,
            observacoes: "Primeira vez fazendo tranças"
        );

        // Assert
        agendamento.Id.Should().NotBeEmpty();
        agendamento.EmpresaId.Should().Be(empresaId);
        agendamento.ClienteId.Should().Be(clienteId);
        agendamento.ServicoId.Should().Be(servicoId);
        agendamento.DataInicio.Should().Be(dataInicio);
        agendamento.DataFim.Should().Be(dataFim);
        agendamento.Status.Should().Be(StatusAgendamento.Agendado);
    }

    [Fact]
    public void Deve_Detectar_Conflitos_De_Horario_Corretamente()
    {
        // Arrange: Agendamento das 10:00 às 16:00
        var dataBase = new DateTime(2026, 10, 15, 0, 0, 0, DateTimeKind.Utc);
        var inicio = dataBase.AddHours(10);
        var fim = dataBase.AddHours(16);

        var agendamento = new Agendamento(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), inicio, fim);

        // Act & Assert
        // 1. Sobreposição total (11:00 às 14:00) -> Conflita
        agendamento.ConflitaCom(dataBase.AddHours(11), dataBase.AddHours(14)).Should().BeTrue();

        // 2. Sobreposição parcial no início (09:00 às 12:00) -> Conflita
        agendamento.ConflitaCom(dataBase.AddHours(9), dataBase.AddHours(12)).Should().BeTrue();

        // 3. Sobreposição parcial no fim (15:00 às 18:00) -> Conflita
        agendamento.ConflitaCom(dataBase.AddHours(15), dataBase.AddHours(18)).Should().BeTrue();

        // 4. Anterior sem sobreposição (08:00 às 10:00) -> Não conflita
        agendamento.ConflitaCom(dataBase.AddHours(8), dataBase.AddHours(10)).Should().BeFalse();

        // 5. Posterior sem sobreposição (16:00 às 18:00) -> Não conflita
        agendamento.ConflitaCom(dataBase.AddHours(16), dataBase.AddHours(18)).Should().BeFalse();
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_DataFim_For_Menor_Ou_Igual_DataInicio()
    {
        // Arrange
        var inicio = DateTime.UtcNow.AddDays(1);
        var fim = inicio.AddHours(-1);

        // Act
        var acao = () => new Agendamento(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), inicio, fim);

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O horário de término deve ser posterior ao horário de início.");
    }
}
