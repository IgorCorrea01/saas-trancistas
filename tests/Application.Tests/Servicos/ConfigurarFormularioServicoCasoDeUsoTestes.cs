using Aplicacao.Comum;
using Aplicacao.Servicos;
using Aplicacao.Servicos.DTOs;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Aplicacao.Testes.Servicos;

public class ConfigurarFormularioServicoCasoDeUsoTestes
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
    public async Task Deve_Configurar_Formulario_Dinamico_De_Trancas_Com_Sucesso()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        _contextoEmpresa.EmpresaId.Returns(empresaId);

        using var db = CriarDbContextInMemory();
        var servico = new Servico(empresaId, "Gypsy Braids", "Com cachos", 350m, 420);
        db.Servicos.Add(servico);
        await db.SaveChangesAsync();

        var casoDeUso = new ConfigurarFormularioServicoCasoDeUso(db);

        var requisicao = new ConfigurarFormularioRequisicao(
            Perguntas: new List<PerguntaServicoRequisicao>
            {
                new(
                    Enunciado: "Qual o comprimento desejado?",
                    DescricaoAjuda: "Escolha o tamanho das tranças",
                    Tipo: TipoPergunta.EscolhaUnica,
                    Obrigatoria: true,
                    Ordem: 1,
                    Opcoes: new List<OpcaoPerguntaRequisicao>
                    {
                        new("Chanel", 1),
                        new("Médio", 2),
                        new("Longo", 3)
                    }
                ),
                new(
                    Enunciado: "Envie a foto do seu cabelo atual",
                    DescricaoAjuda: null,
                    Tipo: TipoPergunta.Arquivo,
                    Obrigatoria: true,
                    Ordem: 2,
                    Opcoes: null
                )
            }
        );

        // Act
        var resultado = await casoDeUso.ExecutarAsync(servico.Id, requisicao);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.Perguntas.Should().HaveCount(2);

        var pComprimento = resultado.Dados.Perguntas.First(p => p.Tipo == TipoPergunta.EscolhaUnica);
        pComprimento.Opcoes.Should().HaveCount(3);

        var pFoto = resultado.Dados.Perguntas.First(p => p.Tipo == TipoPergunta.Arquivo);
        pFoto.Obrigatoria.Should().BeTrue();
    }
}
