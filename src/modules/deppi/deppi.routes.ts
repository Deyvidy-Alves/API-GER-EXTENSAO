import { Router } from "express";
import { DeppiController } from "./deppi.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRole, checkPermission } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { createDeppiSchema, updateDeppiSchema } from "../../utils/usersAndProfiles/usersAndProfiles.schema.js";

export const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  checkRole("ADMIN"),
  checkPermission("usuarios", "read"),
  DeppiController.index
);

router.get(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("usuarios", "read"),
  DeppiController.show
);

router.post(
  "/",
  checkRole("ADMIN"),
  checkPermission("usuarios", "create"),
  validateZod(createDeppiSchema, "body"),
  DeppiController.create
);

router.patch(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("usuarios", "update"),
  validateZod(updateDeppiSchema, "body"),
  DeppiController.update
);

router.delete(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("usuarios", "delete"),
  DeppiController.remove
);

export { router as DeppiRoutes };