import { Router } from "express";
import { CursosController } from "./cursos.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRole } from "../../middlewares/authorization.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { CreateCursoSchema, UpdateCursoSchema, ListCursosQuerySchema, CursoIdParamSchema } from "./cursos.schema.js";
import { uploadCurso } from "../../middlewares/uploadCurso.middleware.js";
const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

router.post(
  '/',
  checkRole('DEPPI', 'PROFESSOR'),
  validateZod(CreateCursoSchema, 'body'),
  CursosController.create
);
router.post(
    "/:id/imagem",
    checkRole("DEPPI", "PROFESSOR"),
    uploadCurso.single("imagem"),
    CursosController.uploadImagem
);

router.get(
  '/',
  validateZod(ListCursosQuerySchema, 'query'),
  CursosController.list
);

router.get(
  '/:id',
  validateZod(CursoIdParamSchema, 'params'),
  CursosController.findById
);

router.patch(
  '/:id/publicar',
  checkRole('DEPPI', 'PROFESSOR'),
  validateZod(CursoIdParamSchema, 'params'),
  CursosController.publicar
);

router.patch(
  '/:id',
  checkRole('DEPPI', 'PROFESSOR'),
  validateZod(CursoIdParamSchema, 'params'),
  validateZod(UpdateCursoSchema, 'body'),
  CursosController.update
);
router.patch(
  '/:id/close',
  checkRole('DEPPI', 'PROFESSOR'),
  validateZod(CursoIdParamSchema, 'params'),
  CursosController.close
);

router.delete(
  '/:id',
  checkRole('DEPPI', 'PROFESSOR'),
  validateZod(CursoIdParamSchema, 'params'),
  CursosController.remove
);

export { router as CursosRoutes };