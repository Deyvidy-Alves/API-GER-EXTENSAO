import express from 'express';
import path from 'path';
<<<<<<< HEAD
=======

>>>>>>> 58c295bd48d4b72df7816e1e7e99b3512ffa4e92
import { AuthRoutes } from './modules/auth/auth.routes.js';
import { ProfileRoutes } from './modules/profile/profile.routes.js';
import { CursosRoutes } from './modules/cursos/cursos.routes.js';
import { ProfessorRoutes } from './modules/professor/professor.routes.js';
import SubRoutes from './modules/subscription/subscription.routes.js';

const app = express();

app.use(express.json());

app.use('/autenticacao', AuthRoutes);
app.use('/perfil', ProfileRoutes);
app.use('/cursos', CursosRoutes);
app.use('/professor', ProfessorRoutes);
app.use('/inscricao', SubRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

export default app;