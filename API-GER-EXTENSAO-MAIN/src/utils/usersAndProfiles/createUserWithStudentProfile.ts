/*
APENAS TEMPLATE. PODE SER ALTERADO.

export async function createUserWithPerfilAluno(data: {
  user: DadosDoUser,
  perfilAluno: DadosDoPerfilAluno,
}) {
  return prisma.$transaction(async (tx) => {
    const papel = await tx.papel.findUnique({ where: { nome: 'ALUNO' } })

    const user = await tx.user.create({ data: data.user })

    await tx.userPapel.create({
      data: { userId: user.id, papelId: papel.id }
    })

    await tx.perfilAluno.create({
      data: { ...data.perfilAluno, userId: user.id }
    })

    return user
  })
}
*/