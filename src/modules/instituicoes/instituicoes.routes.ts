import { Router } from "express";
import { InstituicoesController } from "./instituicoes.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRole, checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import {
  createInstituicaoSchema,
  updateInstituicaoSchema,
  toggleAtivoSchema,
} from "./instituicoes.schema.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  checkRole("ADMIN"),
  checkPermission("instituicao", "read"),
  InstituicoesController.index
);

router.get(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("instituicao", "read"),
  InstituicoesController.show
);

router.post(
  "/",
  checkRole("ADMIN"),
  checkPermission("instituicao", "create"),
  validateZod(createInstituicaoSchema, "body"),
  InstituicoesController.create
);

router.patch(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("instituicao", "update"),
  validateZod(updateInstituicaoSchema, "body"),
  InstituicoesController.update
);

router.patch(
  "/:id/status",
  checkRole("ADMIN"),
  checkPermission("instituicao", "update"),
  validateZod(toggleAtivoSchema, "body"),
  InstituicoesController.setAtivo
);

router.delete(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("instituicao", "delete"),
  InstituicoesController.remove
);

export { router as InstituicoesRoutes };
