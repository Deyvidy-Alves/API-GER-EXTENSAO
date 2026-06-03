import express from 'express';
import { AuthRoutes } from './modules/auth/auth.routes.js';
import { ProfileRoutes } from './modules/profile/profile.routes.js';
import { UserRoutes } from './modules/users/user.routes.js';

const app = express();

app.use(express.json());
app.use('/autenticacao', AuthRoutes);
app.use('/perfil', ProfileRoutes);
app.use('/usuarios', UserRoutes);

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		message: 'API funcionando',
		timeStamp: new Date().toISOString()
	});
});

export default app;
