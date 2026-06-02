import express from 'express';
import { timeStamp } from 'node:console';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		message: 'API funcionando',
		timeStamp: new Date().toISOString()
	});
});

export default app;
