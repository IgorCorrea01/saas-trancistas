using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("clientes");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasColumnName("id");

        builder.Property(c => c.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(c => c.Nome)
            .HasColumnName("nome")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(c => c.Telefone)
            .HasColumnName("telefone")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(c => c.Email)
            .HasColumnName("email")
            .HasMaxLength(150);

        builder.Property(c => c.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(c => c.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        builder.HasIndex(c => c.EmpresaId);
        builder.HasIndex(c => new { c.EmpresaId, c.Telefone });
    }
}
