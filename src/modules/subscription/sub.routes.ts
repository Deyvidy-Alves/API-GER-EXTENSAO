import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { CreateSubSchema, UpdateStatusSchema } from "./sub.schema.js";
import { SubController } from "./sub.controllers.js";

const router = Router();

router.post(
  "/registrar-inscricao", 
  authMiddleware, 
  checkPermission('inscricao', 'create'), 
  validateZod(CreateSubSchema, 'body'),
  SubController.create
);
//apenas aluno pode se inscrever num curso

router.get(
  "/minhas",
  authMiddleware,
  checkPermission('inscricao', 'read'),
  SubController.listMine
);


router.get(
  "/curso/:cursoId",
  authMiddleware,
  checkPermission('inscricao', 'read'),
  SubController.listByCourse
);

router.patch(
  "/:id/aprovar",
  authMiddleware,
  checkPermission('inscricao', 'update'),
  validateZod(UpdateStatusSchema, 'body'),
  SubController.approve
);

router.patch(
  "/:id/rejeitar",
  authMiddleware,
  checkPermission('inscricao', 'update'),
  validateZod(UpdateStatusSchema, 'body'),
  SubController.reject
);

router.patch(
  "/:id/cancelar",
  authMiddleware,
  checkPermission('inscricao', 'update'),
  validateZod(UpdateStatusSchema, 'body'),
  SubController.cancel
);

export { router as SubRoutes }