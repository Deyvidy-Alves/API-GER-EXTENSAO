import { type Request, type Response } from "express";
import { SubService } from "./sub.services.js";

export class SubController {
  static async create (req: Request, res: Response) {
    const userId = req.user?.sub
     if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }
    const sub = await SubService.create(req.body, userId);
    res.status(201).json(sub);
  }
  
  static async listByCourse(req: Request<{ cursoId: string }>, res: Response) {
    const userId = req.user?.sub;
    const roles = req.user?.roles ?? [];

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const { cursoId } = req.params;
    const subs = await SubService.listByCourse(cursoId, userId, roles);
    res.status(200).json(subs);
  }

  static async listMine(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }
    const subs = await SubService.listMine(userId);
    res.status(200).json(subs);
  }

  static async approve(req: Request<{ id: string }>, res: Response) {
    await SubController.handleStatusChange(req, res, 'APROVADA');
  }

  static async reject(req: Request<{ id: string }>, res: Response) {
    await SubController.handleStatusChange(req, res, 'REJEITADA');
  }

  static async cancel(req: Request<{ id: string }>, res: Response) {
    await SubController.handleStatusChange(req, res, 'CANCELADA');
  }

  private static async handleStatusChange(
    req: Request<{ id: string }>,
    res: Response,
    status: 'APROVADA' | 'REJEITADA' | 'CANCELADA'
  ) {
    const userId = req.user?.sub;
    const roles = req.user?.roles ?? [];
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }
    const { id } = req.params;
    const { observacao } = req.body;
    const sub = await SubService.updateStatus(id, status, userId, roles, observacao);
    res.status(200).json(sub);
  }
}