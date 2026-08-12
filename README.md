# API de Gerenciamento de Cursos de Extensão — IFCE

API REST desenvolvida para gerenciar inscrições em cursos de extensão do IFCE, feita com Node.js, Express, TypeScript, Prisma e MySQL.

## Requisitos

- Node.js
- Docker Desktop

## Como rodar

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

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
DATABASE_URL="mysql://pweb:pweb1-projeto-ifce@localhost:3308/api-ger-extensao"
DATABASE_USER="pweb"
DATABASE_PASSWORD="pweb1-projeto-ifce"
DATABASE_NAME="api-ger-extensao"
DATABASE_HOST="localhost"
DATABASE_PORT=3308

PORT=3000
NODE_ENV=development

JWT_SECRET=4f27ac8a3ff3a17be95a2bf71114539ebb55302292df833c19cd20b45d7cf45f
JWT_EXPIRES_IN='7d'
```

> A porta padrão usada pela aplicação (`src/lib/prisma.ts`) é **3308**. Ajuste conforme a porta que o seu `docker-compose.yml` expõe no host.

### 4. Subir o banco de dados

```bash
docker compose up -d
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

A API vai rodar em `http://localhost:3000`.

---

## Usuários de teste

| E-mail | Senha | Papel |
|---|---|---|
| admin@ifce.edu.br | admin123 | ADMIN |
| deppi@ifce.edu.br | deppi123 | DEPPI |
| professor@ifce.edu.br | professor123 | PROFESSOR |
| aluno@ifce.edu.br | aluno123 | ALUNO |

---

## Rotas

### Autenticação (`/autenticacao`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/autenticacao/registro` | Cadastro de aluno (papel ALUNO automático) | Não |
| POST | `/autenticacao/login` | Login, retorna JWT | Não |
| POST | `/autenticacao/esqueci-senha` | Solicita recuperação de senha (envia token) | Não |
| POST | `/autenticacao/redefinir-senha` | Redefine a senha usando o token recebido | Não |
| GET | `/autenticacao/me` | Dados do usuário logado (payload do token) | Sim |

### Perfil (`/perfil`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| PATCH | `/perfil/aluno` | Cria ou atualiza o perfil do aluno logado | Sim |

### Cursos (`/cursos`)

Fonte única de criação/gestão de cursos. `instituicaoId` **não** é enviado pelo cliente — é resolvido a partir do professor logado.

| Método | Rota | Descrição | Auth / Papel |
|---|---|---|---|
| POST | `/cursos` | Cria curso | JWT — DEPPI, PROFESSOR |
| POST | `/cursos/:id/imagem` | Envia imagem de capa do curso (campo `imagem`, multipart) | JWT — DEPPI, PROFESSOR |
| GET | `/cursos` | Lista cursos (filtros de query: `status`, `tipo`, `tipoAcao`) | JWT |
| GET | `/cursos/:id` | Detalha curso | JWT |
| PATCH | `/cursos/:id` | Atualiza curso (DEPPI sempre; PROFESSOR só se for o dono) | JWT — DEPPI, PROFESSOR |
| DELETE | `/cursos/:id` | Cancela curso (`status → CANCELADO`, não remove o registro) | JWT — DEPPI, PROFESSOR |

### Professor (`/professor`)

Endpoints com escopo restrito ao professor logado. A criação de curso é delegada ao módulo `cursos` (mesma regra de negócio, mesmo controller por baixo).

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/professor/perfil` | Ver perfil (dados de `PerfilProfessor`) | Sim |
| PATCH | `/professor/perfil` | Atualizar perfil | Sim |
| POST | `/professor/cursos` | Criar curso (via `CursosController.create`) | Sim |
| GET | `/professor/cursos` | Listar meus cursos | Sim |
| GET | `/professor/cursos/:id` | Detalhar curso próprio (com inscrições agrupadas por status) | Sim |
| GET | `/professor/cursos/:id/inscricoes` | Listar inscritos do curso | Sim |

### Inscrição (`/inscricao`)

| Método | Rota | Descrição | Auth / Permissão |
|---|---|---|---|
| POST | `/inscricao/registrar-inscricao` | Aluno se inscreve em um curso | JWT — `inscricao:create` |
| GET | `/inscricao/minhas` | Lista as inscrições do aluno logado | JWT — `inscricao:read` |
| GET | `/inscricao/curso/:cursoId` | Lista inscrições de um curso (DEPPI, ou professor dono) | JWT — `inscricao:read` |
| PATCH | `/inscricao/:id/aprovar` | Aprova inscrição (checa vaga disponível) | JWT — `inscricao:update` |
| PATCH | `/inscricao/:id/rejeitar` | Rejeita inscrição | JWT — `inscricao:update` |
| PATCH | `/inscricao/:id/cancelar` | Cancela inscrição | JWT — `inscricao:update` |

> Toda mudança de status roda em transação e grava um registro em `InscricaoHistorico`. Se uma inscrição `APROVADA` é cancelada/rejeitada, o próximo da lista de espera é promovido automaticamente para `PENDENTE`.

### Documentos da Inscrição (`/inscricao-documentos`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/inscricao-documentos/:id/documentos` | Envia documentos (campo `files`, até 10 arquivos) para a inscrição `:id` | Sim |
| GET | `/inscricao-documentos/:id/documentos` | Lista documentos da inscrição | Sim |
| GET | `/inscricao-documentos/:id/documentos/:documentoId/arquivo` | Baixa um documento | Sim |

> Acesso restrito a: ADMIN/DEPPI (sempre), o próprio aluno dono da inscrição, ou o professor dono do curso.

### DEPPI (`/deppi`)

| Método | Rota | Descrição | Auth / Papel |
|---|---|---|---|
| GET | `/deppi` | Lista usuários DEPPI | JWT — ADMIN, `deppi:read` |
| GET | `/deppi/:id` | Busca DEPPI pelo id | JWT — ADMIN, `deppi:read` |
| POST | `/deppi` | Cadastra usuário DEPPI (`User` + `PerfilServidor`) | JWT — ADMIN, `deppi:create` |
| PATCH | `/deppi/:id` | Atualiza dados do DEPPI | JWT — ADMIN, `deppi:update` |
| DELETE | `/deppi/:id` | Desativa o DEPPI (soft delete: `ativo: false`) | JWT — ADMIN, `deppi:delete` |

### Relatórios (`/relatorios`)

Suportam `?formato=json|xlsx|pdf` (padrão: `json`).

| Método | Rota | Descrição | Auth / Permissão |
|---|---|---|---|
| GET | `/relatorios/courses` | Lista cursos cadastrados | JWT — `relatorio:read` |
| GET | `/relatorios/enrollments/:cursoId` | Inscritos de um curso | JWT — `relatorio:read` |
| GET | `/relatorios/enrollments-by-status` | Total de inscrições por status | JWT — `relatorio:read` |
| GET | `/relatorios/general` | Relatório consolidado geral | JWT — `relatorio:read` |

### Outras

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/health` | Healthcheck | Não |
| GET | `/uploads/*` | Arquivos estáticos enviados (ex.: imagens de curso) | Não |

---

## Equipes

| Equipe | Integrantes |
|---|---|
| 03 | Deyvidy, Tyson, Guilherme Leite, Ruan |