using Aplicacao.Comum;
using Aplicacao.Orcamentos;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Aplicacao.Testes.Orcamentos;

public class DecisaoOrcamentoCasoDeUsoTestes
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
    public async Task Deve_Aceitar_Orcamento_Publico_E_Atualizar_Solicitacao_Para_OrcamentoAceito()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Trança Chic", "tranca-chic");
        var cliente = new Cliente(empresa.Id, "Fernanda Lima", "11966554433");
        var servico = new Servico(empresa.Id, "Fulani Braids", "Desc", 300m, 360);
        var solicitacao = new SolicitacaoOrcamento(empresa.Id, cliente.Id, servico.Id);
        solicitacao.MarcarOrcamentoEnviado();

        var orcamento = new Orcamento(
            empresa.Id,
            solicitacao.Id,
            valorFinal: 320m,
            valorSinal: 160m,
            valorMaterial: 60m,
            descricaoMaterial: "Jumbo incluso",
            formasPagamento: "Pix",
            observacoes: null,
            validade: DateTime.UtcNow.AddDays(3)
        );

        db.Empresas.Add(empresa);
        db.Clientes.Add(cliente);
        db.Servicos.Add(servico);
        db.SolicitacoesOrcamento.Add(solicitacao);
        db.Orcamentos.Add(orcamento);
        await db.SaveChangesAsync();

        var casoDeUso = new AceitarOrcamentoPublicoCasoDeUso(db);

        // Act
        var resultado = await casoDeUso.ExecutarAsync(orcamento.TokenPublico);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados!.NovoStatus.Should().Be(StatusOrcamento.Aceito);
        resultado.Dados.ProntoParaAgendamento.Should().BeTrue();

        var orcamentoNoBanco = await db.Orcamentos.FindAsync(orcamento.Id);
        orcamentoNoBanco!.Status.Should().Be(StatusOrcamento.Aceito);

        var solicitacaoNoBanco = await db.SolicitacoesOrcamento.FindAsync(solicitacao.Id);
        solicitacaoNoBanco!.Status.Should().Be(StatusSolicitacaoOrcamento.OrcamentoAceito);
    }

    [Fact]
    public async Task Deve_Recusar_Orcamento_Publico_E_Atualizar_Solicitacao_Para_OrcamentoRecusado()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Trança Chic", "tranca-chic-2");
        var cliente = new Cliente(empresa.Id, "Larissa", "11955443322");
        var servico = new Servico(empresa.Id, "Nagô", "Desc", 120m, 120);
        var solicitacao = new SolicitacaoOrcamento(empresa.Id, cliente.Id, servico.Id);
        solicitacao.MarcarOrcamentoEnviado();

        var orcamento = new Orcamento(
            empresa.Id,
            solicitacao.Id,
            valorFinal: 150m,
            valorSinal: 75m,
            valorMaterial: 0,
            descricaoMaterial: null,
            formasPagamento: "Pix",
            observacoes: null,
            validade: DateTime.UtcNow.AddDays(3)
        );

        db.Empresas.Add(empresa);
        db.Clientes.Add(cliente);
        db.Servicos.Add(servico);
        db.SolicitacoesOrcamento.Add(solicitacao);
        db.Orcamentos.Add(orcamento);
        await db.SaveChangesAsync();

        var casoDeUso = new RecusarOrcamentoPublicoCasoDeUso(db);

        // Act
        var resultado = await casoDeUso.ExecutarAsync(orcamento.TokenPublico);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados!.NovoStatus.Should().Be(StatusOrcamento.Recusado);
        resultado.Dados.ProntoParaAgendamento.Should().BeFalse();

        var orcamentoNoBanco = await db.Orcamentos.FindAsync(orcamento.Id);
        orcamentoNoBanco!.Status.Should().Be(StatusOrcamento.Recusado);

        var solicitacaoNoBanco = await db.SolicitacoesOrcamento.FindAsync(solicitacao.Id);
        solicitacaoNoBanco!.Status.Should().Be(StatusSolicitacaoOrcamento.OrcamentoRecusado);
    }
}
