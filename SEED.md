# Dados da Seed — API GER EXTENSÃO

## Instituição

| Nome | Sigla | Endereço |
|---|---|---|
| IFCE Campus Cedro | IFCE-CED | Alameda José Quintino, s/n - Prado |

---

## Usuários

| Nome | Email | Senha | Papel |
|---|---|---|---|
| Administrador | admin@ifce.edu.br | admin123 | ADMIN |
| Membro DEPPI | deppi@ifce.edu.br | deppi123 | DEPPI |
| Professor Teste | professor@ifce.edu.br | professor123 | PROFESSOR |
| Aluno Teste | aluno@ifce.edu.br | aluno123 | ALUNO |

---

## Permissões cadastradas

| Recurso | Ações |
|---|---|
| `aluno` | create, read, update, delete |
| `professor` | create, read, update, delete |
| `deppi` | create, read, update, delete |
| `curso` | create, read, update, delete |
| `inscricao` | create, read, update, delete |
| `relatorio` | create, read |

Total: **22 permissões**

---

## Permissões por papel

### ALUNO
| Recurso | Ação | Descrição |
|---|---|---|
| `curso` | read | Ver cursos disponíveis |
| `inscricao` | create | Se inscrever em um curso |
| `inscricao` | read | Ver suas próprias inscrições |

### PROFESSOR
| Recurso | Ação | Descrição |
|---|---|---|
| `curso` | create | Criar um curso de extensão |
| `curso` | read | Ver cursos |
| `curso` | update | Editar seu próprio curso |
| `inscricao` | read | Ver inscrições do seu curso |

### DEPPI
| Recurso | Ação | Descrição |
|---|---|---|
| `professor` | create | Cadastrar professor |
| `professor` | read | Listar professores |
| `professor` | update | Editar professor |
| `curso` | read | Ver todos os cursos |
| `curso` | update | Editar qualquer curso |
| `curso` | delete | Cancelar curso |
| `inscricao` | read | Ver todas as inscrições |
| `inscricao` | update | Aprovar ou rejeitar inscrição |
| `inscricao` | delete | Cancelar inscrição |
| `aluno` | read | Listar alunos |
| `relatorio` | create | Gerar relatório |
| `relatorio` | read | Ver relatórios gerados |

### ADMIN
Possui todas as 22 permissões do sistema.

| Recurso | Ações |
|---|---|
| `aluno` | create, read, update, delete |
| `professor` | create, read, update, delete |
| `deppi` | create, read, update, delete |
| `curso` | create, read, update, delete |
| `inscricao` | create, read, update, delete |
| `relatorio` | create, read |
