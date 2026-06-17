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
DATABASE_URL="mysql://pweb:pweb1-projeto-ifce@localhost:3306/api-ger-extensao"
DATABASE_USER="pweb"
DATABASE_PASSWORD="pweb1-projeto-ifce"
DATABASE_NAME="api-ger-extensao"
DATABASE_HOST="localhost"
DATABASE_PORT=3306

PORT=3000
NODE_ENV=development

JWT_SECRET=4f27ac8a3ff3a17be95a2bf71114539ebb55302292df833c19cd20b45d7cf45f
JWT_EXPIRES_IN='7d'
```

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

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/autenticacao/registro` | Cadastro de aluno | Não |
| POST | `/autenticacao/login` | Login | Não |
| GET | `/autenticacao/me` | Dados do usuário logado | Sim |

### Perfil

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| PATCH | `/perfil/aluno` | Atualizar perfil do aluno | Sim |

### Professor

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/professor/perfil` | Ver perfil | Sim |
| PATCH | `/professor/perfil` | Atualizar perfil | Sim |
| POST | `/professor/cursos` | Criar curso de extensão | Sim |
| GET | `/professor/cursos` | Listar meus cursos | Sim |
| GET | `/professor/cursos/:id` | Detalhar curso | Sim |
| GET | `/professor/cursos/:id/inscricoes` | Listar inscritos do curso | Sim |

---

## Equipes

| Equipe | Integrantes |
|---|---|
| 03 | Deyvidy, Tyson, Guilherme Leite, Ruan |

