using Aplicacao.Comum;
using Aplicacao.Orcamentos;
using Aplicacao.Orcamentos.DTOs;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Aplicacao.Testes.Orcamentos;

public class CriarOrcamentoCasoDeUsoTestes
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
    public async Task Deve_Criar_Orcamento_Com_Sinal_E_Atualizar_Status_Da_Solicitacao()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        _contextoEmpresa.EmpresaId.Returns(empresaId);

        using var db = CriarDbContextInMemory();
        var cliente = new Cliente(empresaId, "Beatriz Ramos", "11977665544");
        var servico = new Servico(empresaId, "Knotless Braids", "Sem nó", 320m, 420);
        var solicitacao = new SolicitacaoOrcamento(empresaId, cliente.Id, servico.Id);

        db.Clientes.Add(cliente);
        db.Servicos.Add(servico);
        db.SolicitacoesOrcamento.Add(solicitacao);
        await db.SaveChangesAsync();

        var casoDeUso = new CriarOrcamentoCasoDeUso(db, _contextoEmpresa);

        var requisicao = new CriarOrcamentoRequisicao(
            SolicitacaoOrcamentoId: solicitacao.Id,
            ValorFinal: 350.00m,
            ValorSinal: 175.00m, // 50%
            ValorMaterial: 70.00m,
            DescricaoMaterial: "2 pacotes de Jumbo Ser Mulher",
            FormasPagamento: "Pix para sinal: 11977665544",
            Observacoes: "Cabelo deve estar limpo e seco",
            ValidadeDias: 5
        );

        // Act
        var resultado = await casoDeUso.ExecutarAsync(requisicao);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.ValorFinal.Should().Be(350.00m);
        resultado.Dados.ValorSinal.Should().Be(175.00m);
        resultado.Dados.ValorRestanteNoAtendimento.Should().Be(175.00m);
        resultado.Dados.TokenPublico.Should().NotBeNullOrWhiteSpace();

        // Verifica status da solicitação atualizado para OrcamentoEnviado
        var solicitacaoNoBanco = await db.SolicitacoesOrcamento.FindAsync(solicitacao.Id);
        solicitacaoNoBanco!.Status.Should().Be(StatusSolicitacaoOrcamento.OrcamentoEnviado);
    }
}
