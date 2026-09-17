namespace Dominio.Comum;

public abstract class EntidadeBase
{
    public Guid Id { get; protected set; }
    public DateTime DataCriacao { get; protected set; }
    public DateTime? DataAtualizacao { get; protected set; }

    protected EntidadeBase()
    {
        Id = Guid.NewGuid();
        DataCriacao = DateTime.UtcNow;
    }

    protected EntidadeBase(Guid id)
    {
        Id = id;
        DataCriacao = DateTime.UtcNow;
    }

    public void RegistrarAtualizacao()
    {
        DataAtualizacao = DateTime.UtcNow;
    }
}
