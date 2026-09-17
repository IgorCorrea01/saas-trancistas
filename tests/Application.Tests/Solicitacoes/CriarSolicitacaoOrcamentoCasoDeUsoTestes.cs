using Aplicacao.Comum;
using Aplicacao.Interfaces;
using Aplicacao.Solicitacoes;
using Aplicacao.Solicitacoes.DTOs;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Aplicacao.Testes.Solicitacoes;

public class CriarSolicitacaoOrcamentoCasoDeUsoTestes
{
    private readonly IArmazenamentoArquivos _armazenamento = Substitute.For<IArmazenamentoArquivos>();
    private readonly IContextoEmpresa _contextoEmpresa = Substitute.For<IContextoEmpresa>();

    private AppDbContext CriarDbContextInMemory()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options, _contextoEmpresa);
    }

    [Fact]
    public async Task Deve_Criar_Solicitacao_De_Orcamento_Com_Sucesso()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Afro Queen", "afro-queen");
        db.Empresas.Add(empresa);

        var servico = new Servico(empresa.Id, "Box Braids", "Desc", 250m, 360);
        var pComprimento = servico.AdicionarPergunta("Comprimento", TipoPergunta.EscolhaUnica, obrigatoria: true);
        var opLongo = pComprimento.AdicionarOpcao("Longo", 1);
        db.Servicos.Add(servico);
        await db.SaveChangesAsync();

        var casoDeUso = new CriarSolicitacaoOrcamentoCasoDeUso(db, _armazenamento);

        var requisicao = new CriarSolicitacaoPublicaRequisicao(
            NomeCliente: "Camila Alves",
            TelefoneCliente: "(11) 99887-6655",
            EmailCliente: "camila@gmail.com",
            ServicoId: servico.Id,
            ObservacoesCliente: "Gostaria de agendar para sábado",
            Respostas: new List<RespostaItemRequisicao>
            {
                new(pComprimento.Id, null, opLongo.Id, null)
            }
        );

        // Act
        var resultado = await casoDeUso.ExecutarAsync("afro-queen", requisicao);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.NomeCliente.Should().Be("Camila Alves");
        resultado.Dados.TelefoneCliente.Should().Be("11998876655");
        resultado.Dados.Status.Should().Be(StatusSolicitacaoOrcamento.AguardandoAnalise);

        // Verifica cliente persistido
        var clienteNoBanco = await db.Clientes.FirstOrDefaultAsync(c => c.Telefone == "11998876655");
        clienteNoBanco.Should().NotBeNull();
        clienteNoBanco!.Nome.Should().Be("Camila Alves");

        // Verifica solicitação persistida
        var solicitacaoNoBanco = await db.SolicitacoesOrcamento.Include(s => s.Respostas).FirstOrDefaultAsync();
        solicitacaoNoBanco.Should().NotBeNull();
        solicitacaoNoBanco!.Respostas.Should().HaveCount(1);
    }
}
