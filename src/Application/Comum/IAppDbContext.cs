using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Comum;

public interface IAppDbContext
{
    DbSet<Empresa> Empresas { get; }
    DbSet<Usuario> Usuarios { get; }
    DbSet<Servico> Servicos { get; }
    DbSet<PerguntaServico> PerguntasServico { get; }
    DbSet<OpcaoPergunta> OpcoesPergunta { get; }
    DbSet<Cliente> Clientes { get; }
    DbSet<SolicitacaoOrcamento> SolicitacoesOrcamento { get; }
    DbSet<RespostaSolicitacao> RespostasSolicitacao { get; }
    DbSet<Orcamento> Orcamentos { get; }
    DbSet<Agendamento> Agendamentos { get; }
    DbSet<BloqueioAgenda> BloqueiosAgenda { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
