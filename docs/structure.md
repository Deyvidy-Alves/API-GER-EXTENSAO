# API-GER-EXTENSAO

API REST para gerenciamento de cursos de extensão universitária. Construída com Node.js, TypeScript, Express e Prisma ORM com banco de dados MySQL.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework HTTP | Express |
| ORM | Prisma |
| Banco de dados | MySQL (via Docker) |
| Validação | Zod |
| Autenticação | JWT |
| Containerização | Docker + Docker Compose |

---

## Estrutura de Diretórios

```
API-GER-EXTENSAO/
│
├── database/                        # Configurações/scripts de banco de dados
│
├── docs/                            # Documentação da API
│   ├── api-auth.md                  # Documentação das rotas de autenticação
│   └── SEED.md                      # Instruções para popular o banco
│
├── generated/                       # Cliente Prisma gerado automaticamente
│
├── prisma/
│   ├── migrations/                  # Histórico de migrações do banco
│   ├── schema.prisma                # Definição dos modelos e enums
│   └── seed.ts                      # Script de seed (dados iniciais)
│
├── src/
│   ├── lib/
│   │   └── prisma.ts                # Instância singleton do PrismaClient
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # Verifica e decodifica o JWT
│   │   ├── authorization.middleware.ts # Controle de acesso por papel (RBAC)
│   │   └── validateZod.middleware.ts  # Validação do body/params com Zod
│   │
│   ├── modules/                     # Domínios da aplicação (feature-based)
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts   # Handlers HTTP de autenticação
│   │   │   ├── auth.routes.ts       # Rotas de autenticação
│   │   │   ├── auth.schema.ts       # Schemas Zod de login/registro
│   │   │   └── auth.service.ts      # Lógica de negócio (login, hash, JWT)
│   │   │
│   │   ├── profile/
│   │   │   ├── profile.controller.ts # Handlers HTTP do perfil do aluno
│   │   │   ├── profile.routes.ts    # Rotas de perfil
│   │   │   ├── profile.schema.ts    # Schema Zod do StudentProfileDTO
│   │   │   └── profile.service.ts   # Upsert do PerfilAluno
│   │   │
│   │   └── users/
│   │       ├── user.controller.ts   # Handlers HTTP de usuários
│   │       ├── user.routes.ts       # Rotas de usuários
│   │       ├── user.schema.ts       # Schemas Zod de usuário
│   │       └── user.service.ts      # Lógica de negócio de usuários
│   │
│   ├── types/
│   │   └── express.d.ts             # Extensão do tipo Request (req.user)
│   │
│   └── utils/
│       ├── getEnv.ts                # Leitura e validação de variáveis de ambiente
│       ├── app.ts                   # Configuração do Express (middlewares globais, rotas)
│       └── server.ts                # Ponto de entrada — inicia o servidor HTTP
│
├── .env                             # Variáveis de ambiente (não versionado)
├── .gitignore
├── docker-compose.yml               # Sobe o serviço MySQL
├── package.json
├── prisma.config.ts                 # Configuração do Prisma CLI
└── tsconfig.json
```

---

## Módulos da API

### `auth`
Responsável pelo registro e autenticação de usuários.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cadastra um novo usuário |
| `POST` | `/auth/login` | Autentica e retorna um JWT |

### `profile`
Gerencia o perfil complementar do aluno (dados acadêmicos, pessoais, endereço etc.).

| Método | Rota | Middleware | Descrição |
|---|---|---|---|
| `PATCH` | `/profile/aluno` | `authMiddleware`, `validateZod` | Cria ou atualiza o perfil do aluno autenticado |

### `users`
Gerencia os usuários do sistema.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/users` | Lista usuários |
| *(outros endpoints)* | | |

---

## Middlewares

### `auth.middleware.ts`
Valida o token JWT no header `Authorization: Bearer <token>`. Injeta `req.user` com `sub` (userId) e `roles`.

### `authorization.middleware.ts`
RBAC — verifica se o usuário autenticado possui o papel necessário para acessar a rota.

### `validateZod.middleware.ts`
Recebe um schema Zod e o alvo (`'body'`, `'params'`, `'query'`). Retorna `400` com os erros de validação caso o payload seja inválido.

---

## Modelos do Banco de Dados

> Diagrama físico gerado pelo MySQL Workbench. Banco: MySQL. ORM: Prisma.

### Enums

| Enum | Valores |
|---|---|
| `StatusCurso` | `RASCUNHO`, `PUBLICADO`, `EM_ANDAMENTO`, `ENCERRADO`, `CANCELADO` |
| `StatusInscricao` | `PENDENTE`, `APROVADA`, `REJEITADA`, `CANCELADA`, `LISTA_ESPERA` |
| `TipoCurso` | `FORMACAO_INICIAL` (≥160h), `FORMACAO_CONTINUADA` (≥40h) |
| `Sexo` | `MASCULINO`, `FEMININO` |
| `CorRaca` | `AMARELA`, `BRANCA`, `PARDA`, `INDIGENA`, `NAO_DECLARADA` |
| `RendaFamiliarPerCapita` | `ATE_MEIO_SM`, `MEIO_A_UM_SM`, `UM_A_UM_E_MEIO_SM`, `UM_E_MEIO_A_DOIS_SM`, `DOIS_E_MEIO_A_TRES_SM`, `ACIMA_DE_TRES_SM` |

### Tabelas

#### `users` — Usuários do sistema
| Campo | Tipo | Notas |
|---|---|---|
| `id` | `String` | PK, UUID |
| `nome` | `String` | |
| `email` | `String` | Único |
| `senhaHash` | `String` | |
| `ativo` | `Boolean` | Default: `true` |
| `createdAt` | `DateTime` | |
| `instituicaoId` | `String` | FK → `instituicoes` |

#### `perfis_alunos` — Perfil complementar do aluno
| Grupo | Campos |
|---|---|
| Acadêmico | `matricula` (único), `cursoGraduacao`, `semestre` |
| Dados pessoais | `nomeSocial`, `dataNascimento`, `sexo`, `naturalidade`, `corRaca` |
| Endereço | `endereco`, `numero`, `bairro`, `complemento`, `cep`, `cidade` |
| Contato/Formação | `grauInstrucao`, `profissao`, `telefoneComercial`, `telefoneCelular` |
| Documentação | `cpf` (único), `rg` (único), `rgOrgaoEmissor`, `rgUf`, `rgDataEmissao` |
| Socioeconômico | `rendaFamiliarPerCapita`, `numPessoasFamilia` |

#### `perfis_professor` — Perfil do professor
| Campo | Tipo | Notas |
|---|---|---|
| `siape` | `String` | Único |
| `titulacao` | `String?` | |
| `departamento` | `String?` | |
| `userId` | `String` | FK → `users` |

#### `instituicoes` — Instituições de ensino
| Campo | Tipo | Notas |
|---|---|---|
| `nome` | `String` | |
| `sigla` | `String` | Único |
| `endereco` | `String?` | |
| `ativo` | `Boolean` | |

#### `cursos_extensao` — Cursos ofertados
| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | `String` | |
| `descricao` | `Text` | |
| `cargaHoraria` | `Int` | |
| `tipo` | `TipoCurso` | |
| `vagas` | `Int` | |
| `dataInicio` / `dataFim` | `DateTime` | |
| `status` | `StatusCurso` | Default: `RASCUNHO` |
| `professorId` | `String` | FK → `perfis_professor` |
| `instituicaoId` | `String` | FK → `instituicoes` |

#### `inscricoes` — Relação N:N entre alunos e cursos
| Campo | Tipo | Notas |
|---|---|---|
| `status` | `StatusInscricao` | Default: `PENDENTE` |
| `inscricaoEm` | `DateTime` | |
| `alunoId` | `String` | FK → `perfis_alunos` |
| `cursoId` | `String` | FK → `cursos_extensao` |

Restrição: `@@unique([alunoId, cursoId])` — um aluno só pode se inscrever uma vez por curso.

#### `papeis` / `users_papeis` — RBAC
Papéis (ex: `ADMIN`, `ALUNO`, `PROFESSOR`) atribuídos a usuários via tabela de junção `users_papeis`.

#### `permissoes` / `papeis_permissoes` — Permissões granulares
Cada permissão define um par `recurso + acao` (ex: `cursos` + `create`). Permissões são atribuídas a papéis via `papeis_permissoes`.

#### `relatorios` — Log de relatórios gerados
Registra tipo, parâmetros, URL do arquivo e quem gerou (`geradoPorId` → `users`).

---

## Convenções do Projeto

- **Arquitetura:** modular por domínio (`modules/<feature>/feature.{controller,routes,schema,service}.ts`)
- **Nomenclatura:** camelCase nos campos TypeScript/Prisma; snake_case nos nomes de tabela (`@@map`)
- **DTOs:** definidos com Zod — o tipo TypeScript é inferido com `z.infer<>`
- **Upsert pattern:** `findUnique` antes do `upsert` para detectar criação vs atualização e retornar o status HTTP correto (`201` vs `200`)
- **Enums:** replicados no Zod schema para validação antes de chegarem ao Prisma