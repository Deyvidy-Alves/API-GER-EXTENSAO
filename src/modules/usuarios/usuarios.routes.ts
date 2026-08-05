import { Router } from "express";
import { UsuariosController } from "./usuarios.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRole, checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { listUsuariosQuerySchema, updateUsuarioSchema } from "./usuarios.schema.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  checkRole("ADMIN"),
  checkPermission("usuario", "read"),
  validateZod(listUsuariosQuerySchema, "query"),
  UsuariosController.index
);

router.get(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("usuario", "read"),
  UsuariosController.show
);

router.patch(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("usuario", "update"),
  validateZod(updateUsuarioSchema, "body"),
  UsuariosController.update
);

router.delete(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("usuario", "delete"),
  UsuariosController.remove
);

export { router as UsuariosRoutes };
