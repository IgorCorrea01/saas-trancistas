using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class OrcamentoConfiguration : IEntityTypeConfiguration<Orcamento>
{
    public void Configure(EntityTypeBuilder<Orcamento> builder)
    {
        builder.ToTable("orcamentos");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id)
            .HasColumnName("id");

        builder.Property(o => o.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(o => o.SolicitacaoOrcamentoId)
            .HasColumnName("solicitacao_orcamento_id")
            .IsRequired();

        builder.Property(o => o.ValorFinal)
            .HasColumnName("valor_final")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(o => o.ValorSinal)
            .HasColumnName("valor_sinal")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(o => o.ValorMaterial)
            .HasColumnName("valor_material")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(o => o.DescricaoMaterial)
            .HasColumnName("descricao_material")
            .HasMaxLength(500);

        builder.Property(o => o.FormasPagamento)
            .HasColumnName("formas_pagamento")
            .HasMaxLength(1000);

        builder.Property(o => o.Observacoes)
            .HasColumnName("observacoes")
            .HasMaxLength(2000);

        builder.Property(o => o.Validade)
            .HasColumnName("validade")
            .IsRequired();

        builder.Property(o => o.TokenPublico)
            .HasColumnName("token_publico")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(o => o.Status)
            .HasColumnName("status")
            .IsRequired();

        builder.Property(o => o.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(o => o.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        builder.HasOne(o => o.SolicitacaoOrcamento)
            .WithMany()
            .HasForeignKey(o => o.SolicitacaoOrcamentoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(o => o.EmpresaId);
        builder.HasIndex(o => o.SolicitacaoOrcamentoId);
        builder.HasIndex(o => o.TokenPublico)
            .IsUnique();
    }
}
