using Dominio.Comum;
using Dominio.Entidades;
using Dominio.Enums;
using FluentAssertions;
using Xunit;

namespace Dominio.Testes.Entidades;

public class SolicitacaoOrcamentoTestes
{
    [Fact]
    public void Deve_Criar_Solicitacao_Inicial_Com_Status_AguardandoAnalise()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var servicoId = Guid.NewGuid();

        // Act
        var solicitacao = new SolicitacaoOrcamento(empresaId, clienteId, servicoId, "Prefiro atendimento pela manhã");

        // Assert
        solicitacao.Id.Should().NotBeEmpty();
        solicitacao.EmpresaId.Should().Be(empresaId);
        solicitacao.ClienteId.Should().Be(clienteId);
        solicitacao.ServicoId.Should().Be(servicoId);
        solicitacao.Status.Should().Be(StatusSolicitacaoOrcamento.AguardandoAnalise);
        solicitacao.ObservacoesCliente.Should().Be("Prefiro atendimento pela manhã");
        solicitacao.Respostas.Should().BeEmpty();
    }

    [Fact]
    public void Deve_Transitar_Status_Corretamente_Durante_Ciclo_De_Vida()
    {
        // Arrange
        var solicitacao = new SolicitacaoOrcamento(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());

        // 1. Iniciar Análise
        solicitacao.IniciarAnalise();
        solicitacao.Status.Should().Be(StatusSolicitacaoOrcamento.EmAnalise);

        // 2. Orçamento Enviado
        solicitacao.MarcarOrcamentoEnviado();
        solicitacao.Status.Should().Be(StatusSolicitacaoOrcamento.OrcamentoEnviado);

        // 3. Orçamento Aceito
        solicitacao.MarcarOrcamentoAceito();
        solicitacao.Status.Should().Be(StatusSolicitacaoOrcamento.OrcamentoAceito);
    }

    [Fact]
    public void Deve_Adicionar_Respostas_Com_Sucesso()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var solicitacao = new SolicitacaoOrcamento(empresaId, Guid.NewGuid(), Guid.NewGuid());
        var perguntaId = Guid.NewGuid();

        // Act
        var resposta = solicitacao.AdicionarResposta(perguntaId, valorTexto: "Castanho 4", opcaoPerguntaId: null);

        // Assert
        solicitacao.Respostas.Should().HaveCount(1);
        resposta.EmpresaId.Should().Be(empresaId);
        resposta.ValorTexto.Should().Be("Castanho 4");
    }
}
