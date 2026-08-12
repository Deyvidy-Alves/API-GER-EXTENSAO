import express from 'express';
import path from 'path';
import { AuthRoutes } from './modules/auth/auth.routes.js';
import { ProfileRoutes } from './modules/profile/profile.routes.js';
import { CursosRoutes } from './modules/cursos/cursos.routes.js';
import { ProfessorRoutes } from './modules/professor/professor.routes.js';
import SubRoutes from './modules/subscription/subscription.routes.js';
import { DeppiRoutes } from "./modules/deppi/deppi.routes.js";

const app = express();

app.use(express.json());

app.use('/autenticacao', AuthRoutes);
app.use('/perfil', ProfileRoutes);
app.use('/cursos', CursosRoutes);
app.use('/professor', ProfessorRoutes);
app.use('/inscricao', SubRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));
app.use("/deppi", DeppiRoutes);

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

export default app;