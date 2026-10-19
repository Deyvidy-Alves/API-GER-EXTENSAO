import rateLimit from 'express-rate-limit';

// Limitador para rotas sensiveis de autenticacao (login, cadastro, recuperacao
// de senha). Reduz forca bruta e enumeracao de contas por IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // maximo de tentativas por IP na janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
});
