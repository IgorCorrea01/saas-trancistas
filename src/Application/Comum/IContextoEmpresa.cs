namespace Aplicacao.Comum;

public interface IContextoEmpresa
{
    Guid? EmpresaId { get; }
    bool PossuiContexto { get; }
    void DefinirEmpresaId(Guid empresaId);
}
