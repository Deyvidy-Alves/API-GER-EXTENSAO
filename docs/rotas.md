## Rotas

### Autenticação (`/autenticacao`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/autenticacao/registro` | Cadastro de aluno (papel ALUNO automático) | Não |
| POST | `/autenticacao/login` | Login, retorna JWT | Não |
| POST | `/autenticacao/esqueci-senha` | Solicita recuperação de senha (envia token) | Não |
| POST | `/autenticacao/redefinir-senha` | Redefine a senha usando o token recebido | Não |
| POST | `/autenticacao/refresh` | Renova o access token a partir do refresh token | Não |
| POST | `/autenticacao/logout` | Revoga o refresh token | Não |
| GET | `/autenticacao/me` | Dados do usuário logado (payload do token) | Sim |

### Perfil (`/perfil`)

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/perfil` | Retorna o perfil do usuário logado | Sim |
| PATCH | `/perfil/aluno` | Cria ou atualiza o perfil do aluno logado | Sim |
| PATCH | `/perfil/foto` | Atualiza a foto de perfil (campo `foto`, multipart) | Sim |
| PATCH | `/perfil/telefone` | Atualiza o telefone | Sim |
| PATCH | `/perfil/endereco` | Atualiza o endereço | Sim |

### Cursos (`/cursos`)

Fonte única de criação/gestão de cursos. `instituicaoId` **não** é enviado pelo cliente — é resolvido a partir do professor logado.

| Método | Rota | Descrição | Auth / Papel |
|---|---|---|---|
| POST | `/cursos` | Cria curso | JWT — DEPPI, PROFESSOR |
| POST | `/cursos/:id/imagem` | Envia imagem de capa do curso (campo `imagem`, multipart) | JWT — DEPPI, PROFESSOR |
| GET | `/cursos` | Lista cursos (filtros de query: `status`, `tipo`, `tipoAcao`) | JWT |
| GET | `/cursos/:id` | Detalha curso | JWT |
| PATCH | `/cursos/:id` | Atualiza curso (DEPPI sempre; PROFESSOR só se for o dono) | JWT — DEPPI, PROFESSOR |
| PATCH | `/cursos/:id/publicar` | Publica curso (`RASCUNHO → PUBLICADO`; DEPPI sempre, PROFESSOR só se for o dono) | JWT — DEPPI, PROFESSOR |
| PATCH | `/cursos/:id/encerrar` | Encerra curso (`PUBLICADO`/`EM_ANDAMENTO → ENCERRADO`; DEPPI sempre, PROFESSOR só se for o dono) | JWT — DEPPI, PROFESSOR |
| PATCH | `/cursos/:id/close` | Fecha as inscrições do curso | JWT — DEPPI, PROFESSOR |
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

### Instituições (`/instituicoes`)

| Método | Rota | Descrição | Auth / Permissão |
|---|---|---|---|
| GET | `/instituicoes` | Lista instituições | JWT — ADMIN, `instituicao:read` |
| GET | `/instituicoes/:id` | Detalha instituição | JWT — ADMIN, `instituicao:read` |
| POST | `/instituicoes` | Cria instituição | JWT — ADMIN, `instituicao:create` |
| PATCH | `/instituicoes/:id` | Atualiza instituição | JWT — ADMIN, `instituicao:update` |
| PATCH | `/instituicoes/:id/status` | Ativa/desativa instituição | JWT — ADMIN, `instituicao:update` |
| DELETE | `/instituicoes/:id` | Remove instituição | JWT — ADMIN, `instituicao:delete` |

### Usuários (`/usuarios`)

| Método | Rota | Descrição | Auth / Permissão |
|---|---|---|---|
| GET | `/usuarios` | Lista usuários (filtros na query) | JWT — ADMIN, `usuario:read` |
| GET | `/usuarios/:id` | Detalha usuário | JWT — ADMIN, `usuario:read` |
| PATCH | `/usuarios/:id` | Atualiza usuário | JWT — ADMIN, `usuario:update` |
| DELETE | `/usuarios/:id` | Remove usuário | JWT — ADMIN, `usuario:delete` |

### Permissões (`/permissoes`)

Gestão do RBAC: papéis, permissões e seus vínculos.

| Método | Rota | Descrição | Auth / Permissão |
|---|---|---|---|
| GET | `/permissoes/papeis` | Lista papéis | JWT — ADMIN, `permissao:read` |
| GET | `/permissoes` | Lista permissões | JWT — ADMIN, `permissao:read` |
| POST | `/permissoes` | Cria permissão | JWT — ADMIN, `permissao:create` |
| POST | `/permissoes/usuarios/:userId/papeis` | Vincula papel a um usuário | JWT — ADMIN, `permissao:update` |
| DELETE | `/permissoes/usuarios/:userId/papeis/:papelId` | Desvincula papel de um usuário | JWT — ADMIN, `permissao:update` |
| POST | `/permissoes/papeis/:papelId/permissoes` | Vincula permissão a um papel | JWT — ADMIN, `permissao:update` |
| DELETE | `/permissoes/papeis/:papelId/permissoes/:permissaoId` | Desvincula permissão de um papel | JWT — ADMIN, `permissao:update` |

### Departamentos (`/departamentos`)

| Método | Rota | Descrição | Auth / Permissão |
|---|---|---|---|
| GET | `/departamentos` | Lista departamentos (filtros na query) | JWT — ADMIN, `departamento:read` |
| GET | `/departamentos/:id` | Detalha departamento | JWT — ADMIN, `departamento:read` |
| POST | `/departamentos` | Cria departamento | JWT — ADMIN, `departamento:create` |
| PATCH | `/departamentos/:id` | Atualiza departamento | JWT — ADMIN, `departamento:update` |
| DELETE | `/departamentos/:id` | Remove departamento | JWT — ADMIN, `departamento:delete` |

### Outras

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/health` | Healthcheck | Não |
| GET | `/uploads/*` | Arquivos estáticos enviados (ex.: imagens de curso) | Não |

---