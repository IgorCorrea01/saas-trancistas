using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class PerguntaServicoConfiguration : IEntityTypeConfiguration<PerguntaServico>
{
    public void Configure(EntityTypeBuilder<PerguntaServico> builder)
    {
        builder.ToTable("perguntas_servico");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasColumnName("id");

        builder.Property(p => p.ServicoId)
            .HasColumnName("servico_id")
            .IsRequired();

        builder.Property(p => p.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(p => p.Enunciado)
            .HasColumnName("enunciado")
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(p => p.DescricaoAjuda)
            .HasColumnName("descricao_ajuda")
            .HasMaxLength(500);

        builder.Property(p => p.Tipo)
            .HasColumnName("tipo")
            .IsRequired();

        builder.Property(p => p.Obrigatoria)
            .HasColumnName("obrigatoria")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(p => p.Ordem)
            .HasColumnName("ordem")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(p => p.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(p => p.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        // Relacionamento 1:N com Opções
        builder.HasMany(p => p.Opcoes)
            .WithOne()
            .HasForeignKey(o => o.PerguntaServicoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Opcoes)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(p => p.EmpresaId);
        builder.HasIndex(p => p.ServicoId);
    }
}
