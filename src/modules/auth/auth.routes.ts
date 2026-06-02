import { Router } from "express";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { AuthController } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post('/registro', validateZod(registerSchema, 'body'), AuthController.register);
router.post('/login', validateZod(loginSchema, 'body'), AuthController.login);

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
})

export { router as AuthRoutes }