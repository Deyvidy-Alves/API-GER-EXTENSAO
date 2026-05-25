const express = require('express');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		message: 'API funcionando'
	});
});

module.exports = app;
