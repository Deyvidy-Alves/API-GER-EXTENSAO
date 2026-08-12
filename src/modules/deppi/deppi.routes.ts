import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";

import { DeppiController } from "./deppi.controller.js";

import {
  createDeppiSchema,
  updateDeppiSchema,
  deppiIdSchema,
} from "./deppi.schema.js";

const router = Router();

/**
 * Todas as rotas de DEPPI exigem autenticação.
 */
router.use(authMiddleware);

/**
 * Somente ADMIN pode gerenciar usuários DEPPI.
 */
router.use(checkRole("ADMIN"));

/**
 * POST /deppi
 *
 * Cadastra um novo usuário DEPPI.
 */
router.post(
  "/",
  validateZod(createDeppiSchema, "body"),
  DeppiController.create
);

/**
 * GET /deppi
 *
 * Lista todos os usuários DEPPI.
 */
router.get(
  "/",
  DeppiController.findAll
);

/**
 * GET /deppi/:id
 *
 * Busca um DEPPI pelo ID.
 */
router.get(
  "/:id",
  validateZod(deppiIdSchema, "params"),
  DeppiController.findById
);

/**
 * PATCH /deppi/:id
 *
 * Atualiza dados do DEPPI.
 */
router.patch(
  "/:id",
  validateZod(deppiIdSchema, "params"),
  validateZod(updateDeppiSchema, "body"),
  DeppiController.update
);

/**
 * DELETE /deppi/:id
 *
 * Desativa o usuário DEPPI.
 */
router.delete(
  "/:id",
  validateZod(deppiIdSchema, "params"),
  DeppiController.remove
);

export { router as DeppiRoutes };
