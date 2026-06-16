# Dados da Seed — API GER EXTENSÃO

> Execute `npx prisma generate` antes de rodar o seed pela primeira vez.  
> Para rodar: `npx prisma db seed`

---

## 1. Instituição

| Nome             | Sigla     | Endereço                            |
|------------------|-----------|-------------------------------------|
| IFCE Campus Cedro | IFCE-CED | Alameda José Quintino, s/n - Prado |

---

## 2. Usuários

| Nome             | E-mail                   | Senha          | Papel     |
|------------------|--------------------------|----------------|-----------|
| Administrador    | admin@ifce.edu.br        | `admin123`     | ADMIN     |
| Membro DEPPI     | deppi@ifce.edu.br        | `deppi123`     | DEPPI     |
| Professor Teste  | professor@ifce.edu.br    | `professor123` | PROFESSOR |
| Aluno Teste      | aluno@ifce.edu.br        | `aluno123`     | ALUNO     |

---

## 3. Permissões cadastradas

Total: **22 permissões**

| Recurso      | Ações                            |
|--------------|----------------------------------|
| `aluno`      | create, read, update, delete     |
| `professor`  | create, read, update, delete     |
| `deppi`      | create, read, update, delete     |
| `curso`      | create, read, update, delete     |
| `inscricao`  | create, read, update, delete     |
| `relatorio`  | create, read                     |

---

## 4. Permissões por papel

### ALUNO

| Recurso     | Ação   | Descrição                        |
|-------------|--------|----------------------------------|
| `curso`     | read   | Ver cursos disponíveis           |
| `inscricao` | create | Se inscrever em um curso         |
| `inscricao` | read   | Ver suas próprias inscrições     |

### PROFESSOR

| Recurso     | Ação   | Descrição                        |
|-------------|--------|----------------------------------|
| `curso`     | create | Criar um curso de extensão       |
| `curso`     | read   | Ver cursos                       |
| `curso`     | update | Editar seu próprio curso         |
| `inscricao` | read   | Ver inscrições do seu curso      |

### DEPPI

| Recurso     | Ação   | Descrição                        |
|-------------|--------|----------------------------------|
| `professor` | create | Cadastrar professor              |
| `professor` | read   | Listar professores               |
| `professor` | update | Editar professor                 |
| `curso`     | read   | Ver todos os cursos              |
| `curso`     | update | Editar qualquer curso            |
| `curso`     | delete | Cancelar curso                   |
| `inscricao` | read   | Ver todas as inscrições          |
| `inscricao` | update | Aprovar ou rejeitar inscrição    |
| `inscricao` | delete | Cancelar inscrição               |
| `aluno`     | read   | Listar alunos                    |
| `relatorio` | create | Gerar relatório                  |
| `relatorio` | read   | Ver relatórios gerados           |

### ADMIN

Possui todas as **22 permissões** do sistema.

| Recurso     | Ações                         |
|-------------|-------------------------------|
| `aluno`     | create, read, update, delete  |
| `professor` | create, read, update, delete  |
| `deppi`     | create, read, update, delete  |
| `curso`     | create, read, update, delete  |
| `inscricao` | create, read, update, delete  |
| `relatorio` | create, read                  |

---

## 5. Perfis

### Perfil Aluno

| Campo                    | Valor                                    |
|--------------------------|------------------------------------------|
| Matrícula                | `20241001`                               |
| Curso de Graduação       | Análise e Desenvolvimento de Sistemas   |
| Semestre                 | 3                                        |
| Grau de Instrução        | Ensino Médio Completo                    |
| Profissão                | Estudante                                |
| Renda Familiar Per Capita | `ATE_MEIO_SM`                           |
| Nº de Pessoas na Família | 4                                        |
| Telefone Celular         | (88) 99999-0001                          |

### Perfil Servidor — DEPPI

| Campo                      | Valor                               |
|----------------------------|-------------------------------------|
| SIAPE                      | `1234567`                           |
| Matrícula                  | `SRV-001`                           |
| Setor SUAP                 | DEPPI                               |
| Lotação SIAPE              | IFCE-CED                            |
| Situação                   | ATIVO                               |
| Regime de Trabalho         | DEDICACAO_EXCLUSIVA                 |
| Jornada de Trabalho        | INTEGRAL                            |
| Cargo                      | Técnico Administrativo em Educação  |
| Início no Serviço Público  | 01/03/2015                          |
| Data de Posse na Instituição | 10/01/2016                        |

### Perfil Servidor — Professor

| Campo                      | Valor                                              |
|----------------------------|----------------------------------------------------|
| SIAPE                      | `7654321`                                          |
| Matrícula                  | `SRV-002`                                          |
| Setor SUAP                 | Coord. de Informática                              |
| Lotação SIAPE              | IFCE-CED                                           |
| Situação                   | ATIVO                                              |
| Regime de Trabalho         | DEDICACAO_EXCLUSIVA                                |
| Jornada de Trabalho        | INTEGRAL                                           |
| Cargo                      | Professor do Ensino Básico, Técnico e Tecnológico  |
| Início no Serviço Público  | 01/08/2012                                         |
| Data de Posse na Instituição | 05/02/2013                                       |

### Perfil Professor

| Campo               | Valor                      |
|---------------------|----------------------------|
| Titulação           | Mestre                     |
| Departamento        | Tecnologia da Informação   |
| NCE                 | NCE-TI-001                 |
| Disciplina Ingresso | Estruturas de Dados        |

---

## 6. Curso de Extensão

| Campo                  | Valor                                                              |
|------------------------|--------------------------------------------------------------------|
| **ID**                 | `80770483-11e7-4145-ba20-f8b94139c294`                            |
| Título                 | Introdução à Programação com Python                                |
| Tipo de Ação           | CURSO                                                              |
| Tipo                   | FORMACAO_CONTINUADA                                                |
| Área Temática          | Tecnologia e Produção                                              |
| Linha de Extensão      | Desenvolvimento Tecnológico                                        |
| Local de Atuação       | URBANO                                                             |
| Modelo de Oferta       | PRESENCIAL                                                         |
| Status                 | PUBLICADO                                                          |
| Carga Horária          | 40h                                                                |
| Data de Início         | 05/08/2024                                                         |
| Data de Fim            | 30/09/2024                                                         |
| Mín. Beneficiados      | 10                                                                 |
| Máx. Beneficiados      | 30                                                                 |
| Fomento                | Recursos próprios IFCE                                             |
| Programa Institucional | Programa de Extensão Tecnológica                                   |
| Município              | Cedro                                                              |
| Forma de Avaliação     | PARTICIPACAO                                                       |
| Forma de Divulgação    | REDES_SOCIAIS                                                      |
| Atividade              | MINICURSO                                                          |

---

## 7. Membro da Equipe

| Campo               | Valor          |
|---------------------|----------------|
| Usuário             | professor@ifce.edu.br |
| Categoria           | COORDENADOR    |
| Vínculo             | DOCENTE_IFCE   |
| Receberá Bolsa      | Não            |
| Horas Semanais      | 8              |
| Início Participação | 05/08/2024     |
| Fim Participação    | 30/09/2024     |

---

## 8. Item de Orçamento

| Conta             | Valor     |
|-------------------|-----------|
| MATERIAL_CONSUMO  | R$ 500,00 |

---

## 9. Parceria

| Campo                  | Valor                        |
|------------------------|------------------------------|
| Instituição Parceira   | Prefeitura Municipal de Cedro |
| Parceria Formalizada   | Sim                          |
| Instrumento Utilizado  | Termo de Cooperação          |
| Número do Instrumento  | `TC-2024-001`                |

---

## 10. Inscrição

| Campo  | Valor    |
|--------|----------|
| Aluno  | aluno@ifce.edu.br |
| Curso  | Introdução à Programação com Python |
| Status | APROVADA |

### Histórico da Inscrição

| Campo           | Valor                           |
|-----------------|---------------------------------|
| **ID**          | `6da3fa6f-e7ec-44e2-b404-c6dd6c66dc73` |
| Status Anterior | PENDENTE                        |
| Status Novo     | APROVADA                        |
| Observação      | Aprovação manual durante seed.  |
| Alterado por    | deppi@ifce.edu.br               |

---

## 11. Relatório

| Campo      | Valor                                      |
|------------|--------------------------------------------|
| **ID**     | `2c6dd88e-ff9e-484a-820c-840d97d44d3a`    |
| Tipo       | `inscricoes_por_curso`                     |
| Parâmetros | `{ cursoId, periodo: "2024-S2" }`          |
| Gerado por | deppi@ifce.edu.br                          |