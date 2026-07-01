import type { Request } from "express";
import type { Response } from "express";
import { SubscriptionService } from "./subscription.service.js";

function getAuthUser(req: Request) {
  return (req as any).user ?? (req as any).usuario;
}

function handleError(res: Response, error: any) {
  return res.status(error.statusCode ?? 500).json({
    message: error.message ?? "Erro interno do servidor",
  });
}

async function uploadDocuments(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== "string")
      return res.status(400).json({ message: "id inválido" });
    const inscricaoId = idParam;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const user = getAuthUser(req);

    const result = await SubscriptionService.uploadDocuments(
      inscricaoId,
      files,
      user
    );

    return res.status(201).json({
      message: "Documentos enviados com sucesso",
      documentos: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function listDocuments(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== "string")
      return res.status(400).json({ message: "id inválido" });
    const inscricaoId = idParam;
    const user = getAuthUser(req);

    const result = await SubscriptionService.listDocuments(inscricaoId, user);

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function downloadDocument(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== "string")
      return res.status(400).json({ message: "id inválido" });
    const inscricaoId = idParam;
    const documentoId = req.params.documentoId as string;
    const user = getAuthUser(req);

    const { documento, absolutePath } = await SubscriptionService.downloadDocument(
      inscricaoId,
      documentoId,
      user
    );

    return res.download(absolutePath, documento.nomeOriginal);
  } catch (error) {
    return handleError(res, error);
  }
}

export const SubscriptionController = {
  uploadDocuments,
  listDocuments,
  downloadDocument,
};