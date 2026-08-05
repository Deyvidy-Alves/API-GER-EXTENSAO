# Contexto do Projeto: API-GER-EXTENSAO

> Documento gerado para fornecer contexto completo a uma IA assistente.  
> Última análise: 2026-06-11

---

## 1. Visão Geral

API REST para **gerenciamento de cursos de extensão universitária** do IFCE (Instituto Federal do Ceará). O sistema permite que alunos se inscrevam em cursos, professores criem e gerenciem cursos, e o departamento DEPPI administre todo o ciclo de vida das ações de extensão.

- **Repositório:** https://github.com/Deyvidy-Alves/API-GER-EXTENSAO
- **Branch principal:** `MAIN`
- **Branches ativas:** `feat/auth-jwt`, `refactor/rbac-schema`

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | Node.js + TypeScript | TS ^6.0.3 |
| Framework HTTP | Express | ^5.2.1 |
| ORM | Prisma (multi-file schema) | ^7.8.0 |
| Banco de dados | MySQL 8.0 (via Docker) | — |
| Driver Prisma | `@prisma/adapter-mariadb` | ^7.8.0 |
| Autenticação | JWT (`jsonwebtoken`) | ^9.0.3 |
| Hash de senhas | bcrypt | ^6.0.0 |
| Validação | Zod | ^4.4.3 |
| Ambiente | dotenv | ^17.4.2 |
| Dev runner | tsx watch | ^4.22.4 |

**Módulo:** `"type": "module"` — o projeto usa ESM nativo. Todos os imports internos devem usar extensão `.js` (mesmo sendo `.ts` na fonte).

---

## 3. Estrutura de Pastas

```
API-GER-EXTENSAO/
├── prisma/
│   ├── schema/                         ← schemas Prisma separados por entidade (multi-file)
│   │   ├── connection.prisma               ← datasource (MySQL) + generator
│   │   ├── enums.prisma                    ← todos os enums do domínio
│   │   ├── user.prisma
│   │   ├── perfil_aluno.prisma
│   │   ├── perfil_servidor.prisma
│   │   ├── perfil_professor.prisma
│   │   ├── instituicao.prisma
│   │   ├── papel.prisma
│   │   ├── permissao.prisma
│   │   ├── papel_permissao.prisma
│   │   ├── user_papel.prisma
│   │   ├── curso_extensao.prisma
│   │   ├── inscricao.prisma
│   │   ├── inscricao_historico.prisma  ← adicionado na Sprint 2
│   │   ├── curso_atividade.prisma
│   │   ├── curso_forma_avaliacao.prisma
│   │   ├── curso_forma_divulgacao.prisma
│   │   ├── curso_municipio.prisma
│   │   ├── item_orcamento.prisma
│   │   ├── membro_equipe.prisma
│   │   ├── parceria.prisma
│   │   └── relatorio.prisma
│   ├── migrations/                     ← histórico de migrations SQL
│   └── seed.ts                         ← seed de papéis, permissões, instituição e usuários iniciais
│
├── generated/
│   └── prisma/                         ← cliente Prisma gerado (output do generator)
│
├── src/
│   ├── server.ts                       ← entry point — inicia o servidor Express
│   ├── app.ts                          ← instância do Express + registro de rotas
│   ├── lib/
│   │   └── prisma.ts                   ← singleton do PrismaClient com adapter MariaDB
│   ├── utils/
│   │   ├── getEnv.ts                   ← helper que lança erro se variável de ambiente não existir
│   │   └── usersAndProfiles/           ← funções utilitárias para criação de usuários com perfis
│   │       ├── createUser.ts                   ← template: cria User + papel (sem perfil)
│   │       ├── createUserWithStaffProfile.ts   ← template: cria User + PerfilServidor + papel (DEPPI ou PROFESSOR) + PerfilProfessor opcional
│   │       ├── createUserWithStudentProfile.ts ← template: cria User + PerfilAluno + papel ALUNO
│   │       └── usersAndProfiles.schema.ts      ← schemas Zod base: createUserSchema, updateUserSchema
│   ├── types/
│   │   └── express.d.ts                ← augmentation do Express.Request (adiciona req.user)
│   ├── middlewares/
│   │   ├── auth.middleware.ts          ← verifica JWT Bearer e popula req.user
│   │   ├── authorization.middleware.ts ← checkRole() e checkPermission()
│   │   └── validateZod.middleware.ts   ← valida body/params/query com schema Zod
│   └── modules/
│       ├── auth/
│       │   ├── auth.routes.ts
│       │   ├── auth.schema.ts
│       │   ├── auth.controller.ts
│       │   └── auth.service.ts
│       ├── profile/
│       │   ├── profile.routes.ts
│       │   ├── profile.schema.ts
│       │   ├── profile.controller.ts
│       │   └── profile.service.ts
│       ├── deppi/                      ← A CRIAR (Sprint 2)
│       ├── professores/                ← A CRIAR (Sprint 2)
│       ├── cursos/                     ← A CRIAR (Sprint 2)
│       └── inscricoes/                 ← A CRIAR (Sprint 2)
│
├── database/
│   ├── Diagrama_MySQL.jpg
│   └── extensao.sql
├── docs/
│   ├── api-auth.md
│   ├── SEED.md
│   └── structure.md
├── prisma.config.ts                    ← configuração do Prisma CLI
├── docker-compose.yml                  ← MySQL 8 na porta 3306
├── tsconfig.json
└── package.json
```

---

## 4. Configuração e Ambiente

### Variáveis de Ambiente (`.env`)
```env
DATABASE_URL="mysql://pweb:pweb1-projeto-ifce@localhost:3306/api-ger-extensao"
DATABASE_HOST=localhost
DATABASE_USER=pweb
DATABASE_PASSWORD=pweb1-projeto-ifce
DATABASE_NAME=api-ger-extensao
DATABASE_PORT=3306

PORT=3000
NODE_ENV=development

JWT_SECRET=<hash>
JWT_EXPIRES_IN='7d'
```

### Scripts npm
```bash
npm run dev     # tsx watch src/server.ts — hot reload
npm run start   # tsc && node dist/server.js — produção
```

### Prisma (multi-file schema)
O projeto usa a configuração de **multi-file schema** do Prisma 7, com `prisma/schema/` como diretório apontado em `package.json` (`"schema": "./prisma/schema"`).

O cliente gerado fica em `generated/prisma/` e é importado como:
```ts
import { PrismaClient } from '../../generated/prisma/client.js'
```

### Health check
`GET /health` — rota pública que retorna `{ status: 'ok', message, timeStamp }`.

---

## 5. Banco de Dados — Modelos Prisma

### 5.1 Modelos de Usuário e Identidade

#### `User` → tabela `users`
Entidade central. Contém todos os dados pessoais, funcionais e de contato.
```
id, nome, nomeUsual?, email (unique), emailSiape? (unique), emailRecuperacao?,
emailNotificacao?, emailGoogleSalaAula?,
telefonesInstitucionais? (JSON string), telefonesPessoais? (JSON string),
senhaHash, emPGD (default false), ativo (default true), createdAt,
cpf? (unique), dataNascimento?, sexo? (Sexo), naturalidade?, racaEtnia? (CorRaca),
nomeSocial?, estadoCivil? (EstadoCivil), grupoSanguineo? (GrupoSanguineo),
quantDependentesIR?, nomePai?, nomeMae?, pisPasep? (unique), escolaridade?,
rgNumero?, rgOrgaoExpeditor?, rgUf?, rgDataExpedicao?,
tituloNumero?, tituloZona?, tituloSecao?, tituloUf?,
endereco?, numero?, bairro?, complemento?, cep?, cidade?,
instituicaoId (FK → Instituicao)

Relações:
- perfilAluno          → PerfilAluno?         (1:1 opcional)
- perfilServidor       → PerfilServidor?       (1:1 opcional)
- papeis               → UserPapel[]           (N:N via junction)
- relatorios           → Relatorio[]
- membroEquipes        → MembroEquipe[]
- inscricoesHistorico  → InscricaoHistorico[]
```

#### `PerfilAluno` → tabela `perfis_alunos`
```
id, userId (unique, FK → User),
matricula (unique), cursoGraduacao, semestre?,
grauInstrucao?, profissao?,
rendaFamiliarPerCapita? (RendaFamiliarPerCapita),
numPessoasFamilia?,
telefoneComercial?, telefoneCelular?

Relações: inscricoes → Inscricao[]
```

#### `PerfilServidor` → tabela `perfis_servidor`
Dados funcionais comuns a qualquer servidor. Usado tanto por DEPPI quanto por PROFESSOR.
```
id, userId (unique, FK → User),
siape (unique), matricula? (unique), setorSuap?, lotacaoSiape?, exercicioSiape?,
situacao? (SituacaoServidor), regimeTrabalho? (RegimeTrabalho),
jornadaTrabalho? (JornadaTrabalho), operaRaioX (default false),
inicioServicoPublico?, dataPosseInstituicao?, inicioExercicioInstituicao?,
dataPosseCargo?, inicioExercicioCargo?,
cargo?, classeCargo?, padrao?, grupoCargo?, codigoVaga?,
banco?, agencia?, contaCorrente?

Relações: perfilProfessor → PerfilProfessor? (1:1 opcional)
```

#### `PerfilProfessor` → tabela `perfis_professor`
Especialização do servidor para professores.
```
id, perfilServidorId (unique, FK → PerfilServidor),
titulacao?, departamento?, nce?, disciplinaIngresso?

Relações: cursos → CursoExtensao[]
```

> **Hierarquia de perfis:**
> - `User` → `PerfilServidor` (DEPPI — servidor administrativo)
> - `User` → `PerfilServidor` → `PerfilProfessor` (PROFESSOR)
> - `User` → `PerfilAluno` (ALUNO)
>
> **Nota:** Um mesmo `User` pode ter os papéis DEPPI e PROFESSOR simultaneamente (via `UserPapel`), com um único `PerfilServidor` e um `PerfilProfessor` associado.

---

### 5.2 Instituição

#### `Instituicao` → tabela `instituicoes`
```
id, nome, sigla (unique), endereco?, ativo (default true), createdAt

Relações: usuarios → User[], cursos → CursoExtensao[]
```

---

### 5.3 RBAC (Role-Based Access Control)

#### `Papel` → tabela `papeis`
```
id, nome (unique)  — ex: "ADMIN", "DEPPI", "PROFESSOR", "ALUNO"

Relações: permissoes → PapelPermissao[], usuarios → UserPapel[]
```

#### `Permissao` → tabela `permissoes`
```
id, recurso (ex: "curso", "inscricao"), acao (ex: "create", "read")
@@unique([recurso, acao])

Relações: papeis → PapelPermissao[]
```

#### `PapelPermissao` → tabela `papeis_permissoes`
```
@@id([papelId, permissaoId])
papelId (FK → Papel), permissaoId (FK → Permissao), atribuidoEm
```

#### `UserPapel` → tabela `users_papeis`
```
@@id([userId, papelId])
userId (FK → User), papelId (FK → Papel)
```

**Permissões por papel (seed):**
| Papel | Permissões |
|---|---|
| ALUNO | `curso:read`, `inscricao:create`, `inscricao:read` |
| PROFESSOR | `curso:create/read/update/delete`, `inscricao:read` |
| DEPPI | `professor:create/read/update`, `curso:create/read/update/delete`, `inscricao:read/update/delete`, `aluno:read`, `relatorio:create/read` |
| ADMIN | Todas as permissões (aluno, professor, deppi, curso, inscricao, relatorio — create/read/update/delete) |

---

### 5.4 Cursos de Extensão

#### `CursoExtensao` → tabela `cursos_extensao`
```
id (uuid), createdAt,

// Identificação
titulo, tipoAcao (TipoAcao), tipo (TipoCurso, default FORMACAO_CONTINUADA),
areaTematica, linhaExtensao, localAtuacao (LocalAtuacao),
modeloOferta (ModeloOferta), status (StatusCurso, default RASCUNHO)

// Datas, vagas e carga horária
cargaHoraria (Int), dataInicio, dataFim, minBeneficiados, maxBeneficiados

// Metadados institucionais
fomento?, programaInstitucional?

// Textos descritivos (Text)
apresentacao, justificativa, publicoAlvo, objetivoGeral,
objetivosEspecificos, metodologia

// FKs
professorId (FK → PerfilProfessor), instituicaoId (FK → Instituicao)

// Campos multi-valor
inscricoes          → Inscricao[]
municipios          → CursoMunicipio[]
formasAvaliacao     → CursoFormaAvaliacao[]
formasDivulgacao    → CursoFormaDivulgacao[]
atividades          → CursoAtividade[]
equipes             → MembroEquipe[]
parcerias           → Parceria[]
orcamentos          → ItemOrcamento[]
```

#### `Inscricao` → tabela `inscricoes`
```
id, status (StatusInscricao, default PENDENTE), inscricaoEm, updateAt (@updatedAt)
alunoId (FK → PerfilAluno), cursoId (FK → CursoExtensao)
@@unique([alunoId, cursoId])

Relações: historico → InscricaoHistorico[]
```

#### `InscricaoHistorico` → tabela `inscricoes_historico`
Registra toda alteração de status de uma inscrição. Migration já aplicada.
```
id (uuid),
statusAnterior (StatusInscricao),
statusNovo     (StatusInscricao),
observacao?    (String — justificativa opcional, ex: motivo de rejeição/cancelamento),
alteradoEm     (DateTime @default(now())),
inscricaoId    (FK → Inscricao),
alteradoPorId  (FK → User)

Relações:
- inscricao   → Inscricao
- alteradoPor → User
```

> **Regra:** toda mudança de status em `Inscricao` deve criar um registro em `InscricaoHistorico` dentro da mesma `prisma.$transaction`.

#### Tabelas de junção do CursoExtensao

| Model | Tabela | PK |
|---|---|---|
| `CursoMunicipio` | `cursos_municipios` | `@@id([cursoId, nome])` |
| `CursoFormaAvaliacao` | `cursos_formas_avaliacao` | `@@id([cursoId, forma])` |
| `CursoFormaDivulgacao` | `cursos_formas_divulgacao` | `@@id([cursoId, forma])` |
| `CursoAtividade` | `cursos_atividades` | `@@id([cursoId, atividade])` |

#### `MembroEquipe` → tabela `membros_equipe`
```
@@id([cursoId, userId])
categoria (CategoriaEquipe), vinculo (VinculoEquipe),
receberaBolsa (default false), horasSemanais,
inicioParticipacao, fimParticipacao
cursoId (FK → CursoExtensao), userId (FK → User)
```

#### `ItemOrcamento` → tabela `itens_orcamento`
```
id, conta (ContaOrcamento), valor (Decimal 10,2)
cursoId (FK → CursoExtensao)
@@unique([cursoId, conta])
```

#### `Parceria` → tabela `parcerias`
```
id, instituicaoParceira, parceriaFormalizada (default false),
instrumentoUtilizado?, numeroInstrumento?
cursoId (FK → CursoExtensao)
@@unique([cursoId, numeroInstrumento])
```

#### `Relatorio` → tabela `relatorios`
```
id, tipo (String), parametros (Json)?, arquivoUrl?, geradoEm
geradoPorId (FK → User)
```

---

### 5.5 Enums

```typescript
StatusCurso:              RASCUNHO | PUBLICADO | EM_ANDAMENTO | ENCERRADO | CANCELADO
StatusInscricao:          PENDENTE | APROVADA | REJEITADA | CANCELADA | LISTA_ESPERA
TipoCurso:                FORMACAO_INICIAL (≥160h) | FORMACAO_CONTINUADA (≥40h)
TipoAcao:                 CURSO | EVENTO | PROJETO | PROGRAMA
LocalAtuacao:             URBANO | RURAL
ModeloOferta:             PRESENCIAL | ONLINE | HIBRIDO
FormaAvaliacao:           PARTICIPACAO | QUESTIONARIO | DEBATE | FREQUENCIA | TESTE_OBJETIVO | PROVA | TRABALHOS_ESCRITOS
FormaDivulgacao:          AUDIO | CARTAZ | EMAIL | SISTEMA_ACADEMICO | REDES_SOCIAIS | CONVITE | ARTICULACOES_INSTITUCIONAIS
AtividadeRealizada:       MINICURSO | PALESTRA | WORKSHOP | SEMINARIO | OFICINA | EXPOSICAO | HACKATHON
CategoriaEquipe:          COORDENADOR | INTEGRANTE
VinculoEquipe:            DOCENTE_IFCE | TECNICO_IFCE | DISCENTE_IFCE | EXTERNO
ContaOrcamento:           BOLSA_AUXILIO_ESTUDANTES | BOLSA_AUXILIO_PESQUISADORES | DIARIAS_PESSOAL_CIVIL | ENCARGOS_PATRONAIS | EQUIPAMENTO_MATERIAL_PERMANENTE | MATERIAL_CONSUMO | OUTROS_SERVICOS_PF | OUTROS_SERVICOES_PJ | PASSAGENS_LOCOMOCAO
Sexo:                     MASCULINO | FEMININO
CorRaca:                  AMARELA | BRANCA | PARDA | INDIGENA | NAO_DECLARADA
RendaFamiliarPerCapita:   ATE_MEIO_SM | MEIO_A_UM_SM | UM_A_UM_E_MEIO_SM | UM_E_MEIO_A_DOIS_SM | DOIS_E_MEIO_A_TRES_SM | ACIMA_DE_TRES_SM
EstadoCivil:              SOLTEIRO | CASADO | DIVORCIADO | VIUVO | UNIAO_ESTAVEL
GrupoSanguineo:           A_POS | A_NEG | B_POS | B_NEG | AB_POS | AB_NEG | O_POS | O_NEG
SituacaoServidor:         ATIVO | INATIVO | APOSENTADO | CEDIDO | AFASTADO
RegimeTrabalho:           DEDICACAO_EXCLUSIVA | QUARENTA_HORAS | VINTE_HORAS
JornadaTrabalho:          INTEGRAL | PARCIAL | NOTURNO
```

---

## 6. Módulos da API (`src/modules/`)

Cada módulo segue o padrão: `routes.ts → controller.ts → service.ts` + `schema.ts` (Zod).  
Rotas registradas em `app.ts`.

### 6.1 Autenticação (`/autenticacao`) ✅ Implementado

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/autenticacao/registro` | Pública | Cadastro de usuário (papel ALUNO automático, sem PerfilAluno) |
| POST | `/autenticacao/login` | Pública | Login, retorna JWT |
| GET | `/autenticacao/me` | JWT | Retorna payload do token (`req.user`) |

**`RegisterDTO`:** `nome, email, senha (min 8), instituicaoId (uuid)`  
**`LoginDTO`:** `email, senha`

> O registro cria apenas `User` + papel `ALUNO`. O aluno completa o perfil depois via `PATCH /perfil/aluno`.

**JWT Payload:**
```typescript
{
  sub: string           // user.id
  name: string
  email: string
  roles: string[]       // ex: ["ALUNO"]
  permissions: string[] // ex: ["curso:read", "inscricao:create"]
}
```
Expiração: `7d`. O token carrega roles e permissões para que os middlewares verifiquem sem consultar o banco.

### 6.2 Perfil (`/perfil`) ✅ Implementado

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| PATCH | `/perfil/aluno` | JWT | Upsert do perfil de aluno |

**`StudentProfileDTO`:** `matricula, cursoGraduacao, semestre? (1-10)`  
O service verifica se `req.user.roles` inclui `'ALUNO'` antes de prosseguir.

### 6.3 DEPPI (`/deppi`) 🔲 A implementar

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| POST | `/deppi` | JWT | ADMIN | Cadastra usuário DEPPI (User + PerfilServidor) |
| GET | `/deppi` | JWT | ADMIN | Lista todos os usuários DEPPI |
| GET | `/deppi/:id` | JWT | ADMIN | Busca DEPPI pelo id |
| PATCH | `/deppi/:id` | JWT | ADMIN | Atualiza dados do DEPPI |
| DELETE | `/deppi/:id` | JWT | ADMIN | Desativa o DEPPI (soft delete: `ativo: false`) |

**`CreateDeppiDTO`:** campos do `User` + campos do `PerfilServidor`  
**`UpdateDeppiDTO`:** todos opcionais  
Usa `createUserWithStaffProfile()` de `utils/usersAndProfiles/`.

### 6.4 Professores (`/professores`) 🔲 A implementar

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| POST | `/professores` | JWT | DEPPI | Cadastra professor (User + PerfilServidor + PerfilProfessor) |
| GET | `/professores` | JWT | DEPPI | Lista todos os professores |
| GET | `/professores/:id` | JWT | DEPPI | Busca professor pelo id |
| PATCH | `/professores/:id` | JWT | DEPPI | Atualiza dados do professor |
| DELETE | `/professores/:id` | JWT | DEPPI | Desativa o professor (soft delete) |

**`CreateProfessorDTO`:** campos do `User` + `PerfilServidor` + `PerfilProfessor`  
**`UpdateProfessorDTO`:** todos opcionais  
Usa `createUserWithStaffProfile()` com `perfilProfessor` preenchido.

### 6.5 Cursos (`/cursos`) 🔲 A implementar

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| POST | `/cursos` | JWT | PROFESSOR | Cria curso |
| GET | `/cursos` | JWT | Todos | Lista cursos |
| GET | `/cursos/:id` | JWT | Todos | Busca curso pelo id |
| PATCH | `/cursos/:id` | JWT | DEPPI, PROFESSOR | Atualiza curso |
| DELETE | `/cursos/:id` | JWT | DEPPI, PROFESSOR | Cancela curso (status → CANCELADO) |

> DELETE não remove o registro — altera `status` para `CANCELADO`.  
> Ao criar, `professorId` vem do `req.user.sub` (busca o `PerfilProfessor` do usuário logado).

### 6.6 Inscrições (`/inscricoes`) 🔲 A implementar

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| POST | `/inscricoes` | JWT | ALUNO | Aluno se inscreve num curso |
| GET | `/inscricoes` | JWT | DEPPI, PROFESSOR | Lista inscrições (filtros por curso, status) |
| GET | `/inscricoes/:id` | JWT | DEPPI, PROFESSOR, ALUNO (própria) | Busca inscrição pelo id |
| PATCH | `/inscricoes/:id/aprovar` | JWT | DEPPI, PROFESSOR | Aprova inscrição |
| PATCH | `/inscricoes/:id/rejeitar` | JWT | DEPPI, PROFESSOR | Rejeita inscrição |
| PATCH | `/inscricoes/:id/cancelar` | JWT | DEPPI, PROFESSOR, ALUNO (própria) | Cancela inscrição |

**Regras de negócio:**
- Duplicata bloqueada pela constraint `@@unique([alunoId, cursoId])`
- Controle de vagas: conta inscrições `APROVADA` e compara com `maxBeneficiados` antes de aprovar
- Toda mudança de status executa em `prisma.$transaction`: atualiza `Inscricao` + cria `InscricaoHistorico`

---

## 7. Utilitários de Criação de Usuários (`src/utils/usersAndProfiles/`)

Funções reutilizáveis que centralizam a criação de usuários com perfis em transações. Os módulos `deppi` e `professores` importam daqui.

> **Estado atual:** os arquivos existem mas o código está comentado como templates — precisam ser implementados.

### `createUser.ts`
Cria `User` + associa papel numa transação.
```typescript
// papel: 'DEPPI' | 'PROFESSOR' | 'ALUNO'
```

### `createUserWithStaffProfile.ts`
Cria `User` + `PerfilServidor` + papel + `PerfilProfessor` (opcional) numa transação.  
Serve tanto para DEPPI (sem `perfilProfessor`) quanto para PROFESSOR (com `perfilProfessor`).
```typescript
// papel: 'DEPPI' | 'PROFESSOR'
// perfilProfessor é opcional
```

### `createUserWithStudentProfile.ts`
Cria `User` + `PerfilAluno` + papel `ALUNO` numa transação.

### `usersAndProfiles.schema.ts`
Schemas Zod base atualmente definidos:
- `createUserSchema` — `nome, email, senha, instituicaoId, papel: enum('DEPPI','PROFESSOR','ALUNO')`
- `updateUserSchema` — `nome?, email?, ativo?`

> Precisam ser expandidos com `PerfilServidorSchema` e `PerfilProfessorSchema` para os módulos `deppi` e `professores`.

---

## 8. Middlewares

### `authMiddleware`
Extrai e verifica o JWT do header `Authorization: Bearer <token>`.  
Popula `req.user` com `{ sub, name, email, roles, permissions }`.  
Retorna `401` se ausente, inválido ou expirado.

### `checkRole(...roles: string[])`
Verifica se `req.user.roles` contém pelo menos um dos papéis exigidos.  
Retorna `403` se não tiver.

### `checkPermission(resource: string, action: string)`
Verifica se `req.user.permissions` contém `"resource:action"`.  
Retorna `403` se não tiver.

### `validateZod(schema, source)`
Valida `req.body`, `req.params` ou `req.query` contra um schema Zod.  
Retorna `400` com `error.flatten()` se inválido.  
Substitui o campo no `req` com os dados parseados (safe).

---

## 9. Convenções e Padrões do Projeto

- **Imports:** sempre com extensão `.js` (ESM nativo, mesmo sendo `.ts` na fonte)
- **Banco:** MySQL 8.0, acesso via adapter MariaDB do Prisma
- **Cliente Prisma:** importado de `../../generated/prisma/client.js`
- **Singleton Prisma:** exportado de `src/lib/prisma.ts` como `{ prisma }`
- **Variáveis de ambiente:** sempre via `getEnv()` — nunca `process.env.X` direto
- **Senhas:** bcrypt com salt rounds = 10
- **IDs:** UUID v4 via `@default(uuid())` em todos os modelos
- **Soft delete:** campo `ativo: Boolean` em `User` e `Instituicao` (sem hard delete)
- **Classes estáticas:** controllers e services usam métodos `static async`
- **Zod:** schemas exportam o tipo inferido com sufixo `DTO` (ex: `RegisterDTO`)
- **Multi-file Prisma:** um arquivo `.prisma` por entidade em `prisma/schema/`
- **Transações:** operações que envolvem múltiplas tabelas usam `prisma.$transaction`
- **Padrão de módulo:** `routes.ts → controller.ts → service.ts` + `schema.ts`

---

## 10. Estado Atual do Desenvolvimento

### ✅ Implementado
- Autenticação completa (registro, login, me) com JWT
- RBAC com papéis e permissões granulares
- Upsert de perfil de aluno (`PATCH /perfil/aluno`)
- Seed completo com papéis, permissões, instituição e 4 usuários de teste
- Schema Prisma completo para todo o domínio (incluindo `InscricaoHistorico`)
- Migration do `InscricaoHistorico` aplicada
- Templates de utilitários em `src/utils/usersAndProfiles/` (código comentado, prontos para implementar)

### 🔲 A implementar (Sprint 2)
- Funções de `src/utils/usersAndProfiles/` (descomentar e adaptar os templates)
- Expandir `usersAndProfiles.schema.ts` com schemas de `PerfilServidor` e `PerfilProfessor`
- Módulo DEPPI (`/deppi`) — CRUD, só ADMIN acessa
- Módulo Professores (`/professores`) — CRUD, só DEPPI acessa
- Módulo Cursos (`/cursos`) — CRUD com RBAC
- Módulo Inscrições (`/inscricoes`) — com controle de vagas e histórico
- Registrar novas rotas em `app.ts`

### 🔲 Fora do escopo atual
- Membros de equipe, parcerias, orçamento
- Relatórios
- Gestão de `Instituicao` via API
- Gestão de papéis/permissões via API

---

## 11. Usuários de Seed (para testes)

| Email | Senha | Papel |
|---|---|---|
| admin@ifce.edu.br | admin123 | ADMIN |
| deppi@ifce.edu.br | deppi123 | DEPPI |
| professor@ifce.edu.br | professor123 | PROFESSOR |
| aluno@ifce.edu.br | aluno123 | ALUNO |

Instituição de seed: `IFCE Campus Cedro` (sigla: `IFCE-CED`, endereço: `Alameda José Quintino, s/n - Prado`)

---

## 12. Diagrama de Relacionamentos Simplificado

```
Instituicao ──< User >──────────────────────────────────────┐
                │                                            │
                ├──< PerfilAluno >──< Inscricao              │
                │                       │                    │
                │                       └──< InscricaoHistorico >──< User
                │
                └──< PerfilServidor
                         │
                         └──< PerfilProfessor
                                  │
                          CursoExtensao >────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │              │
               Inscricao     MembroEquipe    ItemOrcamento
            CursoMunicipio     Parceria      CursoAtividade
          CursoFormaAvaliacao          CursoFormaDivulgacao

User >──< UserPapel >──< Papel >──< PapelPermissao >──< Permissao
```