using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class BloqueioAgendaConfiguration : IEntityTypeConfiguration<BloqueioAgenda>
{
    public void Configure(EntityTypeBuilder<BloqueioAgenda> builder)
    {
        builder.ToTable("bloqueios_agenda");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id)
            .HasColumnName("id");

        builder.Property(b => b.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(b => b.DataInicio)
            .HasColumnName("data_inicio")
            .IsRequired();

        builder.Property(b => b.DataFim)
            .HasColumnName("data_fim")
            .IsRequired();

        builder.Property(b => b.Motivo)
            .HasColumnName("motivo")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(b => b.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(b => b.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        builder.HasIndex(b => b.EmpresaId);
        builder.HasIndex(b => new { b.EmpresaId, b.DataInicio, b.DataFim });
    }
}
