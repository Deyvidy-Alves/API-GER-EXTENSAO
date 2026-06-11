/*
APENAS TEMPLATE. PODE SER ALTERADO

export async function createUserWithPerfilServidor(data: {
  user: DadosDoUser,
  perfilServidor: DadosDoPerfilServidor,
  perfilProfessor?: DadosDoPerfilProfessor,
  papel: 'DEPPI' | 'PROFESSOR'
}) {
  return prisma.$transaction(async (tx) => {
    const papel = await tx.papel.findUnique({ where: { nome: data.papel } })

    const user = await tx.user.create({ data: data.user })

    await tx.userPapel.create({
      data: { userId: user.id, papelId: papel.id }
    })

    const servidor = await tx.perfilServidor.create({
      data: { ...data.perfilServidor, userId: user.id }
    })

    if (data.perfilProfessor) {
      await tx.perfilProfessor.create({
        data: { ...data.perfilProfessor, perfilServidorId: servidor.id }
      })
    }

    return user
  })
}
*/