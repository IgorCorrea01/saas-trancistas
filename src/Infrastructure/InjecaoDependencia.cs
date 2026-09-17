using System.Text;
using Aplicacao.Comum;
using Aplicacao.Interfaces;
using Infraestrutura.Armazenamento;
using Infraestrutura.Persistencia;
using Infraestrutura.Seguranca;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infraestrutura;

public static class InjecaoDependencia
{
    public static IServiceCollection AddInfraestrutura(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();

        // Resolução do Contexto da Empresa (Tenant)
        services.AddScoped<IContextoEmpresa, ContextoEmpresaHttp>();

        // Serviços de Segurança, Criptografia e Armazenamento
        services.AddSingleton<IServicoCriptografia, ServicoCriptografia>();
        services.AddScoped<ITokenJwtService, TokenJwtService>();

        var provedorArmazenamento = configuration["Armazenamento:Provedor"] ?? "Local";
        if (provedorArmazenamento.Equals("S3", StringComparison.OrdinalIgnoreCase) ||
            provedorArmazenamento.Equals("R2", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton<IArmazenamentoArquivos, ArmazenamentoArquivosS3>();
        }
        else
        {
            services.AddSingleton<IArmazenamentoArquivos, ArmazenamentoArquivosLocal>();
        }

        // Configuração dinâmica do DbContext (suporte a SQLite, PostgreSQL e InMemory em runtime)
        services.AddDbContext<AppDbContext>((serviceProvider, options) =>
        {
            var config = serviceProvider.GetRequiredService<IConfiguration>();
            var provedorBanco = config["ProvedorBanco"] ?? "SQLite";

            if (provedorBanco.Equals("InMemory", StringComparison.OrdinalIgnoreCase))
            {
                var dbName = config["InMemoryDbName"] ?? "TrancasDbInMemory";
                options.UseInMemoryDatabase(dbName);
            }
            else if (provedorBanco.Equals("SQLite", StringComparison.OrdinalIgnoreCase))
            {
                var connectionString = config.GetConnectionString("ConexaoPadrao") ?? "Data Source=trancas.db";
                options.UseSqlite(connectionString, sqliteOptions =>
                {
                    sqliteOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                });
            }
            else
            {
                var connectionString = config.GetConnectionString("ConexaoPadrao") ?? config["DATABASE_URL"];
                if (!string.IsNullOrWhiteSpace(connectionString))
                {
                    var connectionFormatada = FormatarNpgsqlConnectionString(connectionString);
                    options.UseNpgsql(connectionFormatada, npgsqlOptions =>
                    {
                        npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                        npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
                    });
                }
            }
        });

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // Configuração de Autenticação JWT
        var chaveSecreta = configuration["Jwt:ChaveSecreta"]
            ?? "ChaveSuperSecretaDesenvolvimentoSaaSDeTrancas20261234567890";
        var emissor = configuration["Jwt:Emissor"] ?? "TrancasSaaS";
        var audiencia = configuration["Jwt:Audiencia"] ?? "TrancasSaaS";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chaveSecreta)),
                ValidateIssuer = true,
                ValidIssuer = emissor,
                ValidateAudience = true,
                ValidAudience = audiencia,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        return services;
    }

    private static string FormatarNpgsqlConnectionString(string rawConnectionString)
    {
        if (string.IsNullOrWhiteSpace(rawConnectionString))
            return rawConnectionString;

        // Se a string começar com postgres:// ou postgresql:// (URI comum do Neon, Supabase, Render)
        if (rawConnectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            rawConnectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(rawConnectionString);
                var builder = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = uri.Host,
                    Port = uri.Port > 0 ? uri.Port : 5432,
                    Database = uri.AbsolutePath.TrimStart('/'),
                    SslMode = Npgsql.SslMode.Require,
                };

                var userInfo = uri.UserInfo.Split(':');
                if (userInfo.Length > 0 && !string.IsNullOrWhiteSpace(userInfo[0]))
                    builder.Username = Uri.UnescapeDataString(userInfo[0]);
                if (userInfo.Length > 1 && !string.IsNullOrWhiteSpace(userInfo[1]))
                    builder.Password = Uri.UnescapeDataString(userInfo[1]);

                return builder.ConnectionString;
            }
            catch
            {
                return rawConnectionString;
            }
        }

        return rawConnectionString;
    }
}
