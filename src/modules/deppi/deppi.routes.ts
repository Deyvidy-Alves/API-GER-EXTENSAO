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
  checkPermission("deppi", "read"),
  DeppiController.index
);

router.get(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("deppi", "read"),
  DeppiController.show
);

router.post(
  "/",
  checkRole("ADMIN"),
  checkPermission("deppi", "create"),
  validateZod(createDeppiSchema, "body"),
  DeppiController.create
);

router.patch(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("deppi", "update"),
  validateZod(updateDeppiSchema, "body"),
  DeppiController.update
);

router.delete(
  "/:id",
  checkRole("ADMIN"),
  checkPermission("deppi", "delete"),
  DeppiController.remove
);

export { router as DeppiRoutes };