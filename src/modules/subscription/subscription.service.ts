import path from "path";
import fs from "fs/promises";
import { prisma } from "../../lib/prisma.js";

type AuthUser = {
  sub: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
};

type UploadedFile = Express.Multer.File;

function createHttpError(message: string, statusCode: number) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
}

function getRoles(user?: AuthUser) {
  return [...new Set((user?.roles ?? []).map((r) => String(r).toUpperCase()))];
}

async function getInscricao(inscricaoId: string) {
  return prisma.inscricao.findUnique({
    where: { id: inscricaoId },
    include: {
      aluno: true,
      curso: true,
    },
  });
}

async function canAccessInscricao(user: AuthUser, inscricao: any) {
  const roles = getRoles(user);

  if (roles.includes("ADMIN") || roles.includes("DEPPI")) {
    return true;
  }

  if (roles.includes("ALUNO")) {
    const perfilAluno = await prisma.perfilAluno.findUnique({
      where: { userId: user.sub },
    });

    if (!perfilAluno) {
      return false;
    }

    return perfilAluno.id === inscricao.alunoId;
  }

  if (roles.includes("PROFESSOR")) {
    const curso = inscricao.curso;

    const professorUserId =
      curso?.professorId ??
      curso?.responsavelId ??
      curso?.userId ??
      curso?.idProfessor ??
      null;

    return professorUserId === user.sub;
  }

  return false;
}

function documentToResponse(doc: any) {
  return {
    id: doc.id,
    nomeOriginal: doc.nomeOriginal,
    nomeArquivo: doc.nomeArquivo,
    caminho: doc.caminho,
    mimeType: doc.mimeType,
    tamanho: doc.tamanho,
    criadoEm: doc.criadoEm,
    url: `/inscricao/${doc.inscricaoId}/documentos/${doc.id}/arquivo`,
  };
}

async function removeUploadedFiles(files: UploadedFile[]) {
  await Promise.allSettled(files.map((file) => fs.unlink(file.path)));
}

async function uploadDocuments(
  inscricaoId: string,
  files: UploadedFile[],
  user: AuthUser
) {
  if (!files || files.length === 0) {
    throw createHttpError("Envie ao menos um arquivo", 400);
  }

  const inscricao = await getInscricao(inscricaoId);

  if (!inscricao) {
    await removeUploadedFiles(files);
    throw createHttpError("Inscrição não encontrada", 404);
  }

  const allowed = await canAccessInscricao(user, inscricao);

  if (!allowed) {
    await removeUploadedFiles(files);
    throw createHttpError(
      "Sem permissão para anexar documentos nesta inscrição",
      403
    );
  }

  try {
    const created = await prisma.$transaction(
      files.map((file) =>
        prisma.inscricaoDocumento.create({
          data: {
            nomeOriginal: file.originalname,
            nomeArquivo: file.filename,
            caminho: path
              .join("uploads", "inscricoes", inscricaoId, file.filename)
              .replace(/\\/g, "/"),
            mimeType: file.mimetype,
            tamanho: file.size,
            inscricaoId,
          },
        })
      )
    );

    return created.map(documentToResponse);
  } catch (error) {
    await removeUploadedFiles(files);
    throw error;
  }
}

async function listDocuments(inscricaoId: string, user: AuthUser) {
  const inscricao = await getInscricao(inscricaoId);

  if (!inscricao) {
    throw createHttpError("Inscrição não encontrada", 404);
  }

  const allowed = await canAccessInscricao(user, inscricao);

  if (!allowed) {
    throw createHttpError(
      "Sem permissão para visualizar documentos desta inscrição",
      403
    );
  }

  const documents = await prisma.inscricaoDocumento.findMany({
    where: { inscricaoId },
    orderBy: { criadoEm: "desc" },
  });

  return documents.map(documentToResponse);
}

async function downloadDocument(
  inscricaoId: string,
  documentoId: string,
  user: AuthUser
) {
  const inscricao = await getInscricao(inscricaoId);

  if (!inscricao) {
    throw createHttpError("Inscrição não encontrada", 404);
  }

  const allowed = await canAccessInscricao(user, inscricao);

  if (!allowed) {
    throw createHttpError("Sem permissão para acessar este documento", 403);
  }

  const documento = await prisma.inscricaoDocumento.findFirst({
    where: {
      id: documentoId,
      inscricaoId,
    },
  });

  if (!documento) {
    throw createHttpError("Documento não encontrado", 404);
  }

  const absolutePath = path.resolve(process.cwd(), documento.caminho);

  try {
    await fs.access(absolutePath);
  } catch {
    throw createHttpError("Arquivo não encontrado no servidor", 404);
  }

  return {
    documento,
    absolutePath,
  };
}

export const SubscriptionService = {
  uploadDocuments,
  listDocuments,
  downloadDocument,
};