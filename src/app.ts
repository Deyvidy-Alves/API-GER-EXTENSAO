import express from 'express';
import { AuthRoutes } from './modules/auth/auth.routes.js';

const app = express();

app.use(express.json());
app.use('/autenticacao', AuthRoutes);

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		message: 'API funcionando',
		timeStamp: new Date().toISOString()
	});
});

export default app;
