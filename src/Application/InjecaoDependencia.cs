using Aplicacao.Appointments;
using Aplicacao.Autenticacao;
using Aplicacao.Dashboard;
using Aplicacao.Empresas;
using Aplicacao.Orcamentos;
using Aplicacao.Servicos;
using Aplicacao.Solicitacoes;
using Microsoft.Extensions.DependencyInjection;

namespace Aplicacao;

public static class InjecaoDependencia
{
    public static IServiceCollection AddAplicacao(this IServiceCollection services)
    {
        // Casos de Uso de Autenticação
        services.AddScoped<RegistrarEmpresaCasoDeUso>();
        services.AddScoped<AutenticarUsuarioCasoDeUso>();
        services.AddScoped<ObterPerfilUsuarioCasoDeUso>();

        // Casos de Uso de Empresas
        services.AddScoped<ObterEmpresaAtualCasoDeUso>();
        services.AddScoped<AtualizarEmpresaAtualCasoDeUso>();

        // Casos de Uso de Serviços de Tranças
        services.AddScoped<CriarServicoCasoDeUso>();
        services.AddScoped<AtualizarServicoCasoDeUso>();
        services.AddScoped<ObterServicoPorIdCasoDeUso>();
        services.AddScoped<ListarServicosCasoDeUso>();
        services.AddScoped<AlternarStatusServicoCasoDeUso>();
        services.AddScoped<RemoverServicoCasoDeUso>();
        services.AddScoped<ConfigurarFormularioServicoCasoDeUso>();
        services.AddScoped<CriarServicosPadraoTrancistaCasoDeUso>();

        // Casos de Uso de Solicitações de Orçamento
        services.AddScoped<CriarSolicitacaoOrcamentoCasoDeUso>();
        services.AddScoped<ListarSolicitacoesOrcamentoCasoDeUso>();
        services.AddScoped<ObterSolicitacaoOrcamentoPorIdCasoDeUso>();
        services.AddScoped<AtualizarStatusSolicitacaoCasoDeUso>();

        // Casos de Uso de Orçamentos
        services.AddScoped<CriarOrcamentoCasoDeUso>();
        services.AddScoped<ObterOrcamentoPorIdCasoDeUso>();
        services.AddScoped<ObterOrcamentoPorSolicitacaoIdCasoDeUso>();
        services.AddScoped<ObterOrcamentoPorTokenPublicoCasoDeUso>();
        services.AddScoped<AceitarOrcamentoPublicoCasoDeUso>();
        services.AddScoped<RecusarOrcamentoPublicoCasoDeUso>();

        // Casos de Uso de Agendamentos e Agenda
        services.AddScoped<ConsultarHorariosDisponiveisCasoDeUso>();
        services.AddScoped<CriarAgendamentoPublicoCasoDeUso>();
        services.AddScoped<ListarAgendamentosCasoDeUso>();
        services.AddScoped<ObterAgendamentoPorIdCasoDeUso>();
        services.AddScoped<AtualizarStatusAgendamentoCasoDeUso>();
        services.AddScoped<CriarBloqueioAgendaCasoDeUso>();
        services.AddScoped<ListarBloqueiosAgendaCasoDeUso>();
        services.AddScoped<RemoverBloqueioAgendaCasoDeUso>();

        // Casos de Uso do Dashboard
        services.AddScoped<ObterDashboardResumoCasoDeUso>();

        return services;
    }
}
