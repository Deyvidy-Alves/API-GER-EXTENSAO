import type { Request, Response } from "express";
import { SubscriptionService } from "./subscription.service.js";

function getAuthUser(req: Request) {
  return req.user;
}

function getStringParam(param: string | string[] | undefined, name: string) {
  if (typeof param !== "string") {
    throw { statusCode: 400, message: `Parâmetro ${name} inválido` };
  }

  return param;
}

function handleError(res: Response, error: any) {
  return res.status(error.statusCode ?? 500).json({
    message: error.message ?? "Erro interno do servidor",
  });
}

async function uploadDocuments(req: Request, res: Response) {
  try {
    const { id: inscricaoId } = req.params;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const inscricaoIdStr = getStringParam(inscricaoId, "id");
    const result = await SubscriptionService.uploadDocuments(
      inscricaoIdStr,
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
    const { id: inscricaoId } = req.params;
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const inscricaoIdStr = getStringParam(inscricaoId, "id");
    const result = await SubscriptionService.listDocuments(inscricaoIdStr, user);

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function downloadDocument(req: Request, res: Response) {
  try {
    const { id: inscricaoId, documentoId } = req.params;
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const inscricaoIdStr = getStringParam(inscricaoId, "id");
    const documentoIdStr = getStringParam(documentoId, "documentoId");
    const { documento, absolutePath } =
      await SubscriptionService.downloadDocument(
        inscricaoIdStr,
        documentoIdStr,
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