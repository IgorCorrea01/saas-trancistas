using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Aplicacao.Interfaces;
using Dominio.Entidades;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infraestrutura.Seguranca;

public class TokenJwtService : ITokenJwtService
{
    private readonly IConfiguration _configuration;

    public TokenJwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiraEm) GerarToken(Usuario usuario, Empresa empresa)
    {
        var chaveSecreta = _configuration["Jwt:ChaveSecreta"]
            ?? "ChaveSuperSecretaDesenvolvimentoSaaSDeTrancas20261234567890";
        var emissor = _configuration["Jwt:Emissor"] ?? "TrancasSaaS";
        var audiencia = _configuration["Jwt:Audiencia"] ?? "TrancasSaaS";
        var expiracaoHoras = int.TryParse(_configuration["Jwt:ExpiracaoHoras"], out var horas) ? horas : 24;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(chaveSecreta);
        var expiraEm = DateTime.UtcNow.AddHours(expiracaoHoras);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Email),
            new(JwtRegisteredClaimNames.Name, usuario.Nome),
            new("empresa_id", usuario.EmpresaId.ToString()),
            new("empresa_slug", empresa.Slug),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiraEm,
            Issuer = emissor,
            Audience = audiencia,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(securityToken);

        return (tokenString, expiraEm);
    }
}
