# Divisão de Tarefas — Sprint (Equipe de 4 pessoas)

## Contexto

Na sprint anterior, o escopo previsto (gestão de usuários DEPPI/Professor, CRUD de cursos, RBAC) foi concluído, com exceção da **gestão de inscrições**, onde apenas o fluxo de criação (`create`) foi implementado. Faltam: aprovação, rejeição, cancelamento e listagens, todos com registro em histórico.

Nesta sprint, além de fechar esse pendente, a equipe deve implementar:

- Upload de imagem de capa para os cursos (cadastro, edição, exibição)
- Upload de documentos durante a inscrição em um curso (envio e visualização)
- Relatórios gerenciais (cursos cadastrados, inscritos por curso, inscrições por status, relatório geral)

Armazenamento de arquivos definido como **disco local do servidor**. Relatórios devem suportar exportação em **PDF/Excel**, além de JSON.

---

## Pessoa 1 — Gestão de Inscrições (fechar pendência da sprint anterior)

Módulo `subscription/` (já existe o `create`).

**Escopo:**
- `PATCH /inscricao/:id/aprovar`
- `PATCH /inscricao/:id/rejeitar`
- `PATCH /inscricao/:id/cancelar`
- `GET /inscricao/curso/:cursoId` — professor/DEPPI vê inscritos do curso
- `GET /inscricao/minhas` — aluno vê suas próprias inscrições
- Toda mudança de status deve gravar em `InscricaoHistorico` (seguir o padrão já usado no `create`)
- RBAC: aprovação/rejeição restrita a professor do curso ou DEPPI; cancelamento pelo próprio aluno também permitido

**Prioridade:** alta — é dívida técnica da sprint anterior, ideal fechar cedo pois os demais módulos podem depender do schema de `Inscricao`.

---

## Pessoa 2 — Upload de imagem de capa dos cursos

Estende o módulo `cursos/`.

**Escopo:**
- Middleware de upload (multer, salvando em disco local, ex: `/uploads/cursos/`)
- Novo campo no schema Prisma: `CursoExtensao.imagemCapa` (string, path/url)
- `POST /cursos/:id/imagem` — upload/substituição da imagem
- Servir arquivos estáticos (`express.static` numa rota `/uploads`)
- Validação de tipo e tamanho de arquivo (fileFilter do multer ou Zod)
- Ajustar `create`, `update` e `findById` de curso para incluir a URL da imagem

**Dependências:** nenhuma. Pode iniciar imediatamente.

---

## Pessoa 3 — Upload de documentos na inscrição

Estende o módulo `subscription/`, como sub-escopo separado (arquivos, não status).

**Escopo:**
- Novo modelo Prisma `InscricaoDocumento` (relação 1:N com `Inscricao`, permitindo múltiplos arquivos por inscrição)
- `POST /inscricao/:id/documentos` — upload de um ou mais arquivos
- `GET /inscricao/:id/documentos` — listagem/download (RBAC: aluno dono da inscrição, professor do curso, DEPPI)
- Armazenamento em disco local, ex: `/uploads/inscricoes/{inscricaoId}/`

**Dependências:** compartilha a tabela `Inscricao` com a Pessoa 1 — alinhar quem roda a migration primeiro para evitar conflito de schema/migrations.

---

## Pessoa 4 — Relatórios gerenciais

Novo módulo `relatorios/` (o model `Relatorio` já existe no schema Prisma, mas ainda não tem módulo implementado).

**Escopo:**
- `GET /relatorios/cursos` — relação de cursos cadastrados
- `GET /relatorios/inscritos/:cursoId` — inscritos por curso
- `GET /relatorios/inscricoes-por-status` — quantidade de inscrições por `StatusInscricao`
- `GET /relatorios/geral` — relatório geral consolidado
- Suporte a exportação via query param, ex: `?formato=pdf|xlsx|json`
  - PDF: `pdfkit` ou `puppeteer`
  - Excel: `exceljs`
- RBAC: acesso restrito a DEPPI/ADMIN (permissões `relatorio:create/read` já existem no seed)

**Dependências:** nenhuma — módulo apenas de leitura, pode ser feito em paralelo com todos os outros.

---

## Ordem de dependência sugerida

1. **Pessoa 1** sobe migration/rotas de inscrição primeiro (dívida técnica prioritária).
2. **Pessoa 3** aguarda o schema de `Inscricao` estabilizar antes de criar a migration de `InscricaoDocumento`, evitando conflito de `prisma migrate dev`.
3. **Pessoas 2 e 4** podem trabalhar em paralelo desde o início, sem dependências.
