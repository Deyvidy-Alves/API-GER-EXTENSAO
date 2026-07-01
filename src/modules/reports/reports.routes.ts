import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/authorization.middleware.js';

const router = Router();

// GET /reports/general: gera o relatório consolidado geral do sistema
router.use(authMiddleware, checkPermission('relatorio', 'read'));

router.get('/courses', ReportsController.getRegisteredCourses);
router.get('/enrollments/:cursoId', ReportsController.getEnrollmentsByCourse);
router.get('/enrollments-by-status', ReportsController.getEnrollmentsByStatus);
router.get('/general', ReportsController.getGeneralReport);

export { router as ReportsRoutes };