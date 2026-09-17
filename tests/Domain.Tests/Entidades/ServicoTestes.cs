using Dominio.Comum;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Dominio.Testes.Entidades;

public class ServicoTestes
{
    [Fact]
    public void Deve_Criar_Servico_Valido_Com_Sucesso()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var nome = "Box Braids Tradicionais";
        var descricao = "Tranças soltas compridas com jumbo";
        var precoBase = 280.00m;
        var duracaoMinutos = 360;

        // Act
        var servico = new Servico(empresaId, nome, descricao, precoBase, duracaoMinutos);

        // Assert
        servico.Id.Should().NotBeEmpty();
        servico.EmpresaId.Should().Be(empresaId);
        servico.Nome.Should().Be(nome);
        servico.Descricao.Should().Be(descricao);
        servico.PrecoBase.Should().Be(precoBase);
        servico.DuracaoEstimadaMinutos.Should().Be(duracaoMinutos);
        servico.Ativo.Should().BeTrue();
        servico.Perguntas.Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Deve_Lancar_Excecao_Quando_Nome_Do_Servico_For_Invalido(string? nomeInvalido)
    {
        // Act
        var acao = () => new Servico(Guid.NewGuid(), nomeInvalido!, "Desc", 200m, 180);

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O nome do serviço é obrigatório.");
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_Preco_Base_For_Negativo()
    {
        // Act
        var acao = () => new Servico(Guid.NewGuid(), "Nagô", "Desc", -50m, 120);

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("O preço base do serviço não pode ser negativo.");
    }

    [Fact]
    public void Deve_Lancar_Excecao_Quando_Duracao_For_Menor_Ou_Igual_A_Zero()
    {
        // Act
        var acao = () => new Servico(Guid.NewGuid(), "Nagô", "Desc", 100m, 0);

        // Assert
        acao.Should().Throw<ExcecaoDominio>()
            .WithMessage("A duração estimada do serviço deve ser maior que zero.");
    }

    [Fact]
    public void Deve_Adicionar_E_Remover_Perguntas_E_Opcoes_Com_Sucesso()
    {
        // Arrange
        var servico = new Servico(Guid.NewGuid(), "Knotless Braids", "Sem nó", 320m, 420);

        // Act - Adiciona pergunta de escolha
        var perguntaComprimento = servico.AdicionarPergunta(
            "Qual o comprimento desejado?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        var opcao1 = perguntaComprimento.AdicionarOpcao("Médio (Sutiã)", 1);
        var opcao2 = perguntaComprimento.AdicionarOpcao("Longo (Cintura)", 2);

        // Act - Adiciona pergunta de foto
        var perguntaFoto = servico.AdicionarPergunta(
            "Envie uma foto atual do seu cabelo",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 2
        );

        // Assert
        servico.Perguntas.Should().HaveCount(2);
        perguntaComprimento.Opcoes.Should().HaveCount(2);
        perguntaFoto.Tipo.Should().Be(TipoPergunta.Arquivo);

        // Act - Remove uma pergunta
        servico.RemoverPergunta(perguntaFoto.Id);

        // Assert
        servico.Perguntas.Should().HaveCount(1);
        servico.Perguntas.First().Id.Should().Be(perguntaComprimento.Id);
    }
}
