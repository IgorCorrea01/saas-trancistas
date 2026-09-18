<div align="center">

# 👑 TrançaFlow — SaaS para Trancistas & Estúdios de Beleza

**Transforme pedidos de orçamento em atendimentos confirmados sem perder horas no WhatsApp.**

Plataforma SaaS full-stack desenvolvida para profissionais de tranças afro e serviços de beleza personalizados, combinando **Clean Architecture** em **.NET 9**, **Next.js 15 (App Router)**, **PostgreSQL (Neon)** e armazenamento em nuvem via **Cloudflare R2**.

---

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com/products/r2/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[Funcionalidades](#-funcionalidades-principais) • [Arquitetura](#-arquitetura) • [Tecnologias](#-stack-tecnológica) • [Como Executar](#-como-executar-localmente) • [Deploy](#-deploy)

</div>

---

## 💡 O Problema que Resolvemos

Trancistas e especialistas em beleza costumam receber dezenas de mensagens diárias no Instagram e WhatsApp. Antes de passar um preço, precisam perguntar: *modelo desejado, tamanho, espessura, material, cor do cabelo, disponibilidade de agenda e referências*.

Isso resulta em:
- ⏳ **Horas perdidas** respondendo as mesmas perguntas repetidamente.
- 📱 **Informações espalhadas** e prints perdidos na galeria do celular.
- 📉 **Perda de clientes** que desistem pela demora na resposta.
- 🚫 **Falta de garantia** por falta de cobrança padronizada de sinal (PIX).

O **TrançaFlow** centraliza todo o fluxo: a cliente acessa o link na bio (`trancaflow.app/seu-studio`), escolhe a trança, preenche o formulário detalhado com foto de referência e envia a solicitação. A profissional analisa, aprova o valor e agenda com 1 clique.

---

## ✨ Funcionalidades Principais

### 🌐 Catálogo Público & Link na Bio (`/{slug}`)
- **Página exclusiva da profissional** para divulgar no Instagram/WhatsApp.
- Apresentação de serviços com fotos, tempo estimado e faixa de preço.
- Perfil personalizado com bio, foto de perfil, redes sociais e chave PIX.

### 📋 Formulário Dinâmico de Orçamento Inteligente
- Cada serviço pode conter campos customizados: *comprimento (ex: cintura, quadril), espessura (fina, média, grossa), material incluído (Jumbo, Kanekalon, Orgânico), cor e observações*.
- **Upload de foto de referência** armazenada com segurança em bucket S3/Cloudflare R2.
- Prévia de valor em tempo real para a cliente.

### ⚡ Painel de Gestão & Solicitações
- **Dashboard com métricas**: faturamento previsto, total de atendimentos e solicitações pendentes.
- **Aprovação / Recusa de Orçamentos**: ajuste de preço final, valor de sinal e horários sugeridos.
- **Cobrança de Sinal Integrada**: exibição dos dados PIX com botão de cópia rápida para envio à cliente.

### 📅 Agenda & Gestão de Atendimentos
- Controle visual de horários ocupados e disponíveis.
- Configuração de dias de funcionamento, horário de abertura/fechamento e intervalo padrão entre atendimentos.
- Link público de acompanhamento do agendamento para a cliente.

### 💬 Central de Mensagens WhatsApp
Modelos prontos e personalizáveis com variáveis dinâmicas (`{nomeCliente}`, `{nomeServico}`, `{dataAtendimento}`, etc.):
- 🔔 **Lembrete de Atendimento (24h antes)**
- 📍 **Como Chegar / Localização do Estúdio**
- 🧴 **Cuidados Pós-Trança** (lavagem, touca de cetim, durabilidade)
- 🌸 **Mensagem de Retorno / Manutenção** (pós 40 dias)

### ⚙️ Perfil & Configurações com Compressão Inteligente
- Edição de identidade visual, dados do estúdio e slug personalizado.
- **Compressão automática de imagens no upload** (Canvas HTML5), garantindo alta resolução e carregamento instantâneo.

---

## 🏛 Arquitetura

O backend foi construído seguindo rigorosamente os padrões de **Clean Architecture** e **Domain-Driven Design (DDD)** pragmático, com multi-tenancy nativo por empresa/estúdio:

```text
Trancas/
├── src/
│   ├── Dominio/          # Entidades puras, Enums, Objetos de Valor e Regras de Negócio
│   ├── Aplicacao/        # Casos de Uso (Handlers), DTOs, Validadores (FluentValidation) e Interfaces
│   ├── Infraestrutura/   # EF Core 9, PostgreSQL, BCrypt, Cloudflare R2 / AWS S3 Storage
│   └── Api/              # Controllers RESTful, Middlewares (Tenant/Auth), Swagger e Injeção de Dependência
│
├── frontend/             # Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/          # Rotas do App Router (Landing, Autenticado, Catálogo Público)
│   │   ├── componentes/  # Componentes reutilizáveis (shadcn/ui, Layout, Modais)
│   │   ├── hooks/        # React Query hooks e gerenciamento de estado
│   │   ├── servicos/     # Clientes HTTP (Axios) e integração com API
│   │   └── tipos/        # Tipagens TypeScript compartilhadas
│   └── public/           # Ativos estáticos e ícones
│
└── tests/                # Testes Unitários e de Integração com xUnit, Moq e FluentAssertions
```

---

## 🛠️ Stack Tecnológica

### Backend (.NET 9)
- **Framework**: ASP.NET Core 9 Web API
- **ORM & Banco**: Entity Framework Core 9 + PostgreSQL (compatível com Neon e Docker)
- **Armazenamento de Arquivos**: Cloudflare R2 / AWS S3 (`AWSSDK.S3`)
- **Autenticação**: JWT Bearer Tokens + Hash BCrypt
- **Validação**: FluentValidation
- **Documentação**: Swagger / OpenAPI

### Frontend (Next.js 15)
- **Framework**: Next.js 15 (App Router) + React 19
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + `tailwindcss-animate`
- **Componentes**: Radix UI + Lucide Icons + shadcn/ui
- **Data Fetching**: TanStack React Query v5 + Axios

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/) e npm
- [Docker & Docker Compose](https://www.docker.com/) (opcional para PostgreSQL local)

---

### 2. Configurando o Backend

1. Configure as variáveis de ambiente em `src/Api/appsettings.Development.json` (ou use variáveis de ambiente):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=trancas_db;Username=postgres;Password=postgres"
     },
     "Jwt": {
       "Secret": "SUA_CHAVE_SECRETA_SUPER_SEGURA_COM_MINIMO_32_CHARS!",
       "ExpiracaoHoras": 24
     },
     "R2": {
       "ServiceUrl": "https://<ACCOUNT_ID>.r2.cloudflarestorage.com",
       "AccessKey": "SEU_ACCESS_KEY",
       "SecretKey": "SEU_SECRET_KEY",
       "BucketName": "trancas-midias",
       "PublicUrl": "https://pub-<ID>.r2.dev"
     }
   }
   ```

2. Suba o banco PostgreSQL via Docker (se desejar rodar o banco local):
   ```bash
   docker-compose up -d postgres
   ```

3. Execute as migrações e inicie a API:
   ```bash
   dotnet run --project src/Api
   ```
   A API estará rodando em `http://localhost:5242` e o Swagger em `http://localhost:5242/swagger`.

---

### 3. Configurando o Frontend

1. Entre na pasta `frontend`:
   ```bash
   cd frontend
   ```

2. Crie o arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5242
   ```

3. Instale as dependências e execute o servidor de desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```

4. Acesse a aplicação em seu navegador:
   ```text
   http://localhost:3000
   ```

---

## 🧪 Testes Automatizados

Para rodar toda a suíte de testes unitários e de integração do backend:

```bash
dotnet test
```

---

## 🚢 Deploy

| Componente | Provedor Recomendado | Variáveis Chave |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | `NEXT_PUBLIC_API_URL` |
| **Backend API** | [Render](https://render.com/) / Railway | `ConnectionStrings__DefaultConnection`, `Jwt__Secret`, `R2__*` |
| **Banco de Dados** | [Neon](https://neon.tech/) (PostgreSQL Serverless) | `postgresql://...` |
| **Storage de Fotos** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) | Chaves de Acesso S3 e Bucket |

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

<div align="center">
  <sub>Desenvolvido com 💖 para impulsionar o trabalho de trancistas e profissionais da beleza.</sub>
</div>
