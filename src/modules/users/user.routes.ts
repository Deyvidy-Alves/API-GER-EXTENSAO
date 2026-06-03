import { Router } from "express";
import { UserController } from "./user.controller.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { checkRole } from "../../middlewares/authorization.middleware.js";
import { createUserSchema } from "./user.schema.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const router = Router();

router.post('/criar', 
  authMiddleware, 
  checkRole('ADMIN', 'DEPPI'), 
  validateZod(createUserSchema, 'body'), 
  UserController.create
);

export { router as UserRoutes };