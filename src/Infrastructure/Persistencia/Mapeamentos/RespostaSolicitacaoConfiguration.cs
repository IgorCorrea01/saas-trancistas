using Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infraestrutura.Persistencia.Mapeamentos;

public class RespostaSolicitacaoConfiguration : IEntityTypeConfiguration<RespostaSolicitacao>
{
    public void Configure(EntityTypeBuilder<RespostaSolicitacao> builder)
    {
        builder.ToTable("respostas_solicitacao");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id)
            .HasColumnName("id");

        builder.Property(r => r.SolicitacaoOrcamentoId)
            .HasColumnName("solicitacao_orcamento_id")
            .IsRequired();

        builder.Property(r => r.PerguntaServicoId)
            .HasColumnName("pergunta_servico_id")
            .IsRequired();

        builder.Property(r => r.EmpresaId)
            .HasColumnName("empresa_id")
            .IsRequired();

        builder.Property(r => r.OpcaoPerguntaId)
            .HasColumnName("opcao_pergunta_id");

        builder.Property(r => r.ValorTexto)
            .HasColumnName("valor_texto")
            .HasMaxLength(2000);

        builder.Property(r => r.CaminhoArquivo)
            .HasColumnName("caminho_arquivo")
            .HasMaxLength(500);

        builder.Property(r => r.NomeArquivoOriginal)
            .HasColumnName("nome_arquivo_original")
            .HasMaxLength(255);

        builder.Property(r => r.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();

        builder.Property(r => r.DataAtualizacao)
            .HasColumnName("data_atualizacao");

        builder.HasOne(r => r.PerguntaServico)
            .WithMany()
            .HasForeignKey(r => r.PerguntaServicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.OpcaoPergunta)
            .WithMany()
            .HasForeignKey(r => r.OpcaoPerguntaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.EmpresaId);
        builder.HasIndex(r => r.SolicitacaoOrcamentoId);
        builder.HasIndex(r => r.PerguntaServicoId);
    }
}
