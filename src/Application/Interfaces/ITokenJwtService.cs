using Dominio.Entidades;

namespace Aplicacao.Interfaces;

public interface ITokenJwtService
{
    (string Token, DateTime ExpiraEm) GerarToken(Usuario usuario, Empresa empresa);
}
