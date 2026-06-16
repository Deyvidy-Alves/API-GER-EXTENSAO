import { type Request, type Response, type NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { getEnv } from "../utils/getEnv.js";

interface TokenPayload {
  sub: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export function authMiddleware (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'token nao fornecido' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'token inválido' });
  }

  try {
    const payload = jwt.verify(token, getEnv('JWT_SECRET')) as TokenPayload;
    req.user = payload
    next();

  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado '});
  }
}