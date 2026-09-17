using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class ServicoConfiguration : IEntityTypeConfiguration<Servico>
{
    public void Configure(EntityTypeBuilder<Servico> builder)
    {
        builder.ToTable("servicos");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .HasColumnName("id");

        builder.Property(s => s.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(s => s.Nome)
            .HasColumnName("nome")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(s => s.Descricao)
            .HasColumnName("descricao")
            .HasMaxLength(1000);

        builder.Property(s => s.PrecoBase)
            .HasColumnName("preco_base")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(s => s.DuracaoEstimadaMinutos)
            .HasColumnName("duracao_estimada_minutos")
            .IsRequired();

        builder.Property(s => s.Ativo)
            .HasColumnName("ativo")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(s => s.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(s => s.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        // Relacionamento 1:N com Perguntas
        builder.HasMany(s => s.Perguntas)
            .WithOne()
            .HasForeignKey(p => p.ServicoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.Perguntas)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(s => s.EmpresaId);
        builder.HasIndex(s => new { s.EmpresaId, s.Ativo });
    }
}
