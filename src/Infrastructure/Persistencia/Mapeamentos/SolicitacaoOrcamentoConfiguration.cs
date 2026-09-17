using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class SolicitacaoOrcamentoConfiguration : IEntityTypeConfiguration<SolicitacaoOrcamento>
{
    public void Configure(EntityTypeBuilder<SolicitacaoOrcamento> builder)
    {
        builder.ToTable("solicitacoes_orcamento");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .HasColumnName("id");

        builder.Property(s => s.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(s => s.ClienteId)
            .HasColumnName("cliente_id")
            .IsRequired();

        builder.Property(s => s.ServicoId)
            .HasColumnName("servico_id")
            .IsRequired();

        builder.Property(s => s.Status)
            .HasColumnName("status")
            .IsRequired();

        builder.Property(s => s.ObservacoesCliente)
            .HasColumnName("observacoes_cliente")
            .HasMaxLength(2000);

        builder.Property(s => s.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(s => s.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        // Relacionamentos
        builder.HasOne(s => s.Cliente)
            .WithMany()
            .HasForeignKey(s => s.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Servico)
            .WithMany()
            .HasForeignKey(s => s.ServicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.Respostas)
            .WithOne()
            .HasForeignKey(r => r.SolicitacaoOrcamentoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.Respostas)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(s => s.EmpresaId);
        builder.HasIndex(s => new { s.EmpresaId, s.Status });
        builder.HasIndex(s => s.ClienteId);
        builder.HasIndex(s => s.ServicoId);
    }
}
