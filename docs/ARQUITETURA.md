# Arquitetura da API

Como a API funciona por dentro: estrutura, fluxo de uma requisição, autenticação,
autorização (RBAC), validação, tratamento de erros e camada de dados.

> Para **rodar localmente** e a **lista de rotas**, veja o [`README.md`](../README.md).
> Para **deploy**, veja o [`DEPLOY.md`](../DEPLOY.md).

---

## Visão geral

REST API em **Node.js + Express 5 + TypeScript**, rodada direto com **tsx** (sem
build em produção). Persistência com **Prisma** (client gerado em
`prisma/generated`) sobre **MySQL**, usando o **adapter MariaDB**. Autenticação por
**JWT** e autorização por **RBAC** (papéis × permissões).

```
Cliente ──HTTP──> Express (app.ts) ──> middlewares globais ──> rotas do módulo
                                                                    │
                                              middlewares da rota (auth, RBAC, Zod)
                                                                    │
                                                       Controller ──> Service ──> Prisma ──> MySQL
```

---

## Estrutura de pastas

```
src/
├─ server.ts                 # sobe o HTTP server (usa process.env.PORT)
├─ app.ts                    # cria o app Express, registra middlewares e rotas
├─ lib/
│  └─ prisma.ts              # instancia o PrismaClient (adapter MariaDB + SSL opcional)
├─ middlewares/              # peças reutilizáveis do pipeline de request
│  ├─ auth.middleware.ts         # valida o JWT (Bearer) e popula req.user
│  ├─ authorization.middleware.ts# checkRole / checkPermission (RBAC)
│  ├─ validateZod.middleware.ts  # valida body/params/query com Zod
│  ├─ cors.middleware.ts         # CORS configurável por env
│  ├─ logger.middleware.ts       # loga método, rota, status e tempo
│  ├─ error.middleware.ts        # notFound + handler global de erros
│  └─ upload*.middleware.ts      # uploads via Multer (curso, perfil, documentos)
├─ modules/                  # um diretório por domínio
│  └─ <modulo>/
│     ├─ <modulo>.routes.ts      # define as rotas e os middlewares de cada uma
│     ├─ <modulo>.controller.ts  # lê req, chama o service, devolve res
│     ├─ <modulo>.service.ts     # regra de negócio + acesso ao Prisma
│     └─ <modulo>.schema.ts      # schemas Zod (validação e tipos DTO)
├─ utils/
│  ├─ AppError.ts            # erro com statusCode para o handler global
│  ├─ getEnv.ts              # lê env obrigatória (lança se faltar)
│  ├─ hashToken.ts           # hash de refresh/reset tokens
│  └─ usersAndProfiles/      # helpers de criação de usuário + perfil
└─ types/                    # extensões de tipos (ex.: req.user no Express)

prisma/
├─ schema/                   # schema dividido em vários .prisma (um por modelo)
├─ migrations/               # histórico de migrations (11 até agora)
├─ generated/                # client do Prisma gerado (não editar)
└─ seed.ts                   # popula papéis, permissões, usuários e dados de exemplo
```

**Módulos existentes:** `auth`, `profile`, `cursos`, `professor`, `subscription`
(inscrições + documentos), `deppi`, `reports`, `instituicoes`, `usuarios`,
`permissoes`, `departamentos`.

---

## Fluxo de uma requisição

Registrado em [`src/app.ts`](../src/app.ts), nesta ordem:

1. **`corsMiddleware`** — libera/bloqueia a origem conforme `CORS_ORIGINS`.
2. **`express.json()`** — faz o parse do corpo JSON.
3. **`requestLogger`** — mede o tempo e loga ao finalizar a resposta.
4. **Rotas do módulo** (`/autenticacao`, `/cursos`, ...). Dentro de cada rota rodam,
   quando aplicável:
   - **`authMiddleware`** — exige `Authorization: Bearer <token>` válido.
   - **`checkRole` / `checkPermission`** — autorização (RBAC).
   - **`validateZod`** — valida `body` / `params` / `query`.
   - **`upload*`** (Multer) — quando há envio de arquivo.
   - **Controller** — orquestra e responde.
5. **`notFoundHandler`** — se nenhuma rota casou → `404 { "error": "Rota nao encontrada." }`.
6. **`errorHandler`** — captura erros e padroniza a resposta.

O endpoint **`GET /health`** fica fora desse fluxo de negócio e responde `{ "status": "ok" }`.

---

## Padrão de módulo (routes → controller → service)

Cada módulo segue a mesma separação de responsabilidades:

- **`routes`** — declara método + caminho e encadeia os middlewares (auth, RBAC, Zod).
- **`controller`** — camada fina: lê `req`, chama o service e devolve o `res`. Não
  contém regra de negócio.
- **`service`** — regra de negócio e todo o acesso ao banco via Prisma. Lança
  `AppError` quando algo é inválido.
- **`schema`** — schemas Zod que validam a entrada e geram os tipos (`DTO`).

Isso mantém as regras testáveis e desacopladas do Express.

---

## Autenticação (JWT + refresh token)

Implementada em [`src/modules/auth`](../src/modules/auth).

### Login (`POST /autenticacao/login`)

1. Busca o usuário por e-mail (incluindo papéis e permissões).
2. Compara a senha com `bcrypt.compare` contra o `senhaHash`.
3. Monta o **payload do access token** com `sub` (id), `name`, `email`, `roles` e
   `permissions` (lista de `recurso:acao`).
4. Assina um **access token** JWT (`JWT_SECRET`), expira em **15 min**.
5. Gera um **refresh token** aleatório (`crypto.randomBytes`), guarda **só o hash**
   (`hashToken`) na tabela `refresh_tokens` com validade de **7 dias**, e devolve o
   token cru ao cliente.

> O access token carrega roles e permissions, então a autorização não precisa
> consultar o banco a cada request — o middleware lê tudo do próprio token.

### Renovação (`POST /autenticacao/refresh`)

Recebe o refresh token, procura pelo **hash**, valida (não revogado, não expirado) e
emite um novo access token. Não gera um novo refresh (o mesmo vale por 7 dias).

### Logout (`POST /autenticacao/logout`)

Marca o refresh token como `revoked` — o access token continua válido até expirar
(15 min).

### Recuperação de senha

- `POST /autenticacao/esqueci-senha` — gera um token de reset (guarda o hash,
  validade de 1 h). Resposta genérica para não revelar se o e-mail existe; **fora de
  produção**, o token cru é retornado para facilitar o teste.
- `POST /autenticacao/redefinir-senha` — valida o token (existe, não usado, não
  expirado) e troca a senha em transação, marcando o token como usado.

### Cadastro (`POST /autenticacao/registro`)

Cria o usuário já com o papel **ALUNO** e a senha em `bcrypt` hash.

---

## Autorização — RBAC (papéis × permissões)

Dois níveis de checagem, ambos lendo dados do **token** (`req.user`):

### `checkRole(...papeis)`

Libera se o usuário tiver **pelo menos um** dos papéis exigidos. Ex.:
`checkRole('DEPPI', 'PROFESSOR')`. Falha → `403 papel insuficiente`.

### `checkPermission(recurso, acao)`

Libera se o token contiver a permissão `recurso:acao` (ex.: `inscricao:create`).
Falha → `403 permissao insuficiente`.

### Modelo por trás

```
User ──< UserPapel >── Papel ──< PapelPermissao >── Permissao
```

- **Papel** — `ADMIN`, `DEPPI`, `PROFESSOR`, `ALUNO` (tabela `papeis`).
- **Permissao** — par único `recurso` + `acao` (tabela `permissoes`), ex.:
  `curso:create`, `inscricao:update`.
- Um usuário tem vários papéis; cada papel tem várias permissões. No login, a API
  achata isso em `roles[]` e `permissions[]` dentro do JWT.

O vínculo papel↔permissão e usuário↔papel é gerenciado pelo módulo `permissoes`
(somente ADMIN). O seed já cria os papéis, as permissões e as atribuições padrão.

---

## Validação (Zod)

`validateZod(schema, 'body' | 'params' | 'query')` valida a parte indicada da
requisição. Em erro, retorna `400` com `error` no formato `flatten()` do Zod.

> Nota do Express 5: `req.query` é somente leitura. Para `query`, o middleware
> **valida mas não reatribui** — o controller lê de `req.query` direto. Para `body` e
> `params`, o valor validado substitui o original.

---

## Tratamento de erros

- **`AppError(mensagem, statusCode)`** — erro de negócio com status HTTP explícito.
  Os services lançam `AppError` (ex.: `throw new AppError('Email ou senha inválidos!', 401)`).
- **`errorHandler`** (global) — se for `AppError`, responde
  `{ statusCode, { error: mensagem } }`. Qualquer outro erro é logado no servidor e
  vira `500 { "error": "Erro interno do servidor." }`, sem vazar detalhes internos.
- **`notFoundHandler`** — rota inexistente vira `404 { "error": "Rota nao encontrada." }`.

Padrão de resposta de erro em toda a API: `{ "error": <mensagem ou detalhe> }`.

---

## CORS, logging e uploads

- **CORS** — origens permitidas vêm de `CORS_ORIGINS` (separadas por vírgula). Sem a
  env, libera todas (útil em dev). Requisições sem `origin` (Postman, server-to-server)
  passam. Métodos: `GET/POST/PUT/PATCH/DELETE/OPTIONS`; headers: `Content-Type`,
  `Authorization`; `credentials: true`.
- **Logger** — cada request loga `[timestamp] MÉTODO /rota STATUS - Xms`.
- **Uploads (Multer)** — três middlewares: capa de curso (`imagem`), foto de perfil
  (`foto`) e documentos de inscrição (`files`, até 10). Os arquivos são servidos
  estaticamente em `/uploads`. ⚠️ No plano free do Render o disco é efêmero — os
  uploads somem a cada deploy.

---

## Camada de dados (Prisma + MySQL)

- **Client** — instanciado em [`src/lib/prisma.ts`](../src/lib/prisma.ts) com o
  **adapter MariaDB** (`@prisma/adapter-mariadb`), pool de 5 conexões.
- **SSL** — habilitado quando `DATABASE_SSL=true` (obrigatório em MySQL na nuvem, ex.:
  Aiven). Localmente fica desligado.
- **Schema dividido** — em vez de um `schema.prisma` único, o schema fica em vários
  arquivos dentro de `prisma/schema/` (um por modelo), configurado em
  [`prisma.config.ts`](../prisma.config.ts).
- **Migrations** — histórico em `prisma/migrations` (11 até agora). Em produção rodam
  no build do Render (`prisma migrate deploy`). Localmente, `prisma migrate dev`.
- **Client gerado** — vai para `prisma/generated` (via `prisma generate`, que roda no
  `postinstall`). Não editar à mão.

### Principais entidades

- **User** — dados pessoais + `senhaHash`, ligado a uma `Instituicao` e a papéis.
  Perfis especializados: `PerfilAluno`, `PerfilServidor`, `PerfilProfessor`.
- **RBAC** — `Papel`, `Permissao`, `UserPapel`, `PapelPermissao`.
- **CursoExtensao** — o curso e suas tabelas satélite: `CursoMunicipio`,
  `CursoAtividade`, `CursoFormaAvaliacao`, `CursoFormaDivulgacao`, `MembroEquipe`,
  `ItemOrcamento`, `Parceria`.
- **Inscricao** — inscrição de aluno em curso, com `InscricaoHistorico` (auditoria de
  status) e `InscricaoDocumento` (arquivos).
- **Auth** — `RefreshToken`, `PasswordResetToken` (guardam sempre o **hash**).
- **Apoio** — `Instituicao`, `Departamento`, `Relatorio`.

### Enums de negócio (principais)

- `StatusCurso`: `RASCUNHO`, `PUBLICADO`, `EM_ANDAMENTO`, `ENCERRADO`, `CANCELADO`.
- `StatusInscricao`: `PENDENTE`, `APROVADA`, `REJEITADA`, `CANCELADA`, `LISTA_ESPERA`.
- `TipoCurso`: `FORMACAO_INICIAL` (≥160h), `FORMACAO_CONTINUADA` (≥40h).
- Diversos enums de perfil: `Sexo`, `CorRaca`, `RendaFamiliarPerCapita`, etc.

### Regra de negócio de inscrições

Toda mudança de status de inscrição roda em **transação** e grava um registro em
`InscricaoHistorico`. Se uma inscrição `APROVADA` é cancelada/rejeitada, o próximo da
**lista de espera** é promovido automaticamente.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim (migrations) | String de conexão usada pelo Prisma Migrate |
| `DATABASE_HOST` | sim | Host do MySQL (runtime, via adapter) |
| `DATABASE_PORT` | sim | Porta do MySQL (padrão local: 3308) |
| `DATABASE_USER` | sim | Usuário do MySQL |
| `DATABASE_PASSWORD` | sim | Senha do MySQL |
| `DATABASE_NAME` | sim | Nome do banco |
| `DATABASE_SSL` | não | `true` para conectar via SSL (MySQL na nuvem) |
| `PORT` | não | Porta do HTTP server (o Render injeta automaticamente) |
| `NODE_ENV` | não | `development` / `production` |
| `JWT_SECRET` | sim | Segredo para assinar/validar o JWT |
| `JWT_EXPIRES_IN` | não | Validade do access token (padrão 15m) |
| `REFRESH_TOKEN_EXPIRES_DAYS` | não | Validade do refresh token (padrão 7 dias) |
| `CORS_ORIGINS` | não | Origens liberadas no CORS (separadas por vírgula) |

`getEnv('X')` lança um erro claro se uma env obrigatória estiver faltando.

---

## Infra e deploy (resumo)

- **Local:** MySQL via `docker-compose` (imagem `mysql:8.0`, porta `3308:3306`).
- **Produção:** API no **Render** (blueprint em [`render.yaml`](../render.yaml)) +
  MySQL no **Aiven**. A cada push na branch de deploy, o Render reinstala, roda
  `prisma generate` + `prisma migrate deploy` e sobe a API com `tsx src/server.ts`.
- **Servidor:** [`src/server.ts`](../src/server.ts) escuta em `process.env.PORT`
  (injetado pelo Render) ou `8000` como fallback.

O passo a passo completo está em [`DEPLOY.md`](../DEPLOY.md).
