/**
 * IMPORTANTE: antes de rodar este seed, execute:
 *   npx prisma generate
 *
 * O cliente gerado está desatualizado (03/06) em relação ao schema atual (11/06).
 * Sem regenerar, os tipos de enum e os campos novos não estarão disponíveis.
 *
 * Para rodar o seed:
 *   npx prisma db seed
 */

import { prisma } from '../src/lib/prisma.js'
import { hash } from 'bcrypt'

// Fix: when TypeScript lib configuration doesn't include DOM, `console` may be unknown.
// Declare a loose global to satisfy the compiler in this seed script.
declare const console: { log: (...args: any[]) => void; error: (...args: any[]) => void };

async function main() {

  // ─── 1. PAPÉIS ────────────────────────────────────────────────────────────
  const [admin, deppi, professor, aluno] = await Promise.all([
    prisma.papel.upsert({ where: { nome: 'ADMIN' },     update: {}, create: { nome: 'ADMIN' } }),
    prisma.papel.upsert({ where: { nome: 'DEPPI' },     update: {}, create: { nome: 'DEPPI' } }),
    prisma.papel.upsert({ where: { nome: 'PROFESSOR' }, update: {}, create: { nome: 'PROFESSOR' } }),
    prisma.papel.upsert({ where: { nome: 'ALUNO' },     update: {}, create: { nome: 'ALUNO' } }),
  ])

  // ─── 2. PERMISSÕES ────────────────────────────────────────────────────────
  const upsertPerm = (recurso: string, acao: string) =>
    prisma.permissao.upsert({
      where: { recurso_acao: { recurso, acao } },
      update: {},
      create: { recurso, acao },
    })

  const [
    alunoCreate, alunoRead, alunoUpdate, alunoDelete,
    professorCreate, professorRead, professorUpdate, professorDelete,
    deppiCreate, deppiRead, deppiUpdate, deppiDelete,
    cursoCreate, cursoRead, cursoUpdate, cursoDelete,
    inscricaoCreate, inscricaoRead, inscricaoUpdate, inscricaoDelete,
    relatorioCreate, relatorioRead,
    instituicaoCreate, instituicaoRead, instituicaoUpdate, instituicaoDelete,
    usuarioRead, usuarioUpdate, usuarioDelete,
  ] = await Promise.all([
    upsertPerm('aluno', 'create'),
    upsertPerm('aluno', 'read'),
    upsertPerm('aluno', 'update'),
    upsertPerm('aluno', 'delete'),

    upsertPerm('professor', 'create'),
    upsertPerm('professor', 'read'),
    upsertPerm('professor', 'update'),
    upsertPerm('professor', 'delete'),

    upsertPerm('deppi', 'create'),
    upsertPerm('deppi', 'read'),
    upsertPerm('deppi', 'update'),
    upsertPerm('deppi', 'delete'),

    upsertPerm('curso', 'create'),
    upsertPerm('curso', 'read'),
    upsertPerm('curso', 'update'),
    upsertPerm('curso', 'delete'),

    upsertPerm('inscricao', 'create'),
    upsertPerm('inscricao', 'read'),
    upsertPerm('inscricao', 'update'),
    upsertPerm('inscricao', 'delete'),

    upsertPerm('relatorio', 'create'),
    upsertPerm('relatorio', 'read'),

    upsertPerm('instituicao', 'create'),
    upsertPerm('instituicao', 'read'),
    upsertPerm('instituicao', 'update'),
    upsertPerm('instituicao', 'delete'),

    upsertPerm('usuario', 'read'),
    upsertPerm('usuario', 'update'),
    upsertPerm('usuario', 'delete'),
  ])

  // ─── 3. ATRIBUIÇÕES PAPEL ↔ PERMISSÃO ────────────────────────────────────
  const atribuicoes = [
    // ALUNO
    { papelId: aluno.id, permissaoId: cursoRead.id },
    { papelId: aluno.id, permissaoId: inscricaoCreate.id },
    { papelId: aluno.id, permissaoId: inscricaoRead.id },

    // PROFESSOR
    { papelId: professor.id, permissaoId: cursoCreate.id },
    { papelId: professor.id, permissaoId: cursoRead.id },
    { papelId: professor.id, permissaoId: cursoUpdate.id },
    { papelId: professor.id, permissaoId: inscricaoRead.id },

    // DEPPI
    { papelId: deppi.id, permissaoId: professorCreate.id },
    { papelId: deppi.id, permissaoId: professorRead.id },
    { papelId: deppi.id, permissaoId: professorUpdate.id },
    { papelId: deppi.id, permissaoId: cursoCreate.id },
    { papelId: deppi.id, permissaoId: cursoRead.id },
    { papelId: deppi.id, permissaoId: cursoUpdate.id },
    { papelId: deppi.id, permissaoId: cursoDelete.id },
    { papelId: deppi.id, permissaoId: inscricaoRead.id },
    { papelId: deppi.id, permissaoId: inscricaoUpdate.id },
    { papelId: deppi.id, permissaoId: inscricaoDelete.id },
    { papelId: deppi.id, permissaoId: alunoRead.id },
    { papelId: deppi.id, permissaoId: relatorioCreate.id },
    { papelId: deppi.id, permissaoId: relatorioRead.id },

    // ADMIN — tudo
    { papelId: admin.id, permissaoId: alunoCreate.id },
    { papelId: admin.id, permissaoId: alunoRead.id },
    { papelId: admin.id, permissaoId: alunoUpdate.id },
    { papelId: admin.id, permissaoId: alunoDelete.id },
    { papelId: admin.id, permissaoId: professorCreate.id },
    { papelId: admin.id, permissaoId: professorRead.id },
    { papelId: admin.id, permissaoId: professorUpdate.id },
    { papelId: admin.id, permissaoId: professorDelete.id },
    { papelId: admin.id, permissaoId: deppiCreate.id },
    { papelId: admin.id, permissaoId: deppiRead.id },
    { papelId: admin.id, permissaoId: deppiUpdate.id },
    { papelId: admin.id, permissaoId: deppiDelete.id },
    { papelId: admin.id, permissaoId: cursoCreate.id },
    { papelId: admin.id, permissaoId: cursoRead.id },
    { papelId: admin.id, permissaoId: cursoUpdate.id },
    { papelId: admin.id, permissaoId: cursoDelete.id },
    { papelId: admin.id, permissaoId: inscricaoCreate.id },
    { papelId: admin.id, permissaoId: inscricaoRead.id },
    { papelId: admin.id, permissaoId: inscricaoUpdate.id },
    { papelId: admin.id, permissaoId: inscricaoDelete.id },
    { papelId: admin.id, permissaoId: relatorioCreate.id },
    { papelId: admin.id, permissaoId: relatorioRead.id },
    { papelId: admin.id, permissaoId: instituicaoCreate.id },
    { papelId: admin.id, permissaoId: instituicaoRead.id },
    { papelId: admin.id, permissaoId: instituicaoUpdate.id },
    { papelId: admin.id, permissaoId: instituicaoDelete.id },
    { papelId: admin.id, permissaoId: usuarioRead.id },
    { papelId: admin.id, permissaoId: usuarioUpdate.id },
    { papelId: admin.id, permissaoId: usuarioDelete.id },
  ]

  for (const a of atribuicoes) {
    await prisma.papelPermissao.upsert({
      where: { papelId_permissaoId: { papelId: a.papelId, permissaoId: a.permissaoId } },
      update: {},
      create: a,
    })
  }

  // ─── 4. INSTITUIÇÃO ───────────────────────────────────────────────────────
  const instituicao = await prisma.instituicao.upsert({
    where: { sigla: 'IFCE-CED' },
    update: {},
    create: {
      nome:     'IFCE Campus Cedro',
      sigla:    'IFCE-CED',
      endereco: 'Alameda José Quintino, s/n - Prado',
    },
  })

  // ─── 5. USUÁRIOS ─────────────────────────────────────────────────────────
  const usuariosBase = [
    { nome: 'Administrador',   email: 'admin@ifce.edu.br',     senha: 'admin123',     papel: admin },
    { nome: 'Membro DEPPI',    email: 'deppi@ifce.edu.br',     senha: 'deppi123',     papel: deppi },
    { nome: 'Professor Teste', email: 'professor@ifce.edu.br', senha: 'professor123', papel: professor },
    { nome: 'Aluno Teste',     email: 'aluno@ifce.edu.br',     senha: 'aluno123',     papel: aluno },
  ]

  const usersMap: Record<string, string> = {}

  for (const u of usuariosBase) {
    const senhaHash = await hash(u.senha, 10)
    const user = await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: {
        nome:         u.nome,
        email:        u.email,
        senhaHash,
        ativo:        true,
        instituicaoId: instituicao.id,
      },
    })
    await prisma.userPapel.upsert({
      where:  { userId_papelId: { userId: user.id, papelId: u.papel.id } },
      update: {},
      create: { userId: user.id, papelId: u.papel.id },
    })
    usersMap[u.email] = user.id
  }

  const userProfessorId = usersMap['professor@ifce.edu.br'] as string
  const userAlunoId     = usersMap['aluno@ifce.edu.br']     as string
  const userDeppiId     = usersMap['deppi@ifce.edu.br']     as string

  // ─── 6. PERFIL ALUNO ──────────────────────────────────────────────────────
  const perfilAluno = await prisma.perfilAluno.upsert({
    where:  { userId: userAlunoId },
    update: {},
    create: {
      userId:                  userAlunoId,
      matricula:               '20241001',
      cursoGraduacao:          'Análise e Desenvolvimento de Sistemas',
      semestre:                3,
      grauInstrucao:           'Ensino Médio Completo',
      profissao:               'Estudante',
      rendaFamiliarPerCapita:  'ATE_MEIO_SM',
      numPessoasFamilia:       4,
      telefoneCelular:         '(88) 99999-0001',
    },
  })

  // ─── 7. PERFIL SERVIDOR — DEPPI ───────────────────────────────────────────
  await prisma.perfilServidor.upsert({
    where:  { siape: '1234567' },
    update: {},
    create: {
      userId:               userDeppiId,
      siape:                '1234567',
      matricula:            'SRV-001',
      setorSuap:            'DEPPI',
      lotacaoSiape:         'IFCE-CED',
      situacao:             'ATIVO',
      regimeTrabalho:       'DEDICACAO_EXCLUSIVA',
      jornadaTrabalho:      'INTEGRAL',
      cargo:                'Técnico Administrativo em Educação',
      inicioServicioPublico: new Date('2015-03-01'),
      dataPosseInstituicao:  new Date('2016-01-10'),
    },
  })

  // ─── 8. PERFIL SERVIDOR — PROFESSOR ──────────────────────────────────────
  const perfilServidorProf = await prisma.perfilServidor.upsert({
    where:  { siape: '7654321' },
    update: {},
    create: {
      userId:               userProfessorId,
      siape:                '7654321',
      matricula:            'SRV-002',
      setorSuap:            'Coord. de Informática',
      lotacaoSiape:         'IFCE-CED',
      situacao:             'ATIVO',
      regimeTrabalho:       'DEDICACAO_EXCLUSIVA',
      jornadaTrabalho:      'INTEGRAL',
      cargo:                'Professor do Ensino Básico, Técnico e Tecnológico',
      inicioServicioPublico: new Date('2012-08-01'),
      dataPosseInstituicao:  new Date('2013-02-05'),
    },
  })

  // ─── 9. PERFIL PROFESSOR ──────────────────────────────────────────────────
  // upsert com { perfilServidorId } funciona após `prisma generate`,
  // pois o campo é @unique no schema. Enquanto o cliente estiver desatualizado,
  // usamos findFirst + create para garantir idempotência.
  let perfilProfessor = await prisma.perfilProfessor.findFirst({
    where: { perfilServidorId: perfilServidorProf.id },
  })
  if (!perfilProfessor) {
    perfilProfessor = await prisma.perfilProfessor.create({
      data: {
        perfilServidorId:   perfilServidorProf.id,
        titulacao:          'Mestre',
        departamento:       'Tecnologia da Informação',
        nce:                'NCE-TI-001',
        disciplinaIngresso: 'Estruturas de Dados',
      },
    })
  }

  // ─── 10. CURSO DE EXTENSÃO ────────────────────────────────────────────────
  const curso = await prisma.cursoExtensao.upsert({
    where:  { id: '80770483-11e7-4145-ba20-f8b94139c294' },
    update: {},
    create: {
      id:                   '80770483-11e7-4145-ba20-f8b94139c294',
      titulo:               'Introdução à Programação com Python',
      tipoAcao:             'CURSO',
      tipo:                 'FORMACAO_CONTINUADA',
      areaTematica:         'Tecnologia e Produção',
      linhaExtensao:        'Desenvolvimento Tecnológico',
      localAtuacao:         'URBANO',
      modeloOferta:         'PRESENCIAL',
      status:               'PUBLICADO',
      cargaHoraria:         40,
      dataInicio:           new Date('2024-08-05'),
      dataFim:              new Date('2024-09-30'),
      minBeneficiados:      10,
      maxBeneficiados:      30,
      fomento:              'Recursos próprios IFCE',
      programaInstitucional:'Programa de Extensão Tecnológica',
      apresentacao:         'Curso introdutório de programação voltado para iniciantes.',
      justificativa:        'Demanda crescente por profissionais com conhecimento em Python.',
      publicoAlvo:          'Estudantes do ensino médio e público em geral.',
      objetivoGeral:        'Capacitar os participantes com os fundamentos da linguagem Python.',
      objetivosEspecificos: '1. Entender variáveis e tipos de dados.\n2. Dominar estruturas de controle.',
      metodologia:          'Aulas expositivas, exercícios práticos e projetos em grupo.',
      professorId:          perfilProfessor.id,
      instituicaoId:        instituicao.id,
    },
  })

  // ─── 11. INSCRIÇÃO ────────────────────────────────────────────────────────
  const inscricao = await prisma.inscricao.upsert({
    where:  { alunoId_cursoId: { alunoId: perfilAluno.id, cursoId: curso.id } },
    update: {},
    create: {
      alunoId: perfilAluno.id,
      cursoId: curso.id,
      status:  'APROVADA',
    },
  })

  // ─── 12. HISTÓRICO DE INSCRIÇÃO ───────────────────────────────────────────
  await prisma.inscricaoHistorico.upsert({
    where:  { id: '6da3fa6f-e7ec-44e2-b404-c6dd6c66dc73' },
    update: {},
    create: {
      id:             '6da3fa6f-e7ec-44e2-b404-c6dd6c66dc73',
      inscricaoId:    inscricao.id,
      statusAnterior: 'PENDENTE',
      statusNovo:     'APROVADA',
      observacao:     'Aprovação manual durante seed.',
      alteradoPorId:  userDeppiId,
    },
  })

  // ─── 13. MUNICÍPIO DO CURSO ───────────────────────────────────────────────
  await prisma.cursoMunicipio.upsert({
    where:  { cursoId_nome: { cursoId: curso.id, nome: 'Cedro' } },
    update: {},
    create: { cursoId: curso.id, nome: 'Cedro' },
  })

  // ─── 14. FORMA DE AVALIAÇÃO ───────────────────────────────────────────────
  await prisma.cursoFormaAvaliacao.upsert({
    where:  { cursoId_forma: { cursoId: curso.id, forma: 'PARTICIPACAO' } },
    update: {},
    create: { cursoId: curso.id, forma: 'PARTICIPACAO' },
  })

  // ─── 15. FORMA DE DIVULGAÇÃO ──────────────────────────────────────────────
  await prisma.cursoFormaDivulgacao.upsert({
    where:  { cursoId_forma: { cursoId: curso.id, forma: 'REDES_SOCIAIS' } },
    update: {},
    create: { cursoId: curso.id, forma: 'REDES_SOCIAIS' },
  })

  // ─── 16. ATIVIDADE DO CURSO ───────────────────────────────────────────────
  await prisma.cursoAtividade.upsert({
    where:  { cursoId_atividade: { cursoId: curso.id, atividade: 'MINICURSO' } },
    update: {},
    create: { cursoId: curso.id, atividade: 'MINICURSO' },
  })

  // ─── 17. MEMBRO DA EQUIPE ─────────────────────────────────────────────────
  await prisma.membroEquipe.upsert({
    where:  { cursoId_userId: { cursoId: curso.id, userId: userProfessorId } },
    update: {},
    create: {
      cursoId:            curso.id,
      userId:             userProfessorId,
      categoria:          'COORDENADOR',
      vinculo:            'DOCENTE_IFCE',
      receberaBolsa:      false,
      horasSemanais:      8,
      inicioParticipacao: new Date('2024-08-05'),
      fimParticipacao:    new Date('2024-09-30'),
    },
  })

  // ─── 18. ITEM DE ORÇAMENTO ────────────────────────────────────────────────
  await prisma.itemOrcamento.upsert({
    where:  { cursoId_conta: { cursoId: curso.id, conta: 'MATERIAL_CONSUMO' } },
    update: {},
    create: {
      cursoId: curso.id,
      conta:   'MATERIAL_CONSUMO',
      valor:   500.00,
    },
  })

  // ─── 19. PARCERIA ─────────────────────────────────────────────────────────
  // @@unique([cursoId, numeroInstrumento]) — numeroInstrumento não pode ser null aqui
  await prisma.parceria.upsert({
    where:  { cursoId_numeroInstrumento: { cursoId: curso.id, numeroInstrumento: 'TC-2024-001' } },
    update: {},
    create: {
      cursoId:               curso.id,
      instituicaoParceira:   'Prefeitura Municipal de Cedro',
      parceriaFormalizada:   true,
      instrumentoUtilizado:  'Termo de Cooperação',
      numeroInstrumento:     'TC-2024-001',
    },
  })

  // ─── 20. RELATÓRIO ────────────────────────────────────────────────────────
  await prisma.relatorio.upsert({
    where:  { id: '2c6dd88e-ff9e-484a-820c-840d97d44d3a' },
    update: {},
    create: {
      id:          '2c6dd88e-ff9e-484a-820c-840d97d44d3a',
      tipo:        'inscricoes_por_curso',
      parametros:  { cursoId: curso.id, periodo: '2024-S2' },
      arquivoUrl:  null,
      geradoPorId: userDeppiId,
    },
  })

  console.log('✅ Seed concluída — todas as tabelas populadas.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())