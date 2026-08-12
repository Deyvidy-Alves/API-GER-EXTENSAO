import { type Request, type Response, type NextFunction } from 'express';

// Loga cada requisicao com metodo, rota, status e tempo de resposta.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`,
    );
  });

  next();
}
