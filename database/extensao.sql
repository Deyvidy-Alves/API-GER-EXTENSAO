-- ==========================================
-- PERMISSÕES
-- ==========================================

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE papeis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao VARCHAR(255)
);

CREATE TABLE permissoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao VARCHAR(255)
);

CREATE TABLE papel_permissoes (
  papel_id INT,
  permissao_id INT,
  PRIMARY KEY (papel_id, permissao_id),
  FOREIGN KEY (papel_id) REFERENCES papeis(id) ON DELETE CASCADE,
  FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
);

CREATE TABLE usuario_papeis (
  usuario_id INT,
  papel_id INT,
  PRIMARY KEY (usuario_id, papel_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (papel_id) REFERENCES papeis(id) ON DELETE CASCADE
);

CREATE TABLE cargos_deppi (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao VARCHAR(255)
);

CREATE TABLE deppi_usuarios (
  usuario_id INT,
  cargo_id INT,
  PRIMARY KEY (usuario_id, cargo_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (cargo_id) REFERENCES cargos_deppi(id) ON DELETE CASCADE
);

-- ==========================================
-- PERFIS
-- ==========================================

CREATE TABLE aluno_perfis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL UNIQUE,
  matricula VARCHAR(20) UNIQUE,
  curso_academico VARCHAR(100),
  periodo VARCHAR(10),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE professor_perfis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL UNIQUE,
  siape VARCHAR(20) UNIQUE,
  titulacao ENUM('graduacao','especializacao','mestrado','doutorado','pos_doutorado'),
  area_atuacao VARCHAR(150),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ==========================================
-- DOMÍNIO
-- ==========================================

CREATE TABLE instituicoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  endereco VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  carga_horaria INT NOT NULL,
  vagas INT NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  prazo_inscricao DATE,
  status ENUM('rascunho','aberto','em_andamento','encerrado','cancelado') DEFAULT 'rascunho',
  professor_id INT NOT NULL,
  instituicao_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_id) REFERENCES usuarios(id),
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

CREATE TABLE curso_aprovacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  curso_id INT NOT NULL UNIQUE,
  aprovador_id INT NOT NULL,
  cargo_id INT NOT NULL,
  status ENUM('pendente','aprovado','rejeitado') DEFAULT 'pendente',
  observacao TEXT,
  avaliado_em TIMESTAMP NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (aprovador_id) REFERENCES usuarios(id),
  FOREIGN KEY (cargo_id) REFERENCES cargos_deppi(id)
);

CREATE TABLE inscricoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  curso_id INT NOT NULL,
  status ENUM('pendente','confirmada','cancelada','concluida') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_aluno_curso (aluno_id, curso_id),
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- ==========================================
-- SEEDS
-- ==========================================

INSERT INTO papeis (nome, descricao) VALUES
  ('aluno',     'Estudante que se inscreve em cursos'),
  ('professor', 'Docente que cria e acompanha cursos'),
  ('deppi',     'Membro do departamento de extensão'),
  ('admin',     'Administrador geral do sistema');

INSERT INTO cargos_deppi (nome, descricao) VALUES
  ('estagiario',          'Estagiário do DEPPI'),
  ('coordenador_extensao','Coordenador de extensão'),
  ('chefe_departamento',  'Chefe do departamento de extensão');

INSERT INTO permissoes (nome, descricao) VALUES
  ('criar_conta',           'Criar conta no sistema'),
  ('fazer_inscricao',       'Inscrever-se em um curso'),
  ('criar_curso',           'Criar um novo curso'),
  ('acompanhar_curso',      'Ver andamento e inscrições do curso'),
  ('manter_professores',    'Cadastrar e editar professores'),
  ('gerenciar_cursos',      'Aprovar, editar e encerrar cursos'),
  ('gerenciar_inscricoes',  'Gerenciar inscrições de alunos'),
  ('gerenciar_permissoes',  'Alterar permissões de usuários'),
  ('gerenciar_instituicoes','Gerenciar instituições cadastradas'),
  ('gerenciar_deppi',       'Gerenciar membros do DEPPI'),
  ('gerenciar_alunos',      'Gerenciar cadastro de alunos'),
  ('gerar_relatorios',      'Gerar relatórios do sistema'),
  ('ver_dashboard',         'Visualizar painel geral de dados'),
  ('ver_perfil',            'Visualizar e editar o próprio perfil');

INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id FROM papeis p, permissoes pe
WHERE p.nome = 'aluno'
  AND pe.nome IN ('criar_conta','fazer_inscricao','ver_perfil');

INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id FROM papeis p, permissoes pe
WHERE p.nome = 'professor'
  AND pe.nome IN ('criar_curso','acompanhar_curso','ver_perfil');

INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id FROM papeis p, permissoes pe
WHERE p.nome = 'deppi'
  AND pe.nome IN ('manter_professores','gerenciar_cursos','gerenciar_inscricoes','gerenciar_permissoes','ver_perfil');

INSERT INTO papel_permissoes (papel_id, permissao_id)
SELECT p.id, pe.id FROM papeis p, permissoes pe
WHERE p.nome = 'admin'
  AND pe.nome IN ('gerenciar_instituicoes','manter_professores','gerenciar_deppi','gerenciar_cursos','gerenciar_alunos','gerar_relatorios','ver_dashboard','ver_perfil');

INSERT INTO instituicoes (nome, cnpj, endereco) VALUES
  ('IFCE Campus Cedro', '10.744.098/0011-65', 'Rua Estevão Remígio, 1145 - Cedro, CE');