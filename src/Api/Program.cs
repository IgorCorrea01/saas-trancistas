using Api.Middlewares;
using Aplicacao;
using Infraestrutura;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Adiciona Controllers
builder.Services.AddControllers();

// Configuração OpenAPI nativa do .NET 9
builder.Services.AddOpenApi();

// Injeção de Dependências
builder.Services.AddAplicacao();
builder.Services.AddInfraestrutura(builder.Configuration);

// CORS configurado para permitir origens do frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("Padrao", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Inicialização e garantia de schema do banco de dados (SQLite, PostgreSQL ou InMemory)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();

        // Se estiver usando SQLite e a base já existia anteriormente, garante a adição das novas colunas
        if (db.Database.IsSqlite())
        {
            var comandosMigracao = new[]
            {
                "ALTER TABLE empresas ADD COLUMN horario_abertura TEXT DEFAULT '08:00';",
                "ALTER TABLE empresas ADD COLUMN horario_fechamento TEXT DEFAULT '19:00';",
                "ALTER TABLE empresas ADD COLUMN dias_funcionamento TEXT DEFAULT '1,2,3,4,5,6';",
                "ALTER TABLE empresas ADD COLUMN intervalo_minutos INTEGER DEFAULT 60;"
            };

            foreach (var comando in comandosMigracao)
            {
                try
                {
                    await db.Database.ExecuteSqlRawAsync(comando);
                }
                catch
                {
                    // Se a coluna já existir, o SQLite gerará exceção que é ignorada com segurança
                }
            }
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Aviso de inicialização do banco de dados: {Mensagem}", ex.Message);
    }
}

// Middleware Global de Tratamento de Erros
app.UseMiddleware<TratamentoErrosMiddleware>();

// OpenAPI e Scalar API Reference (Documentação interativa em desenvolvimento)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Trancas SaaS API")
               .WithTheme(ScalarTheme.Moon);
    });
}

app.UseCors("Padrao");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Necessário para testes de integração com WebApplicationFactory
public partial class Program { }
