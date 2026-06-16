import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { CreateSubSchema } from "./sub.schema.js";

const router = Router();

router.post(
  "/inscricao", 
  authMiddleware, 
  checkPermission('inscricao', 'create'), 
  validateZod(CreateSubSchema, 'body'),
);
//apenas aluno pode se inscrever num curso

export { router as SubRoutes }