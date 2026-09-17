using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Dominio.Entidades;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class CriarAgendamentoPublicoCasoDeUso
{
    private readonly IAppDbContext _context;

    public CriarAgendamentoPublicoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<AgendamentoResposta>> ExecutarAsync(
        CriarAgendamentoPublicoRequisicao requisicao,
        CancellationToken cancellationToken = default)
    {
        if (requisicao == null)
            return RespostaResultado<AgendamentoResposta>.Falha("Dados da requisição inválidos.");

        if (string.IsNullOrWhiteSpace(requisicao.TokenOrcamento))
            return RespostaResultado<AgendamentoResposta>.Falha("O token do orçamento é obrigatório.");

        var dataInicio = requisicao.HorarioInicio.Kind == DateTimeKind.Utc
            ? requisicao.HorarioInicio
            : DateTime.SpecifyKind(requisicao.HorarioInicio, DateTimeKind.Utc);

        if (dataInicio <= DateTime.UtcNow)
            return RespostaResultado<AgendamentoResposta>.Falha("O horário de início do agendamento deve ser no futuro.");

        var tokenLimpo = requisicao.TokenOrcamento.Trim();

        // 1. Busca o orçamento aceito
        var orcamento = await _context.Orcamentos
            .IgnoreQueryFilters()
            .Include(o => o.SolicitacaoOrcamento)
                .ThenInclude(s => s!.Cliente)
            .Include(o => o.SolicitacaoOrcamento)
                .ThenInclude(s => s!.Servico)
            .FirstOrDefaultAsync(o => o.TokenPublico == tokenLimpo, cancellationToken);

        if (orcamento == null)
            return RespostaResultado<AgendamentoResposta>.Falha("Orçamento não encontrado.");

        if (orcamento.Status != StatusOrcamento.Aceito)
            return RespostaResultado<AgendamentoResposta>.Falha("Apenas orçamentos aceitos pela cliente podem ser agendados.");

        // 2. Verifica se este orçamento já possui agendamento ativo
        var agendamentoExistente = await _context.Agendamentos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.OrcamentoId == orcamento.Id && a.Status != StatusAgendamento.Cancelado, cancellationToken);

        if (agendamentoExistente != null)
            return RespostaResultado<AgendamentoResposta>.Falha("Já existe um agendamento ativo para este orçamento.");

        var solicitacao = orcamento.SolicitacaoOrcamento;
        if (solicitacao == null)
        {
            solicitacao = await _context.SolicitacoesOrcamento
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(s => s.Id == orcamento.SolicitacaoOrcamentoId, cancellationToken);
        }

        if (solicitacao == null)
            return RespostaResultado<AgendamentoResposta>.Falha("Solicitação vinculada ao orçamento não encontrada.");

        var cliente = solicitacao.Cliente ?? await _context.Clientes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == solicitacao.ClienteId, cancellationToken);

        var servico = solicitacao.Servico ?? await _context.Servicos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == solicitacao.ServicoId, cancellationToken);

        if (cliente == null || servico == null)
            return RespostaResultado<AgendamentoResposta>.Falha("Dados de cliente ou serviço incompletos no orçamento.");

        // 3. Calcula período com base na duração do serviço de trança
        var duracaoMinutos = servico.DuracaoEstimadaMinutos > 0 ? servico.DuracaoEstimadaMinutos : 60;
        var dataFim = dataInicio.AddMinutes(duracaoMinutos);

        // 4. Validação rigorosa de prevenção de conflitos de horário (Anti-Overbooking)
        var conflitoAgendamento = await _context.Agendamentos
            .IgnoreQueryFilters()
            .AnyAsync(a => a.EmpresaId == orcamento.EmpresaId
                           && a.Status != StatusAgendamento.Cancelado
                           && a.DataInicio < dataFim
                           && a.DataFim > dataInicio, cancellationToken);

        if (conflitoAgendamento)
            return RespostaResultado<AgendamentoResposta>.Falha("O horário selecionado acabou de ser reservado por outro cliente. Por favor, selecione outro horário.");

        var conflitoBloqueio = await _context.BloqueiosAgenda
            .IgnoreQueryFilters()
            .AnyAsync(b => b.EmpresaId == orcamento.EmpresaId
                           && b.DataInicio < dataFim
                           && b.DataFim > dataInicio, cancellationToken);

        if (conflitoBloqueio)
            return RespostaResultado<AgendamentoResposta>.Falha("O horário selecionado coincide com um bloqueio na agenda da profissional.");

        // 5. Criação do Agendamento
        var agendamento = new Agendamento(
            orcamento.EmpresaId,
            cliente.Id,
            servico.Id,
            dataInicio,
            dataFim,
            orcamento.Id,
            requisicao.Observacoes
        );

        _context.Agendamentos.Add(agendamento);
        await _context.SaveChangesAsync(cancellationToken);

        var resposta = new AgendamentoResposta(
            agendamento.Id,
            cliente.Id,
            cliente.Nome,
            cliente.Telefone,
            servico.Id,
            servico.Nome,
            duracaoMinutos,
            orcamento.Id,
            orcamento.ValorFinal,
            orcamento.ValorSinal,
            agendamento.DataInicio,
            agendamento.DataFim,
            agendamento.Status,
            agendamento.Status.ToString(),
            agendamento.Observacoes,
            agendamento.DataCriacao
        );

        return RespostaResultado<AgendamentoResposta>.Ok(resposta, "Seu horário foi agendado com sucesso! Aguardamos você no dia.");
    }
}
