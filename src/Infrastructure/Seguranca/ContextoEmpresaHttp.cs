using System.Security.Claims;
using Aplicacao.Comum;
using Microsoft.AspNetCore.Http;

namespace Infraestrutura.Seguranca;

public class ContextoEmpresaHttp : IContextoEmpresa
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _empresaIdManual;

    public ContextoEmpresaHttp(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? EmpresaId
    {
        get
        {
            if (_empresaIdManual.HasValue)
                return _empresaIdManual.Value;

            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return null;

            // 1. Tenta obter das Claims do JWT
            var claimEmpresaId = httpContext.User.FindFirst("empresa_id")?.Value
                              ?? httpContext.User.FindFirst("EmpresaId")?.Value
                              ?? httpContext.User.FindFirst(ClaimTypes.GroupSid)?.Value;

            if (!string.IsNullOrWhiteSpace(claimEmpresaId) && Guid.TryParse(claimEmpresaId, out var idGuid))
            {
                return idGuid;
            }

            // 2. Tenta obter de cabeçalho personalizado (ex: X-Empresa-Id)
            if (httpContext.Request.Headers.TryGetValue("X-Empresa-Id", out var headerValor))
            {
                if (Guid.TryParse(headerValor.ToString(), out var headerGuid))
                {
                    return headerGuid;
                }
            }

            // 3. Tenta obter dos itens do HttpContext (armazenado por middleware)
            if (httpContext.Items.TryGetValue("EmpresaId", out var itemValor) && itemValor is Guid guidItem)
            {
                return guidItem;
            }

            return null;
        }
    }

    public bool PossuiContexto => EmpresaId.HasValue;

    public void DefinirEmpresaId(Guid empresaId)
    {
        _empresaIdManual = empresaId;
    }
}
