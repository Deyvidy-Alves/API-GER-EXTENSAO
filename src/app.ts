import express from 'express';
import path from 'path';
import { AuthRoutes } from './modules/auth/auth.routes.js';
import { ProfileRoutes } from './modules/profile/profile.routes.js';
import { CursosRoutes } from './modules/cursos/cursos.routes.js';
import { ProfessorRoutes } from './modules/professor/professor.routes.js';
import { SubRoutes } from './modules/subscription/sub.routes.js';
import SubscriptionDocumentosRoutes from './modules/subscription/subscription.routes.js';
import { DeppiRoutes } from './modules/deppi/deppi.routes.js';
import { ReportsRoutes } from './modules/reports/reports.routes.js';
import { InstituicoesRoutes } from './modules/instituicoes/instituicoes.routes.js';
import { UsuariosRoutes } from './modules/usuarios/usuarios.routes.js';

const app = express();

app.use(express.json());

app.use('/autenticacao', AuthRoutes);
app.use('/perfil', ProfileRoutes);
app.use('/cursos', CursosRoutes);
app.use('/professor', ProfessorRoutes);
app.use('/inscricao', SubRoutes);
app.use('/inscricao-documentos', SubscriptionDocumentosRoutes);
app.use('/deppi', DeppiRoutes);
app.use('/relatorios', ReportsRoutes);
app.use('/instituicoes', InstituicoesRoutes);
app.use('/usuarios', UsuariosRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

export default app;