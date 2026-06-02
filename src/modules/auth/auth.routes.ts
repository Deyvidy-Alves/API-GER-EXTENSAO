import { Router } from "express";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { AuthController } from "./auth.controller.js";
import { registerSchema } from "./auth.schema.js";

const router = Router();

router.post('/registro', validateZod(registerSchema, 'body'), AuthController.register);

export { router as AuthRoutes }