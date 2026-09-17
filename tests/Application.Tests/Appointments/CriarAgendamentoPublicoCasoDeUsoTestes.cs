using Aplicacao.Appointments;
using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Application.Tests.Appointments;

public class CriarAgendamentoPublicoCasoDeUsoTestes
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
    public async Task Deve_Criar_Agendamento_Publico_Com_Sucesso_Apos_Orcamento_Aceito()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Afro Queen", "afro-queen-agendar");
        var cliente = new Cliente(empresa.Id, "Sabrina Silva", "11999998888");
        var servico = new Servico(empresa.Id, "Knotless Braids", "Sem nó", 320m, 240); // 4 horas
        var solicitacao = new SolicitacaoOrcamento(empresa.Id, cliente.Id, servico.Id);
        solicitacao.MarcarOrcamentoEnviado();
        solicitacao.MarcarOrcamentoAceito();

        var orcamento = new Orcamento(
            empresa.Id,
            solicitacao.Id,
            valorFinal: 350m,
            valorSinal: 175m,
            valorMaterial: 70m,
            descricaoMaterial: "Jumbo incluso",
            formasPagamento: "Pix",
            observacoes: null,
            validade: DateTime.UtcNow.AddDays(3)
        );
        orcamento.Aceitar();

        db.Empresas.Add(empresa);
        db.Clientes.Add(cliente);
        db.Servicos.Add(servico);
        db.SolicitacoesOrcamento.Add(solicitacao);
        db.Orcamentos.Add(orcamento);
        await db.SaveChangesAsync();

        var casoDeUso = new CriarAgendamentoPublicoCasoDeUso(db);

        var dataAgendamento = DateTime.UtcNow.AddDays(2).Date.AddHours(9); // 09:00

        var requisicao = new CriarAgendamentoPublicoRequisicao(
            TokenOrcamento: orcamento.TokenPublico,
            HorarioInicio: dataAgendamento,
            Observacoes: "Vou levar um lanche para o atendimento."
        );

        // Act
        var resultado = await casoDeUso.ExecutarAsync(requisicao);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.NomeCliente.Should().Be("Sabrina Silva");
        resultado.Dados.DuracaoMinutos.Should().Be(240);
        resultado.Dados.DataInicio.Should().Be(dataAgendamento.ToUniversalTime());
        resultado.Dados.DataFim.Should().Be(dataAgendamento.AddMinutes(240).ToUniversalTime());
        resultado.Dados.Status.Should().Be(StatusAgendamento.Agendado);

        // Verifica no banco
        var noBanco = await db.Agendamentos.FirstOrDefaultAsync(a => a.OrcamentoId == orcamento.Id);
        noBanco.Should().NotBeNull();
        noBanco!.Status.Should().Be(StatusAgendamento.Agendado);
    }

    [Fact]
    public async Task Nao_Deve_Permitir_Agendamento_Duplo_No_Mesmo_Horario_AntiOverbooking()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Afro Queen", "afro-queen-overbooking");
        var cliente1 = new Cliente(empresa.Id, "Cliente 1", "11911111111");
        var cliente2 = new Cliente(empresa.Id, "Cliente 2", "11922222222");
        var servico = new Servico(empresa.Id, "Nagô", "Desc", 120m, 120); // 2 horas

        var sol1 = new SolicitacaoOrcamento(empresa.Id, cliente1.Id, servico.Id);
        sol1.MarcarOrcamentoEnviado();
        sol1.MarcarOrcamentoAceito();
        var orc1 = new Orcamento(empresa.Id, sol1.Id, 120m, 60m, 0, null, "Pix", null, DateTime.UtcNow.AddDays(3));
        orc1.Aceitar();

        var sol2 = new SolicitacaoOrcamento(empresa.Id, cliente2.Id, servico.Id);
        sol2.MarcarOrcamentoEnviado();
        sol2.MarcarOrcamentoAceito();
        var orc2 = new Orcamento(empresa.Id, sol2.Id, 120m, 60m, 0, null, "Pix", null, DateTime.UtcNow.AddDays(3));
        orc2.Aceitar();

        db.Empresas.Add(empresa);
        db.Clientes.AddRange(cliente1, cliente2);
        db.Servicos.Add(servico);
        db.SolicitacoesOrcamento.AddRange(sol1, sol2);
        db.Orcamentos.AddRange(orc1, orc2);
        await db.SaveChangesAsync();

        var casoDeUso = new CriarAgendamentoPublicoCasoDeUso(db);

        var dataHorario = DateTime.UtcNow.AddDays(1).Date.AddHours(10); // 10:00

        // 1. Primeiro cliente agenda às 10:00 (10:00 às 12:00)
        var res1 = await casoDeUso.ExecutarAsync(new CriarAgendamentoPublicoRequisicao(orc1.TokenPublico, dataHorario, null));
        res1.Sucesso.Should().BeTrue();

        // 2. Segundo cliente tenta agendar às 11:00 (sobreposição)
        var res2 = await casoDeUso.ExecutarAsync(new CriarAgendamentoPublicoRequisicao(orc2.TokenPublico, dataHorario.AddHours(1), null));

        // Assert: Deve falhar devido à prevenção de conflitos
        res2.Sucesso.Should().BeFalse();
        res2.Mensagem.Should().Contain("reservado por outro cliente");
    }
}
