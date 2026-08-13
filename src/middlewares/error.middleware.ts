import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

// Rota nao encontrada.
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Rota nao encontrada.' });
}

// Handler global de erros: centraliza a resposta e evita vazar detalhes internos.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Erro nao tratado em ${req.method} ${req.originalUrl}:`, err);

  return res.status(500).json({ error: 'Erro interno do servidor.' });
}
