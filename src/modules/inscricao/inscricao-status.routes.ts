import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/authorization.middleware.js';
import { validateZod } from '../../middlewares/validateZod.middleware.js';
import { CreateSubSchema, UpdateStatusSchema } from './inscricao.schema.js';
import { InscricaoController } from './inscricao.controller.js';

const router = Router();

// apenas aluno pode se inscrever num curso
router.post(
  '/registrar-inscricao',
  authMiddleware,
  checkPermission('inscricao', 'create'),
  validateZod(CreateSubSchema, 'body'),
  InscricaoController.create
);

router.get('/minhas', authMiddleware, checkPermission('inscricao', 'read'), InscricaoController.listMine);

router.get(
  '/curso/:cursoId',
  authMiddleware,
  checkPermission('inscricao', 'read'),
  InscricaoController.listByCourse
);

router.patch(
  '/:id/aprovar',
  authMiddleware,
  checkPermission('inscricao', 'update'),
  validateZod(UpdateStatusSchema, 'body'),
  InscricaoController.approve
);

router.patch(
  '/:id/rejeitar',
  authMiddleware,
  checkPermission('inscricao', 'update'),
  validateZod(UpdateStatusSchema, 'body'),
  InscricaoController.reject
);

router.patch(
  '/:id/cancelar',
  authMiddleware,
  checkPermission('inscricao', 'update'),
  validateZod(UpdateStatusSchema, 'body'),
  InscricaoController.cancel
);

router.patch(
  '/:id/lista-espera',
  authMiddleware,
  checkPermission('inscricao', 'update'),
  validateZod(UpdateStatusSchema, 'body'),
  InscricaoController.waitlist
);

export { router as InscricaoStatusRoutes };