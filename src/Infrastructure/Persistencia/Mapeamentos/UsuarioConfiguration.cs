using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id)
            .HasColumnName("id");

        builder.Property(u => u.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(u => u.Nome)
            .HasColumnName("nome")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(u => u.SenhaHash)
            .HasColumnName("senha_hash")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(u => u.Ativo)
            .HasColumnName("ativo")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(u => u.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(u => u.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        // Relacionamento com Empresa
        builder.HasOne(u => u.Empresa)
            .WithMany()
            .HasForeignKey(u => u.EmpresaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índice único: mesmo e-mail por empresa
        builder.HasIndex(u => new { u.EmpresaId, u.Email })
            .IsUnique();

        // Índice auxiliar de consulta por empresa
        builder.HasIndex(u => u.EmpresaId);
    }
}
