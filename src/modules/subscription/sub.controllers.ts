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
}