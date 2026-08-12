import { Router } from 'express';
import { InscricaoDocumentosController } from './inscricao-documentos.controller.js';
import { uploadInscricaoDocumentos } from '../../middlewares/uploadInscricaoDocumentos.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/:id/documentos',
  authMiddleware,
  uploadInscricaoDocumentos.array('files', 10),
  InscricaoDocumentosController.uploadDocuments
);

router.get('/:id/documentos', authMiddleware, InscricaoDocumentosController.listDocuments);

router.get(
  '/:id/documentos/:documentoId/arquivo',
  authMiddleware,
  InscricaoDocumentosController.downloadDocument
);

export { router as InscricaoDocumentosRoutes };