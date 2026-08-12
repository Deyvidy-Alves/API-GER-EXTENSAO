import { Router } from "express";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { AuthController } from "./auth.controller.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post('/registro', validateZod(registerSchema, 'body'), AuthController.register);
router.post('/login', validateZod(loginSchema, 'body'), AuthController.login);

router.post('/esqueci-senha', validateZod(forgotPasswordSchema, 'body'), AuthController.forgotPassword);
router.post('/redefinir-senha', validateZod(resetPasswordSchema, 'body'), AuthController.resetPassword);

router.get('/me', authMiddleware, AuthController.me);

export { router as AuthRoutes }


