require('dotenv').config();

const app = require('./app');
const PORTA = Number(process.env.PORT) || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
