using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class EmpresaConfiguration : IEntityTypeConfiguration<Empresa>
{
    public void Configure(EntityTypeBuilder<Empresa> builder)
    {
        builder.ToTable("empresas");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("id");

        builder.Property(e => e.Nome)
            .HasColumnName("nome")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(e => e.Slug)
            .HasColumnName("slug")
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(e => e.Slug)
            .IsUnique();

        builder.Property(e => e.Ativa)
            .HasColumnName("ativa")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(e => e.HorarioAbertura)
            .HasColumnName("horario_abertura")
            .HasMaxLength(10)
            .HasDefaultValue("08:00")
            .IsRequired();

        builder.Property(e => e.HorarioFechamento)
            .HasColumnName("horario_fechamento")
            .HasMaxLength(10)
            .HasDefaultValue("19:00")
            .IsRequired();

        builder.Property(e => e.DiasFuncionamento)
            .HasColumnName("dias_funcionamento")
            .HasMaxLength(50)
            .HasDefaultValue("1,2,3,4,5,6")
            .IsRequired();

        builder.Property(e => e.IntervaloMinutos)
            .HasColumnName("intervalo_minutos")
            .HasDefaultValue(60)
            .IsRequired();

        builder.Property(e => e.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(e => e.DataAtualizacao)
            .HasColumnName("data_atualizacao");
    }
}
