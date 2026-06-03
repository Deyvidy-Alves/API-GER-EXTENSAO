import { prisma } from '../src/lib/prisma.js'
import { hash } from 'bcrypt'

async function main() {
  // papéis
  const [admin, deppi, professor, aluno] = await Promise.all([
    prisma.papel.upsert({ where: { nome: 'ADMIN' },     update: {}, create: { nome: 'ADMIN' } }),
    prisma.papel.upsert({ where: { nome: 'DEPPI' },     update: {}, create: { nome: 'DEPPI' } }),
    prisma.papel.upsert({ where: { nome: 'PROFESSOR' }, update: {}, create: { nome: 'PROFESSOR' } }),
    prisma.papel.upsert({ where: { nome: 'ALUNO' },     update: {}, create: { nome: 'ALUNO' } }),
  ])

  // permissões granulares por recurso
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
  ])

  const atribuicoes = [
    // ALUNO — ver cursos, se inscrever, ver suas inscrições
    { papelId: aluno.id, permissaoId: cursoRead.id },
    { papelId: aluno.id, permissaoId: inscricaoCreate.id },
    { papelId: aluno.id, permissaoId: inscricaoRead.id },

    // PROFESSOR — gerenciar seus cursos, ver inscrições
    { papelId: professor.id, permissaoId: cursoCreate.id },
    { papelId: professor.id, permissaoId: cursoRead.id },
    { papelId: professor.id, permissaoId: cursoUpdate.id },
    { papelId: professor.id, permissaoId: inscricaoRead.id },

    // DEPPI — gerenciar professores, cursos, inscrições e alunos, gerar relatórios
    { papelId: deppi.id, permissaoId: professorCreate.id },
    { papelId: deppi.id, permissaoId: professorRead.id },
    { papelId: deppi.id, permissaoId: professorUpdate.id },
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
  ]

  for (const a of atribuicoes) {
    await prisma.papelPermissao.upsert({
      where: { papelId_permissaoId: { papelId: a.papelId, permissaoId: a.permissaoId } },
      update: {},
      create: a,
    })
  }

  // instituição
  const instituicao = await prisma.instituicao.upsert({
    where: { sigla: 'IFCE-CED' },
    update: {},
    create: {
      nome: 'IFCE Campus Cedro',
      sigla: 'IFCE-CED',
      endereco: 'Alameda José Quintino, s/n - Prado',
    }
  })

  // usuários iniciais
  const usuarios = [
    { nome: 'Administrador',   email: 'admin@ifce.edu.br',     senha: 'admin123',     papel: admin },
    { nome: 'Membro DEPPI',    email: 'deppi@ifce.edu.br',     senha: 'deppi123',     papel: deppi },
    { nome: 'Professor Teste', email: 'professor@ifce.edu.br', senha: 'professor123', papel: professor },
    { nome: 'Aluno Teste',     email: 'aluno@ifce.edu.br',     senha: 'aluno123',     papel: aluno },
  ]

  for (const u of usuarios) {
    const senhaHash = await hash(u.senha, 10)

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nome: u.nome,
        email: u.email,
        senhaHash,
        ativo: true,
        instituicaoId: instituicao.id,
      }
    })

    await prisma.userPapel.upsert({
      where: { userId_papelId: { userId: user.id, papelId: u.papel.id } },
      update: {},
      create: { userId: user.id, papelId: u.papel.id }
    })
  }

  console.log('Seed concluída.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())