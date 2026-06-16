// APENAS TEMPLATE. PODE SER ALTERADO.

/*
export async function createUser(data: {
  user: DadosDoUser,
  papel: 'DEPPI' | 'PROFESSOR' | 'ALUNO'
}) {
  return prisma.$transaction(async (tx) => {
    const papel = await tx.papel.findUnique({ where: { nome: data.papel } })

    const user = await tx.user.create({ data: data.user })

    await tx.userPapel.create({
      data: { userId: user.id, papelId: papel.id }
    })

    return user
  })
}
*/