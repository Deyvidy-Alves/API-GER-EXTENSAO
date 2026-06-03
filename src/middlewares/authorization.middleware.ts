import { type Request, type Response, type NextFunction} from "express";

export function checkRole(...roles: string[]) { //passo como argumento os papeis para acessar a rota
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];
    const hasRole = roles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Acesso negado: papel insuficiente!' });
    }
    next();
  }
}

export function checkPermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions ?? [];

    if (!permissions.includes(`${resource}:${action}`)) {
      return res.status(403).json({ error: 'Acesso negado: permissao insuficiente!' });
    }

    next();
  }
}