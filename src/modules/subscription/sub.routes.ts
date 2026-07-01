import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { CreateSubSchema } from "./sub.schema.js";
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
  "/curso/:cursoId",
  authMiddleware,
  checkPermission('inscricao', 'read'),
  SubController.listByCourse
);

export { router as SubRoutes }