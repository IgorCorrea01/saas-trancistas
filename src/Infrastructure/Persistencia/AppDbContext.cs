using System.Linq.Expressions;
using Aplicacao.Comum;
using Dominio.Comum;
using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Infraestrutura.Persistencia;

public class AppDbContext : DbContext, IAppDbContext
{
    private readonly IContextoEmpresa _contextoEmpresa;

    public DbSet<Empresa> Empresas => Set<Empresa>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Servico> Servicos => Set<Servico>();
    public DbSet<PerguntaServico> PerguntasServico => Set<PerguntaServico>();
    public DbSet<OpcaoPergunta> OpcoesPergunta => Set<OpcaoPergunta>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<SolicitacaoOrcamento> SolicitacoesOrcamento => Set<SolicitacaoOrcamento>();
    public DbSet<RespostaSolicitacao> RespostasSolicitacao => Set<RespostaSolicitacao>();
    public DbSet<Orcamento> Orcamentos => Set<Orcamento>();
    public DbSet<Agendamento> Agendamentos => Set<Agendamento>();
    public DbSet<BloqueioAgenda> BloqueiosAgenda => Set<BloqueioAgenda>();

    public AppDbContext(DbContextOptions<AppDbContext> options, IContextoEmpresa contextoEmpresa)
        : base(options)
    {
        _contextoEmpresa = contextoEmpresa;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplica todas as configurações de entidades do assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Aplica automaticamente Global Query Filter para todas as entidades com isolamento por empresa
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IEntidadeEmpresa).IsAssignableFrom(entityType.ClrType))
            {
                var metodoConfiguracao = typeof(AppDbContext)
                    .GetMethod(nameof(AplicarFiltroEmpresa), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                    ?.MakeGenericMethod(entityType.ClrType);

                metodoConfiguracao?.Invoke(this, new object[] { modelBuilder });
            }
        }
    }

    private void AplicarFiltroEmpresa<T>(ModelBuilder modelBuilder) where T : class, IEntidadeEmpresa
    {
        modelBuilder.Entity<T>().HasQueryFilter(e => _contextoEmpresa.EmpresaId == null || e.EmpresaId == _contextoEmpresa.EmpresaId);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries();

        foreach (var entry in entries)
        {
            // Garante isolamento de tenant na criação se não foi explicitamente definido
            if (entry.State == EntityState.Added && entry.Entity is IEntidadeEmpresa entidadeEmpresa)
            {
                if (entidadeEmpresa.EmpresaId == Guid.Empty && _contextoEmpresa.EmpresaId.HasValue)
                {
                    entry.Property(nameof(IEntidadeEmpresa.EmpresaId)).CurrentValue = _contextoEmpresa.EmpresaId.Value;
                }
            }

            // Atualiza data de modificação
            if (entry.State == EntityState.Modified && entry.Entity is EntidadeBase entidadeBase)
            {
                entidadeBase.RegistrarAtualizacao();
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
