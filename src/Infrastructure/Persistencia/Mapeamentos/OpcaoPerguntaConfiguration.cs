using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class OpcaoPerguntaConfiguration : IEntityTypeConfiguration<OpcaoPergunta>
{
    public void Configure(EntityTypeBuilder<OpcaoPergunta> builder)
    {
        builder.ToTable("opcoes_pergunta");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id)
            .HasColumnName("id");

        builder.Property(o => o.PerguntaServicoId)
            .HasColumnName("pergunta_servico_id")
            .IsRequired();

        builder.Property(o => o.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(o => o.Texto)
            .HasColumnName("texto")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(o => o.Ordem)
            .HasColumnName("ordem")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(o => o.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(o => o.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        builder.HasIndex(o => o.EmpresaId);
        builder.HasIndex(o => o.PerguntaServicoId);
    }
}
