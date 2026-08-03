import { Router } from 'express';
import { ProfessorController } from './professor.controller.js';
import { CursosController } from '../cursos/cursos.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/authorization.middleware.js';
import { validateZod } from '../../middlewares/validateZod.middleware.js';
import { AtualizarPerfilSchema } from './professor.schema.js';
import { CreateCursoSchema } from '../cursos/cursos.schema.js';

const router = Router();

router.use(authMiddleware, checkRole('PROFESSOR'));

router.get('/perfil', ProfessorController.getPerfil);
router.patch('/perfil', validateZod(AtualizarPerfilSchema, 'body'), ProfessorController.atualizarPerfil);


router.post('/cursos', validateZod(CreateCursoSchema, 'body'), CursosController.create);
router.get('/cursos', ProfessorController.listarMeusCursos);
router.get('/cursos/:id', ProfessorController.detalharCurso);
router.get('/cursos/:id/inscricoes', ProfessorController.listarInscricoesDoCurso);

export { router as ProfessorRoutes };