import { Router } from "express";
import { PermissoesController } from "./permissoes.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRole, checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import {
  createPermissaoSchema,
  vincularPapelSchema,
  vincularPermissaoSchema,
} from "./permissoes.schema.js";

const router = Router();

router.use(authMiddleware, checkRole("ADMIN"));

router.get(
  "/papeis",
  checkPermission("permissao", "read"),
  PermissoesController.listPapeis
);

router.get(
  "/",
  checkPermission("permissao", "read"),
  PermissoesController.listPermissoes
);

router.post(
  "/",
  checkPermission("permissao", "create"),
  validateZod(createPermissaoSchema, "body"),
  PermissoesController.createPermissao
);

// vincular/desvincular papel a um usuario
router.post(
  "/usuarios/:userId/papeis",
  checkPermission("permissao", "update"),
  validateZod(vincularPapelSchema, "body"),
  PermissoesController.vincularPapel
);

router.delete(
  "/usuarios/:userId/papeis/:papelId",
  checkPermission("permissao", "update"),
  PermissoesController.desvincularPapel
);

// vincular/desvincular permissao a um papel
router.post(
  "/papeis/:papelId/permissoes",
  checkPermission("permissao", "update"),
  validateZod(vincularPermissaoSchema, "body"),
  PermissoesController.vincularPermissao
);

router.delete(
  "/papeis/:papelId/permissoes/:permissaoId",
  checkPermission("permissao", "update"),
  PermissoesController.desvincularPermissao
);

export { router as PermissoesRoutes };
