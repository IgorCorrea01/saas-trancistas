using System.Globalization;
using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class ConsultarHorariosDisponiveisCasoDeUso
{
    private readonly IAppDbContext _context;

    public ConsultarHorariosDisponiveisCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<DisponibilidadeDiaResposta>> ExecutarAsync(
        string slugEmpresa,
        Guid servicoId,
        DateOnly dataConsulta,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slugEmpresa))
            return RespostaResultado<DisponibilidadeDiaResposta>.Falha("Slug da empresa inválido.");

        if (servicoId == Guid.Empty)
            return RespostaResultado<DisponibilidadeDiaResposta>.Falha("Identificador do serviço inválido.");

        var slugNormalizado = slugEmpresa.Trim().ToLowerInvariant();

        // 1. Localiza a empresa
        var empresa = await _context.Empresas
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Slug == slugNormalizado && e.Ativa, cancellationToken);

        if (empresa == null)
            return RespostaResultado<DisponibilidadeDiaResposta>.Falha("Empresa de tranças não encontrada ou inativa.");

        // 2. Localiza o serviço
        var servico = await _context.Servicos
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == servicoId && s.EmpresaId == empresa.Id && s.Ativo, cancellationToken);

        if (servico == null)
            return RespostaResultado<DisponibilidadeDiaResposta>.Falha("Serviço de tranças não encontrado ou indisponível.");

        // 3. Define intervalo do dia consultado
        var inicioDia = dataConsulta.ToDateTime(new TimeOnly(0, 0, 0), DateTimeKind.Utc);
        var fimDia = dataConsulta.ToDateTime(new TimeOnly(23, 59, 59), DateTimeKind.Utc);

        // 4. Busca agendamentos ativos e bloqueios do dia
        var agendamentosDoDia = await _context.Agendamentos
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(a => a.EmpresaId == empresa.Id
                        && a.Status != StatusAgendamento.Cancelado
                        && a.DataInicio < fimDia
                        && a.DataFim > inicioDia)
            .ToListAsync(cancellationToken);

        var bloqueiosDoDia = await _context.BloqueiosAgenda
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(b => b.EmpresaId == empresa.Id
                        && b.DataInicio < fimDia
                        && b.DataFim > inicioDia)
            .ToListAsync(cancellationToken);

        // 5. Verifica se o dia da semana é dia de atendimento da empresa
        var diaSemanaInt = ((int)dataConsulta.DayOfWeek).ToString();
        var diasAtivos = (empresa.DiasFuncionamento ?? "1,2,3,4,5,6")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var culturaPt = new CultureInfo("pt-BR");
        var nomeDiaSemana = culturaPt.DateTimeFormat.GetDayName(dataConsulta.DayOfWeek);
        var duracaoMinutos = servico.DuracaoEstimadaMinutos > 0 ? servico.DuracaoEstimadaMinutos : 60;
        var slots = new List<SlotHorarioResposta>();

        // Se o estúdio não abre neste dia da semana
        if (!diasAtivos.Contains(diaSemanaInt))
        {
            var respostaFechado = new DisponibilidadeDiaResposta(
                dataConsulta,
                char.ToUpper(nomeDiaSemana[0]) + nomeDiaSemana[1..] + " (Fechado)",
                servico.Id,
                servico.Nome,
                duracaoMinutos,
                slots
            );
            return RespostaResultado<DisponibilidadeDiaResposta>.Ok(respostaFechado);
        }

        // 6. Horário de funcionamento configurado pelo Studio
        if (!TimeOnly.TryParse(empresa.HorarioAbertura, out var horaInicioExpediente))
            horaInicioExpediente = new TimeOnly(8, 0);

        if (!TimeOnly.TryParse(empresa.HorarioFechamento, out var horaFimExpediente))
            horaFimExpediente = new TimeOnly(19, 0);

        var inicioExpedienteUtc = dataConsulta.ToDateTime(horaInicioExpediente, DateTimeKind.Utc);
        var fimExpedienteUtc = dataConsulta.ToDateTime(horaFimExpediente, DateTimeKind.Utc);
        var intervaloMinutos = empresa.IntervaloMinutos > 0 ? empresa.IntervaloMinutos : 60;

        var agoraUtc = DateTime.UtcNow;

        // Gera slots no intervalo configurado pelo Studio
        for (var slotInicio = inicioExpedienteUtc; slotInicio < fimExpedienteUtc; slotInicio = slotInicio.AddMinutes(intervaloMinutos))
        {
            var slotFim = slotInicio.AddMinutes(duracaoMinutos);

            var disponivel = true;
            string? motivo = null;

            if (slotFim > fimExpedienteUtc)
            {
                disponivel = false;
                motivo = "Duração ultrapassa o horário de fechamento do estúdio.";
            }
            else if (slotInicio < agoraUtc)
            {
                disponivel = false;
                motivo = "Horário no passado.";
            }
            else
            {
                // Verifica conflito com agendamentos
                var conflitoAgendamento = agendamentosDoDia.Any(a => a.ConflitaCom(slotInicio, slotFim));
                if (conflitoAgendamento)
                {
                    disponivel = false;
                    motivo = "Horário já reservado por outro cliente.";
                }
                else
                {
                    // Verifica conflito com bloqueios
                    var conflitoBloqueio = bloqueiosDoDia.Any(b => b.ConflitaCom(slotInicio, slotFim));
                    if (conflitoBloqueio)
                    {
                        disponivel = false;
                        motivo = "Horário com bloqueio na agenda da profissional.";
                    }
                }
            }

            slots.Add(new SlotHorarioResposta(
                slotInicio,
                slotFim,
                slotInicio.ToString("HH:mm"),
                slotFim.ToString("HH:mm"),
                disponivel,
                motivo
            ));
        }

        var resposta = new DisponibilidadeDiaResposta(
            dataConsulta,
            char.ToUpper(nomeDiaSemana[0]) + nomeDiaSemana[1..],
            servico.Id,
            servico.Nome,
            duracaoMinutos,
            slots
        );

        return RespostaResultado<DisponibilidadeDiaResposta>.Ok(resposta);
    }
}
