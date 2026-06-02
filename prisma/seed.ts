import { prisma } from '../src/lib/prisma.js'
import { hash } from 'bcrypt'

async function main() {
  //cria os papeis
  const papeis = await Promise.all([
    prisma.papel.upsert({ where: { nome: 'ADMIN' }, update: {}, create: { nome: 'ADMIN' } }),
    prisma.papel.upsert({ where: { nome: 'DEPPI' }, update: {}, create: { nome: 'DEPPI' } }),
    prisma.papel.upsert({ where: { nome: 'PROFESSOR' },     update: {}, create: { nome: 'PROFESSOR' } }),
    prisma.papel.upsert({ where: { nome: 'ALUNO' },     update: {}, create: { nome: 'ALUNO' } }),
  ]);

  const permissoes = await Promise.all([
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'cursos', acao: 'create' } }, update: {}, create: { recurso: 'cursos', acao: 'create' } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'cursos', acao: 'read'   } }, update: {}, create: { recurso: 'cursos', acao: 'read'   } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'cursos', acao: 'update' } }, update: {}, create: { recurso: 'cursos', acao: 'update' } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'cursos', acao: 'delete' } }, update: {}, create: { recurso: 'cursos', acao: 'delete' } }),

    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'inscricoes', acao: 'create' } }, update: {}, create: { recurso: 'inscricoes', acao: 'create' } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'inscricoes', acao: 'read'   } }, update: {}, create: { recurso: 'inscricoes', acao: 'read'   } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'inscricoes', acao: 'update' } }, update: {}, create: { recurso: 'inscricoes', acao: 'update' } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'inscricoes', acao: 'delete' } }, update: {}, create: { recurso: 'inscricoes', acao: 'delete' } }),

    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'usuarios', acao: 'create' } }, update: {}, create: { recurso: 'usuarios', acao: 'create' } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'usuarios', acao: 'read'   } }, update: {}, create: { recurso: 'usuarios', acao: 'read'   } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'usuarios', acao: 'update' } }, update: {}, create: { recurso: 'usuarios', acao: 'update' } }),
    prisma.permissao.upsert({ where: { recurso_acao: { recurso: 'usuarios', acao: 'delete' } }, update: {}, create: { recurso: 'usuarios', acao: 'delete' } }),
  ]);

  const [admin, deppi, professor, aluno] = papeis;
  const [
    cursosCreate, cursosRead, cursosUpdate, cursosDelete,
    inscrCreate, inscrRead, inscrUpdate, inscrDelete,
    usersCreate, usersRead, usersUpdate, usersDelete,
  ] = permissoes;

   const atribuicoes = [
    // ADMIN — tudo
    ...permissoes.map(p => ({ papelId: admin.id, permissaoId: p.id })),

    // DEPPI — tudo exceto deletar usuários
    { papelId: deppi.id, permissaoId: cursosCreate.id },
    { papelId: deppi.id, permissaoId: cursosRead.id },
    { papelId: deppi.id, permissaoId: cursosUpdate.id },
    { papelId: deppi.id, permissaoId: cursosDelete.id },
    { papelId: deppi.id, permissaoId: inscrCreate.id },
    { papelId: deppi.id, permissaoId: inscrRead.id },
    { papelId: deppi.id, permissaoId: inscrUpdate.id },
    { papelId: deppi.id, permissaoId: inscrDelete.id },
    { papelId: deppi.id, permissaoId: usersCreate.id },
    { papelId: deppi.id, permissaoId: usersRead.id },
    { papelId: deppi.id, permissaoId: usersUpdate.id },

    // PROFESSOR — criar e ler cursos, ler inscrições
    { papelId: professor.id, permissaoId: cursosCreate.id },
    { papelId: professor.id, permissaoId: cursosRead.id },
    { papelId: professor.id, permissaoId: inscrRead.id },

    // ALUNO — ler cursos, criar e ler inscrições
    { papelId: aluno.id, permissaoId: cursosRead.id },
    { papelId: aluno.id, permissaoId: inscrCreate.id },
    { papelId: aluno.id, permissaoId: inscrRead.id },
  ]

  for (const a of atribuicoes) {
    await prisma.papelPermissao.upsert({
      where: { papelId_permissaoId: { papelId: a.papelId, permissaoId: a.permissaoId } },
      update: {},
      create: a,
    })
  }

  const instituicao = await prisma.instituicao.upsert({
    where: { sigla: 'IFCE-CED' },
    update: {},
    create: {
      nome: 'IFCE Campus Cedro',
      sigla: 'IFCE-CED',
      endereco: 'Alameda José Quintino, s/n - Prado',
    }
  })

  const senhaHash = await hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ifce.edu.br' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@ifce.edu.br',
      senhaHash,
      ativo: true,
      instituicaoId: instituicao.id // precisas ter uma instituição criada antes
    }
  });

  await prisma.userPapel.upsert({
    where: { userId_papelId: { userId: adminUser.id, papelId: admin.id } },
    update: {},
    create: { userId: adminUser.id, papelId: admin.id }
  })


  console.log("seed concluida");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())