# API — Autenticação, Perfil e Papéis

Base URL: `http://localhost:3000`

---

## 1. Cadastro de aluno (rota pública)

**POST** `/autenticacao/registro`

```json
{
  "nome": "João Silva",
  "email": "joao@aluno.ifce.edu.br",
  "senha": "senha123",
  "instituicaoId": "uuid-da-instituicao"
}
```

Resposta `201`:
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@aluno.ifce.edu.br",
  "createdAt": "2026-06-03T00:00:00.000Z"
}
```

> O papel **ALUNO** é atribuído automaticamente. Essa rota cria apenas o `User` — o `PerfilAluno` (matrícula, curso de graduação etc.) é preenchido depois em `PATCH /perfil/aluno`.

---

## 2. Login

**POST** `/autenticacao/login`

```json
{
  "email": "joao@aluno.ifce.edu.br",
  "senha": "senha123"
}
```

Resposta `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> Use o token no header de todas as rotas protegidas:
> `Authorization: Bearer <token>`

---

## 3. Cadastrar usuário DEPPI (somente ADMIN)

**POST** `/deppi`

Header:

Authorization: Bearer <token-do-admin>


Body:
```json
{
  "nome": "Professor Teste",
  "email": "professor@ifce.edu.br",
  "senha": "senha123",
  "instituicaoId": "uuid-da-instituicao",
  "perfilServidor": {
    "siape": "1234567"
  }
}
```

Resposta `201`:
```json
{
  "id": "uuid",
  "nome": "Professor Teste",
  "email": "professor@ifce.edu.br",
  "ativo": true,
  "instituicaoId": "uuid-da-instituicao",
  "perfilServidor": { "...": "..." },
  "roles": ["DEPPI"]
}
```

> Não existe uma rota `POST /usuarios` nem um campo `papel` genérico — o cadastro é sempre para o papel `DEPPI`, feito por `POST /deppi`. Também não há hoje uma rota equivalente para cadastrar `PROFESSOR` diretamente (não existe módulo `/professores` de cadastro).

---

## 4. Atualizar perfil do aluno

**PATCH** `/perfil/aluno`

Header:

Authorization: Bearer <token-do-aluno>


Body:
```json
{
  "matricula": "20241234",
  "cursoGraduacao": "Sistemas de Informação",
  "semestre": 3
}
```

> `semestre` é opcional. Pode ser chamado para criar ou atualizar o perfil.

Resposta `201` (criado) ou `200` (atualizado):
```json
{
  "id": "uuid",
  "matricula": "20241234",
  "cursoGraduacao": "Sistemas de Informação",
  "semestre": 3
}
```

---

## 5. Identificar usuário autenticado

**GET** `/autenticacao/me`

Header:

Authorization: Bearer <token>


Resposta `200`:
```json
{
  "user": {
    "sub": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@aluno.ifce.edu.br",
    "roles": ["ALUNO"],
    "permissions": [
      "curso:read",
      "inscricao:create",
      "inscricao:read"
    ]
  }
}
```

---

## Usuários do seed para testes

| Papel | E-mail | Senha |
|---|---|---|
| ADMIN | admin@ifce.edu.br | admin123 |
| DEPPI | deppi@ifce.edu.br | deppi123 |
| PROFESSOR | professor@ifce.edu.br | professor123 |
| ALUNO | aluno@ifce.edu.br | aluno123 |

