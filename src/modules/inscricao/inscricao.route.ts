import { Router } from 'express';
import { InscricaoStatusRoutes } from './inscricao-status.routes.js';
import { InscricaoDocumentosRoutes } from './inscricao-documentos.route.js';

const router = Router();

router.use(InscricaoStatusRoutes);
router.use(InscricaoDocumentosRoutes);

export { router as InscricaoRoutes };