using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class AgendamentoConfiguration : IEntityTypeConfiguration<Agendamento>
{
    public void Configure(EntityTypeBuilder<Agendamento> builder)
    {
        builder.ToTable("agendamentos");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id)
            .HasColumnName("id");

        builder.Property(a => a.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(a => a.ClienteId)
            .HasColumnName("cliente_id")
            .IsRequired();

        builder.Property(a => a.ServicoId)
            .HasColumnName("servico_id")
            .IsRequired();

        builder.Property(a => a.OrcamentoId)
            .HasColumnName("orcamento_id");

        builder.Property(a => a.DataInicio)
            .HasColumnName("data_inicio")
            .IsRequired();

        builder.Property(a => a.DataFim)
            .HasColumnName("data_fim")
            .IsRequired();

        builder.Property(a => a.Status)
            .HasColumnName("status")
            .IsRequired();

        builder.Property(a => a.Observacoes)
            .HasColumnName("observacoes")
            .HasMaxLength(2000);

        builder.Property(a => a.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(a => a.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        // Relacionamentos
        builder.HasOne(a => a.Cliente)
            .WithMany()
            .HasForeignKey(a => a.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Servico)
            .WithMany()
            .HasForeignKey(a => a.ServicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Orcamento)
            .WithMany()
            .HasForeignKey(a => a.OrcamentoId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(a => a.EmpresaId);
        builder.HasIndex(a => new { a.EmpresaId, a.DataInicio, a.DataFim });
        builder.HasIndex(a => new { a.EmpresaId, a.Status });
        builder.HasIndex(a => a.ClienteId);
        builder.HasIndex(a => a.OrcamentoId);
    }
}
