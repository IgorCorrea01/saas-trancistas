# Trancas SaaS — Plataforma de Orçamentos e Agendamentos

Plataforma SaaS web para profissionais autônomos de serviços de beleza personalizados (trancistas, manicures, cabeleireiros, etc.), com Clean Architecture e foco total em experiência mobile-first.

---

## 🏛 Arquitetura

O projeto segue os princípios de **Clean Architecture** pragmática, com todo o domínio em **Português**:

```text
src/
├── Dominio/          # Entidades, Enums, Regras de negócio e Exceções de Domínio (puro)
├── Aplicacao/        # Casos de uso, DTOs, Validadores e Contratos de infraestrutura
├── Infraestrutura/   # Entity Framework Core 9, PostgreSQL (Npgsql), BCrypt, Tenant Http Context
└── Api/              # ASP.NET Core 9 Web API, Controllers, Middlewares, Swagger, DI
```

---

## 🚀 Como Executar

### Pré-requisitos
* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* [Docker & Docker Compose](https://www.docker.com/) (opcional para ambiente conteinerizado)

### Executando com Docker Compose

1. Inicie os containers do banco e da API:
   ```bash
   docker-compose up --build
   ```
2. Acesse a documentação do Swagger:
   ```text
   http://localhost:5000/swagger
   ```

### Executando Localmente

1. Suba apenas o PostgreSQL via Docker:
   ```bash
   docker-compose up -d postgres
   ```
2. Execute a API:
   ```bash
   dotnet run --project src/Api
   ```
3. Teste a saúde da aplicação:
   ```bash
   GET http://localhost:5000/api/saude
   ```

---

## 🧪 Testes Automatizados

Execute todas as suítes de testes unitários e de integração:

```bash
dotnet test
```
