import type { Request, Response } from 'express';
import { InscricaoDocumentosService } from './inscricao-documentos.service.js';

function getStringParam(param: string | string[] | undefined, name: string) {
  if (typeof param !== 'string') {
    throw { statusCode: 400, message: `Parâmetro ${name} inválido` };
  }
  return param;
}

function handleError(res: Response, error: any) {
  return res.status(error.statusCode ?? 500).json({
    error: error.message ?? 'Erro interno do servidor',
  });
}

async function uploadDocuments(req: Request, res: Response) {
  try {
    const { id: inscricaoId } = req.params;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const inscricaoIdStr = getStringParam(inscricaoId, 'id');
    const result = await InscricaoDocumentosService.uploadDocuments(inscricaoIdStr, files, user);

    res.status(201).json({ message: 'Documentos enviados com sucesso', documentos: result });
  } catch (error) {
    handleError(res, error);
  }
}

async function listDocuments(req: Request, res: Response) {
  try {
    const { id: inscricaoId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const inscricaoIdStr = getStringParam(inscricaoId, 'id');
    const result = await InscricaoDocumentosService.listDocuments(inscricaoIdStr, user);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
}

async function downloadDocument(req: Request, res: Response) {
  try {
    const { id: inscricaoId, documentoId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const inscricaoIdStr = getStringParam(inscricaoId, 'id');
    const documentoIdStr = getStringParam(documentoId, 'documentoId');
    const { documento, absolutePath } = await InscricaoDocumentosService.downloadDocument(
      inscricaoIdStr,
      documentoIdStr,
      user
    );

    res.download(absolutePath, documento.nomeOriginal);
  } catch (error) {
    handleError(res, error);
  }
}

export const InscricaoDocumentosController = {
  uploadDocuments,
  listDocuments,
  downloadDocument,
};