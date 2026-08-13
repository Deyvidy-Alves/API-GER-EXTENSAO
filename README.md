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

Substitua `SEU_USUARIO`/`SUA_SENHA` pelas credenciais do seu banco local, e gere um `JWT_SECRET` próprio rodando:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole o valor gerado no lugar de `GERE_UM_SEGREDO_ALEATORIO_AQUI`.


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

## Equipes

| Equipe | Integrantes |
|---|---|
| 03 | Deyvidy, Tyson, Guilherme Leite, Ruan |