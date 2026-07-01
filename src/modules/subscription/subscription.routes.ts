import { Router } from "express";
import { SubscriptionController } from "./subscription.controller.js";
import { uploadInscricaoDocumentos } from "../../middlewares/uploadInscricaoDocumentos.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/:id/documentos",
  authMiddleware,
  uploadInscricaoDocumentos.array("files", 10),
  SubscriptionController.uploadDocuments
);

router.get(
  "/:id/documentos",
  authMiddleware,
  SubscriptionController.listDocuments
);

router.get(
  "/:id/documentos/:documentoId/arquivo",
  authMiddleware,
  SubscriptionController.downloadDocument
);

export default router;