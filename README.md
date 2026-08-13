# API de Gerenciamento de Cursos de Extensão — IFCE

API REST para gerenciar inscrições em cursos de extensão do IFCE, feita com Node.js, Express, TypeScript, Prisma e MySQL.

## Sumário

- [Tecnologias](#tecnologias)
- [Produção (deploy)](#produção-deploy)
- [Como rodar localmente](#como-rodar-localmente)
- [Usuários de teste](#usuários-de-teste)
- [Autenticação](#autenticação)
- [Rotas da API](#rotas-da-api)
- [Documentação adicional](#documentação-adicional)
- [Equipe](#equipe)

---

## Tecnologias

- **Node.js** + **Express 5** + **TypeScript**
- **Prisma** (ORM) com **MySQL** (adapter MariaDB)
- **JWT** para autenticação + **bcrypt** para senhas
- **Zod** para validação
- **Multer** para upload de arquivos
- **ExcelJS** / **PDFKit** para relatórios
- Deploy no **Render** + MySQL no **Aiven**

---

## Produção (deploy)

A API está publicada no **Render**, conectada a um **MySQL na nuvem (Aiven)**.

- **URL base:** `https://api-ger-extensao-zcrp.onrender.com`
- **Healthcheck:** [`/health`](https://api-ger-extensao-zcrp.onrender.com/health) → `{ "status": "ok" }`

> Abrir a **raiz** (`/`) no navegador retorna `{"error":"Rota nao encontrada."}`. Isso é **normal** — a API não tem página inicial, só endpoints. Use um cliente HTTP (Postman/Insomnia/Thunder Client) ou o front para consumir as rotas.

> **Plano grátis:** a API hiberna após ~15 min sem tráfego; a primeira requisição depois disso demora alguns segundos para "acordar". Arquivos em `/uploads` são apagados a cada deploy (disco efêmero).

O passo a passo completo do deploy está em **[`DEPLOY.md`](./DEPLOY.md)**.

---

## Como rodar localmente

### Requisitos

- Node.js
- Docker Desktop (para o MySQL local via `docker-compose`)

### 1. Clonar o repositório

```bash
git clone https://github.com/Deyvidy-Alves/API-GER-EXTENSAO.git
cd API-GER-EXTENSAO
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. Use como base:

```env
DATABASE_URL="mysql://SEU_USUARIO:SUA_SENHA@localhost:3308/api-ger-extensao"
DATABASE_USER="SEU_USUARIO"
DATABASE_PASSWORD="SUA_SENHA"
DATABASE_NAME="api-ger-extensao"
DATABASE_HOST="localhost"
DATABASE_PORT=3308

PORT=3000
NODE_ENV=development

JWT_SECRET="GERE_UM_SEGREDO_ALEATORIO_AQUI"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_DAYS=7
```

Substitua `SEU_USUARIO`/`SUA_SENHA` pelas credenciais do banco local e gere um `JWT_SECRET` próprio:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Subir o banco (Docker)

```bash
docker-compose up -d
```

### 5. Gerar o client do Prisma

```bash
npx prisma generate
```

### 6. Rodar as migrations

```bash
npx prisma migrate deploy
```

### 7. Popular o banco com dados de teste

```bash
npx tsx prisma/seed.ts
```

### 8. Iniciar o servidor

```bash
npm run dev
```

A API sobe em `http://localhost:3000`.

---

## Usuários de teste

Criados pelo seed (`prisma/seed.ts`):

| E-mail | Senha | Papel |
|---|---|---|
| admin@ifce.edu.br | admin123 | ADMIN |
| deppi@ifce.edu.br | deppi123 | DEPPI |
| professor@ifce.edu.br | professor123 | PROFESSOR |
| aluno@ifce.edu.br | aluno123 | ALUNO |

---

## Autenticação

A API usa **JWT (Bearer token)**.

1. Faça login: `POST /autenticacao/login` com `{ "email": "...", "senha": "..." }`
2. Guarde o `accessToken` retornado.
3. Nas rotas protegidas, envie o header:

```
Authorization: Bearer <accessToken>
```

O token expira em 15 min (`JWT_EXPIRES_IN`); use `POST /autenticacao/refresh` para renovar.

**Legenda das tabelas:** 🔓 público · 🔒 requer token · além de papéis (ADMIN, DEPPI, PROFESSOR, ALUNO) e permissões (`recurso:acao`) quando aplicável.

---

## Rotas da API

Base local: `http://localhost:3000` · Base produção: `https://api-ger-extensao-zcrp.onrender.com`

### Saúde e estáticos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/health` | 🔓 | Healthcheck (`{"status":"ok"}`) |
| GET | `/uploads/<arquivo>` | 🔓 | Serve arquivos enviados (fotos, imagens, documentos) |

### Autenticação — `/autenticacao`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/autenticacao/registro` | 🔓 | Cadastro de aluno (papel ALUNO automático) |
| POST | `/autenticacao/login` | 🔓 | Login, retorna `accessToken` |
| POST | `/autenticacao/esqueci-senha` | 🔓 | Solicita recuperação de senha (gera token) |
| POST | `/autenticacao/redefinir-senha` | 🔓 | Redefine a senha usando o token |
| POST | `/autenticacao/refresh` | 🔓 | Renova o `accessToken` a partir do refresh token |
| POST | `/autenticacao/logout` | 🔓 | Logout (invalida o refresh token) |
| GET | `/autenticacao/me` | 🔒 | Dados do usuário logado |

### Perfil — `/perfil` (🔒 todas)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/perfil` | Perfil do usuário logado |
| PATCH | `/perfil/aluno` | Cria/atualiza o perfil de aluno |
| PATCH | `/perfil/foto` | Upload da foto de perfil (multipart, campo `foto`) |
| PATCH | `/perfil/telefone` | Atualiza telefone |
| PATCH | `/perfil/endereco` | Atualiza endereço |

### Cursos — `/cursos` (🔒 todas)

`instituicaoId` não é enviado pelo cliente — é resolvido a partir do usuário logado.

| Método | Rota | Papel | Descrição |
|---|---|---|---|
| GET | `/cursos` | qualquer logado | Lista cursos (query: `status`, `tipo`, `tipoAcao`) |
| GET | `/cursos/:id` | qualquer logado | Detalha curso |
| POST | `/cursos` | DEPPI, PROFESSOR | Cria curso |
| POST | `/cursos/:id/imagem` | DEPPI, PROFESSOR | Envia imagem de capa (multipart, campo `imagem`) |
| PATCH | `/cursos/:id` | DEPPI, PROFESSOR | Atualiza (DEPPI sempre; PROFESSOR só se for o dono) |
| PATCH | `/cursos/:id/publicar` | DEPPI, PROFESSOR | Publica (`RASCUNHO → PUBLICADO`) |
| PATCH | `/cursos/:id/encerrar` | DEPPI, PROFESSOR | Encerra (`PUBLICADO`/`EM_ANDAMENTO → ENCERRADO`) |
| PATCH | `/cursos/:id/close` | DEPPI, PROFESSOR | Fecha inscrições do curso |
| DELETE | `/cursos/:id` | DEPPI, PROFESSOR | Cancela curso (`status → CANCELADO`, soft delete) |

### Professor — `/professor` (🔒 papel PROFESSOR)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/professor/perfil` | Ver perfil (`PerfilProfessor`) |
| PATCH | `/professor/perfil` | Atualizar perfil |
| POST | `/professor/cursos` | Criar curso (mesma regra do módulo `cursos`) |
| GET | `/professor/cursos` | Listar meus cursos |
| GET | `/professor/cursos/:id` | Detalhar curso próprio (inscrições agrupadas por status) |
| GET | `/professor/cursos/:id/inscricoes` | Listar inscritos do curso |

### Inscrição — `/inscricao` (🔒 + permissão)

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| POST | `/inscricao/registrar-inscricao` | `inscricao:create` | Aluno se inscreve em um curso |
| GET | `/inscricao/minhas` | `inscricao:read` | Lista as inscrições do aluno logado |
| GET | `/inscricao/curso/:cursoId` | `inscricao:read` | Lista inscrições de um curso (DEPPI ou professor dono) |
| PATCH | `/inscricao/:id/aprovar` | `inscricao:update` | Aprova inscrição (checa vaga) |
| PATCH | `/inscricao/:id/rejeitar` | `inscricao:update` | Rejeita inscrição |
| PATCH | `/inscricao/:id/cancelar` | `inscricao:update` | Cancela inscrição |

> Toda mudança de status roda em transação e grava um registro em `InscricaoHistorico`. Se uma inscrição `APROVADA` é cancelada/rejeitada, o próximo da lista de espera é promovido automaticamente.

### Documentos da inscrição — `/inscricao-documentos` (🔒 todas)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/inscricao-documentos/:id/documentos` | Envia documentos (multipart, campo `files`, até 10) |
| GET | `/inscricao-documentos/:id/documentos` | Lista documentos da inscrição |
| GET | `/inscricao-documentos/:id/documentos/:documentoId/arquivo` | Baixa um documento |

> Acesso: ADMIN/DEPPI (sempre), o aluno dono da inscrição, ou o professor dono do curso.

### DEPPI — `/deppi` (🔒 papel ADMIN)

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| GET | `/deppi` | `deppi:read` | Lista usuários DEPPI |
| GET | `/deppi/:id` | `deppi:read` | Busca DEPPI pelo id |
| POST | `/deppi` | `deppi:create` | Cadastra DEPPI (`User` + `PerfilServidor`) |
| PATCH | `/deppi/:id` | `deppi:update` | Atualiza dados do DEPPI |
| DELETE | `/deppi/:id` | `deppi:delete` | Desativa o DEPPI (soft delete) |

### Relatórios — `/relatorios` (🔒 papel ADMIN + `relatorio:read`)

Suportam `?formato=json|xlsx|pdf` (padrão: `json`).

| Método | Rota | Descrição |
|---|---|---|
| GET | `/relatorios/courses` | Lista cursos cadastrados |
| GET | `/relatorios/enrollments/:cursoId` | Inscritos de um curso |
| GET | `/relatorios/enrollments-by-status` | Total de inscrições por status |
| GET | `/relatorios/general` | Relatório consolidado geral |

### Instituições — `/instituicoes` (🔒 papel ADMIN)

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| GET | `/instituicoes` | `instituicao:read` | Lista instituições |
| GET | `/instituicoes/:id` | `instituicao:read` | Detalha instituição |
| POST | `/instituicoes` | `instituicao:create` | Cria instituição |
| PATCH | `/instituicoes/:id` | `instituicao:update` | Atualiza instituição |
| PATCH | `/instituicoes/:id/status` | `instituicao:update` | Ativa/desativa instituição |
| DELETE | `/instituicoes/:id` | `instituicao:delete` | Remove instituição |

### Usuários — `/usuarios` (🔒 papel ADMIN)

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| GET | `/usuarios` | `usuario:read` | Lista usuários (filtros na query) |
| GET | `/usuarios/:id` | `usuario:read` | Detalha usuário |
| PATCH | `/usuarios/:id` | `usuario:update` | Atualiza usuário |
| DELETE | `/usuarios/:id` | `usuario:delete` | Remove usuário |

### Permissões — `/permissoes` (🔒 papel ADMIN)

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| GET | `/permissoes/papeis` | `permissao:read` | Lista papéis |
| GET | `/permissoes` | `permissao:read` | Lista permissões |
| POST | `/permissoes` | `permissao:create` | Cria permissão |
| POST | `/permissoes/usuarios/:userId/papeis` | `permissao:update` | Vincula papel a um usuário |
| DELETE | `/permissoes/usuarios/:userId/papeis/:papelId` | `permissao:update` | Desvincula papel de um usuário |
| POST | `/permissoes/papeis/:papelId/permissoes` | `permissao:update` | Vincula permissão a um papel |
| DELETE | `/permissoes/papeis/:papelId/permissoes/:permissaoId` | `permissao:update` | Desvincula permissão de um papel |

### Departamentos — `/departamentos` (🔒 papel ADMIN)

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| GET | `/departamentos` | `departamento:read` | Lista departamentos (filtros na query) |
| GET | `/departamentos/:id` | `departamento:read` | Detalha departamento |
| POST | `/departamentos` | `departamento:create` | Cria departamento |
| PATCH | `/departamentos/:id` | `departamento:update` | Atualiza departamento |
| DELETE | `/departamentos/:id` | `departamento:delete` | Remove departamento |

---

## Documentação adicional

- **[`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md)** — como a API funciona por dentro: estrutura de pastas, fluxo de request, autenticação (JWT), RBAC, validação, erros e camada de dados.
- **[`DEPLOY.md`](./DEPLOY.md)** — guia completo de deploy no Render + Aiven, incluindo como popular o banco da nuvem e contornos de DNS.
- **[`docs/rotas.md`](./docs/rotas.md)** — detalhes de regras de negócio por rota.
- **[`docs/SEED.md`](./docs/SEED.md)** — o que o seed cria.

---

## Equipe

| Equipe | Integrantes |
|---|---|
| 03 | Deyvidy, Tyson, Guilherme Leite, Ruan |
