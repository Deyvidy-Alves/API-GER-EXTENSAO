import { type Request, type Response, type NextFunction } from "express";
import { ZodType } from "zod";
 
export function validateZod(schema: ZodType, source: 'body' | 'params' | 'query') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    // Express 5 não permite sobrescrever req.query (somente getter).
    // Para body e params reatribuímos normalmente; para query apenas validamos
    // e deixamos o controller ler de req.query diretamente.
    if (source !== 'query') {
      req[source] = result.data;
    }
    next();
  }
}
