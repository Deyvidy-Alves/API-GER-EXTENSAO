import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { StudentProfileSchema } from "./profile.schema.js";

const router = Router();

router.patch('/aluno', authMiddleware, validateZod(StudentProfileSchema, 'body'), ProfileController.upsertStudentProfile);

export { router as ProfileRoutes };