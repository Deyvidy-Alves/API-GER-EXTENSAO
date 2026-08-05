import { Router } from "express";
import { DepartamentosController } from "./departamentos.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRole, checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import {
  createDepartamentoSchema,
  updateDepartamentoSchema,
  listDepartamentosQuerySchema,
} from "./departamentos.schema.js";

const router = Router();

router.use(authMiddleware, checkRole("ADMIN"));

router.get(
  "/",
  checkPermission("departamento", "read"),
  validateZod(listDepartamentosQuerySchema, "query"),
  DepartamentosController.index
);

router.get(
  "/:id",
  checkPermission("departamento", "read"),
  DepartamentosController.show
);

router.post(
  "/",
  checkPermission("departamento", "create"),
  validateZod(createDepartamentoSchema, "body"),
  DepartamentosController.create
);

router.patch(
  "/:id",
  checkPermission("departamento", "update"),
  validateZod(updateDepartamentoSchema, "body"),
  DepartamentosController.update
);

router.delete(
  "/:id",
  checkPermission("departamento", "delete"),
  DepartamentosController.remove
);

export { router as DepartamentosRoutes };
