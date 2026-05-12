# 💰 API de Gerenciamento de Renda

Sistema simples de controle financeiro desenvolvido com NestJS e TypeScript.

## 📋 Sobre o Projeto

API REST que permite cadastro e autenticação de usuários, gerenciamento de transações financeiras (entradas e saídas), e consulta de resumo financeiro.

## 🛠️ Stacks

- **Node.js** — Runtime JavaScript
- **TypeScript** — Tipagem estática
- **NestJS** — Framework back-end
- **Prisma** — ORM para acesso ao banco de dados
- **PostgreSQL** — Banco de dados relacional
- **JWT** — Autenticação via token
- **bcrypt** — Hash de senhas
- **Docker** — Containerização do ambiente
- **Jest** — Testes unitários
- **Swagger** — Documentação da API

---

## ⚙️ Pré-requisitos

### Com Docker (recomendado)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **rodando**

### Sem Docker
- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/download/) instalado e rodando na porta 5432

---

## 🚀 Como Rodar o Projeto

### Com Docker (recomendado)

```bash
docker-compose up --build
```

A API ficará disponível em `http://localhost:3000`

A documentação Swagger ficará em `http://localhost:3000/api`

### Sem Docker (desenvolvimento local)

1. Tenha o PostgreSQL rodando localmente
2. Crie o banco de dados usando o script SQL ou o Prisma:

**Opção A — Usando o script SQL:**
```bash
psql -U postgres -f prisma/init.sql
```

**Opção B — Usando o Prisma:**
```bash
npx prisma migrate dev
```

3. Instale as dependências e inicie o servidor:

```bash
# Instalar dependências
npm install

# Gerar o client do Prisma
npx prisma generate

# Iniciar o servidor
npm run start:dev
```

### Rodar os Testes

```bash
npm run test
```

---

## 📌 Variáveis de Ambiente

### ⚠️ Importância do arquivo `.env`

O arquivo `.env` armazena **todas as credenciais e configurações sensíveis** do projeto. Ele **não é versionado** no Git (está listado no `.gitignore`) justamente para evitar a exposição acidental de senhas, chaves secretas e dados de conexão em repositórios públicos ou compartilhados.

**Por que isso importa:**

- **Segurança** — Credenciais expostas em repositórios públicos podem ser exploradas por bots automatizados em questão de minutos. Uma `DATABASE_URL` exposta permite acesso direto ao banco de dados; um `JWT_SECRET` exposto permite falsificar tokens de autenticação.
- **Separação de ambientes** — O mesmo código pode rodar em desenvolvimento, staging e produção, cada um com suas próprias credenciais, bastando trocar o `.env`.
- **Boas práticas** — O [12-Factor App](https://12factor.net/config) recomenda que configurações sensíveis sejam gerenciadas via variáveis de ambiente, nunca hardcoded no código.

### Credenciais no `.env`

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

| Variável | Descrição | Sensível? |
|---|---|:---:|
| `DATABASE_URL` | URL completa de conexão com o PostgreSQL (inclui usuário, senha, host, porta e nome do banco) | ✅ Sim |
| `JWT_SECRET` | Chave secreta usada para assinar e validar os tokens JWT de autenticação | ✅ Sim |
| `POSTGRES_USER` | Usuário do PostgreSQL (usado pelo Docker Compose para criar o banco) | ✅ Sim |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL (usado pelo Docker Compose para criar o banco) | ✅ Sim |
| `POSTGRES_DB` | Nome do banco de dados PostgreSQL (usado pelo Docker Compose) | Não |

### DATABASE_URL

A URL segue o formato:

```
postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public
```

| Parte | O que é | Valor padrão |
|---|---|---|
| `USUARIO` | Usuário do PostgreSQL | `postgres` |
| `SENHA` | Senha do usuário | `postgres` |
| `HOST` | Endereço do servidor | `localhost` (local) ou `postgres` (Docker) |
| `PORTA` | Porta do PostgreSQL | `5432` |
| `NOME_DO_BANCO` | Nome do banco de dados | `financeiro` |

**Se estiver usando Docker:** Não precisa alterar nada. O `docker-compose.yml` já lê as variáveis do `.env` para criar o banco.

**Se estiver usando PostgreSQL local:** Use o usuário e senha que você configurou na instalação do PostgreSQL. O padrão costuma ser `postgres`/`postgres`.

Exemplo:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/financeiro?schema=public"
```

### JWT_SECRET

É a chave secreta usada para gerar e validar os tokens JWT. **Nunca compartilhe essa chave ou a commite no repositório.**

**Para desenvolvimento**, qualquer valor funciona:
```
JWT_SECRET="qualquer-texto-aqui"
```

**Para produção**, gere uma chave aleatória segura:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole no `.env`:
```
JWT_SECRET="cole-o-resultado-aqui"
```

### POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB

Essas variáveis são usadas pelo `docker-compose.yml` para criar o banco de dados PostgreSQL no container. **Em produção, troque o usuário e a senha padrão por valores seguros.**

```
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="uma-senha-forte"
POSTGRES_DB="financeiro"
```

---

## 📖 Sprints

### Sprint 1 — Setup e Banco de Dados

**User Story:** Como desenvolvedor, eu quero configurar o projeto e o banco de dados para ter uma base sólida onde construir as funcionalidades.

**O que foi feito:**
- Inicialização do projeto NestJS com TypeScript
- Configuração do Docker (PostgreSQL + aplicação)
- Criação do schema do Prisma com os modelos `User` e `Transaction`
- Configuração das variáveis de ambiente

**Decisões de design do banco de dados:**

- **UUID como chave primária** — Em vez de IDs sequenciais (1, 2, 3...), optamos por UUIDs. Com IDs sequenciais, um atacante que obtém acesso a um registro pode facilmente deduzir a existência de outros registros incrementando o ID. Com UUIDs, mesmo em caso de vazamento de dados, não é possível enumerar ou adivinhar os identificadores de outros registros.

- **NUMERIC para valores monetários** — Para evitar erros com ponto flutuante, arredondamentos silenciosos e distorção dos totais. O tipo `NUMERIC` armazena o valor exato, garantindo que a soma de entradas e saídas retorne um saldo preciso.

**Modelo lógico do banco de dados:**

O diagrama completo do modelo lógico está disponível no arquivo [`prisma/schema.png`](prisma/schema.png).

**Campos de auditoria temporal:**

- `createdAt` — Registra a data e hora exata em que o registro foi criado. Presente nas tabelas `Users` e `Transactions`. Permite rastrear quando cada usuário se cadastrou e quando cada transação foi lançada.

- `updatedAt` — Presente apenas na tabela `Transactions`. Registra a data e hora da última modificação de uma transação. Isso permite saber se uma transação foi editada após sua criação e quando isso aconteceu — informação importante para auditoria financeira.

**Exemplo prático:** Imagine que um usuário registrou uma despesa de R$ 500,00 no dia 10/01 às 14h. No dia 15/01, ele percebeu que o valor correto era R$ 50,00 e editou a transação. Sem o campo `updatedAt`, não haveria como saber que essa transação foi alterada — o saldo do resumo financeiro mudaria silenciosamente de um déficit de R$ 500 para R$ 50 sem nenhum rastro. Com o `updatedAt`, fica registrado que a transação foi modificada no dia 15/01, permitindo que uma auditoria identifique alterações posteriores e questione divergências nos relatórios.

**Cardinalidade entre as tabelas:**

A relação entre `Users` e `Transactions` segue a cardinalidade **(1,1) para (0,n)**:

- Um **usuário** (1,1) pode ter **zero ou muitas** transações (0,n) — um usuário recém-cadastrado ainda não possui transações, mas pode criar quantas quiser ao longo do tempo.
- Cada **transação** pertence a **exatamente um** usuário — não existem transações sem dono. O campo `userId` na tabela `Transactions` é a chave estrangeira que garante essa ligação, com `ON DELETE CASCADE` para remover automaticamente as transações caso o usuário seja excluído.

---

### Sprint 2 — Autenticação e Transações

**User Story:** Como usuário, eu quero me cadastrar e fazer login para acessar minhas transações financeiras de forma segura.

**User Story:** Como usuário autenticado, eu quero criar, listar, editar e remover minhas transações para controlar minhas finanças.

**User Story:** Como usuário autenticado, eu quero ver um resumo com o total de entradas, saídas e saldo para ter uma visão geral da minha situação financeira.

**O que foi feito:**
- Cadastro de usuários com hash de senha (bcrypt)
- Login com geração de token JWT
- Guard para proteger rotas que exigem autenticação
- CRUD completo de transações (criar, listar, atualizar, remover)
- Endpoint de resumo financeiro (total de entradas, saídas e saldo)
- Documentação com Swagger

---

### Sprint 3 — Testes

**User Story:** Como desenvolvedor, eu quero ter testes unitários para garantir que as funcionalidades principais funcionam corretamente.

**O que foi feito:**
- Testes unitários do `AuthService` (cadastro, login, validações)
- Testes unitários do `TransactionsService` (CRUD e resumo financeiro)

---

## 🔗 Endpoints da API

### App

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Verificar se a API está rodando |

### Auth

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastrar um novo usuário |
| POST | `/auth/login` | Fazer login e receber o token JWT |

### Transactions (requer autenticação)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/transactions` | Criar uma nova transação |
| GET | `/transactions` | Listar todas as transações do usuário |
| GET | `/transactions/summary` | Resumo financeiro (entradas, saídas, saldo) |
| PATCH | `/transactions/:id` | Atualizar uma transação |
| DELETE | `/transactions/:id` | Remover uma transação |

---

## 📁 Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── dto/                 # Data Transfer Objects
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── auth.controller.ts   # Rotas de auth
│   ├── auth.service.ts      # Lógica de auth
│   ├── auth.module.ts       # Módulo NestJS
│   ├── jwt.strategy.ts      # Estratégia JWT do Passport
│   └── jwt-auth.guard.ts    # Guard para rotas protegidas
├── transactions/            # Módulo de transações
│   ├── dto/
│   │   └── create-transaction.dto.ts
│   ├── transactions.controller.ts
│   ├── transactions.service.ts
│   └── transactions.module.ts
├── prisma/                  # Módulo do Prisma
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.controller.ts        # Rota raiz (health check)
├── app.module.ts            # Módulo raiz
└── main.ts                  # Ponto de entrada
```

---

## 🐛 Problemas Conhecidos e Soluções

### Erro: Nest can't resolve dependencies of the JWT_MODULE_OPTIONS

**Erro completo:**

```
[Nest] ERROR [ExceptionHandler] Nest can't resolve dependencies of the JWT_MODULE_OPTIONS (?).
Please make sure that the argument ConfigService at index [0] is available in the JwtModule context.
```

**Causa:** O `ConfigModule.forRoot()` estava sendo importado no `AppModule` sem a opção `isGlobal: true`. Isso fazia com que o `ConfigService` ficasse disponível apenas no `AppModule`, mas não nos módulos filhos como o `AuthModule`, que precisa do `ConfigService` para configurar o `JwtModule`.

**Solução:** Adicionar `isGlobal: true` na configuração do `ConfigModule`:

```typescript
// src/app.module.ts
ConfigModule.forRoot({ isGlobal: true })
```

Com essa flag, o `ConfigService` fica disponível em todos os módulos da aplicação sem precisar importar o `ConfigModule` em cada um.

### Erro: 404 ao acessar http://localhost:3000

**Causa:** A rota raiz `/` não existia — o NestJS só responde nas rotas que estão registradas nos controllers.

**Solução:** Foi criado o `app.controller.ts` com uma rota `GET /` que retorna o status da API:

```json
{
  "status": "ok",
  "message": "API de Gerenciamento de Renda está rodando!",
  "docs": "/api"
}
```

### Erro: Palavras reservadas do PostgreSQL : User e Transaction

**Causa:** Ao testar queries no QueryTool do pgAdmin, as tabelas `User` e `Transaction` causavam erros de sintaxe. Isso acontece porque `USER` e `TRANSACTION` são palavras reservadas do PostgreSQL. Mesmo usando aspas duplas para escapar, os nomes conflitavam com palavras-chave do banco e dificultavam os testes manuais.

**Solução:** Renomeei as tabelas para o plural — `Users` e `Transactions`. Além de evitar o conflito com palavras reservadas, tabelas no plural são uma boa prática de nomenclatura, já que uma tabela armazena múltiplos registros de uma mesma entidade.

No Prisma, usei `@@map` para mapear o nome do modelo para a tabela no banco:

```prisma
model User {
  // campos...
  @@map("Users")
}

model Transaction {
  // campos...
  @@map("Transactions")
}
```

