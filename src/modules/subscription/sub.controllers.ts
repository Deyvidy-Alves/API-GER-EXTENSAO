import { type Request, type Response } from "express";
import { SubService } from "./sub.services.js";

export class SubController {
  static async create (req: Request, res: Response) {
    try {
      const userId = req.user?.sub
       if (!userId) {
        res.status(401).json({ error: 'Não autorizado' })
        return
      }
      const sub = await SubService.create(req.body, userId);
      res.status(201).json(sub);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  } 
  
  static async listByCourse(req: Request<{ courseId: string }>, res: Response) {
    try {
      const userId = req.user?.sub;
      const roles = req.user?.roles ?? [];

      if (!userId) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
      }

      const { courseId } = req.params;
      const subs = await SubService.listByCourse(courseId, userId, roles);
      res.status(200).json(subs);
    } catch (error: any) {
      const status = error.message.includes('permissão') ? 403
        : error.message.includes('não encontrado') ? 404
        : 400;
      res.status(status).json({ error: error.message });
    }
  }
}