import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateZod } from "../../middlewares/validateZod.middleware.js";
import { StudentProfileSchema, TelefoneSchema, EnderecoSchema } from "./profile.schema.js";
import { uploadPerfil } from "../../middlewares/uploadPerfil.middleware.js";
 
const router = Router();
 
// Todas as rotas exigem autenticação
router.use(authMiddleware);
 
// Existente
router.patch('/aluno', validateZod(StudentProfileSchema, 'body'), ProfileController.upsertStudentProfile);
 
// Novos
router.get('/', ProfileController.getProfile);
router.patch('/foto', uploadPerfil.single('foto'), ProfileController.uploadFoto);
router.patch('/telefone', validateZod(TelefoneSchema, 'body'), ProfileController.updateTelefone);
router.patch('/endereco', validateZod(EnderecoSchema, 'body'), ProfileController.updateEndereco);
 
export { router as ProfileRoutes };
 
