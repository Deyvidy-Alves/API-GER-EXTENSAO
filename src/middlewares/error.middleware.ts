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

  // Erros conhecidos do Prisma: traduz para status HTTP adequados em vez de 500.
  // Usamos duck typing no `code` para nao acoplar ao caminho do client gerado.
  const prismaError = err as { code?: string; meta?: { target?: unknown } };
  if (typeof prismaError?.code === 'string' && /^P\d{4}$/.test(prismaError.code)) {
    switch (prismaError.code) {
      case 'P2002': {
        // Violacao de unicidade (ex.: email, cpf, siape, matricula ja cadastrados).
        const target = prismaError.meta?.target;
        const campo = Array.isArray(target) ? target.join(', ') : String(target ?? 'campo');
        return res.status(409).json({ error: `Valor duplicado para: ${campo}.` });
      }
      case 'P2025':
        // Registro nao encontrado para a operacao solicitada.
        return res.status(404).json({ error: 'Registro nao encontrado.' });
      case 'P2003':
        // Violacao de chave estrangeira.
        return res.status(409).json({ error: 'Operacao viola uma referencia existente.' });
    }
  }

  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Erro nao tratado em ${req.method} ${req.originalUrl}:`, err);

  return res.status(500).json({ error: 'Erro interno do servidor.' });
}
