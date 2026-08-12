import type { Request, Response } from "express";
import { DeppiService } from "./deppi.service.js";

export class DeppiController {
  static async index(_req: Request, res: Response) {
    const data = await DeppiService.list();
    return res.status(200).json(data);
  }

  static async show(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await DeppiService.getById(id);
    return res.status(200).json(data);
  }

  static async create(req: Request, res: Response) {
    const data = await DeppiService.create(req.body);
    return res.status(201).json(data);
  }

  static async update(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await DeppiService.update(id, req.body);
    return res.status(200).json(data);
  }

  static async remove(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await DeppiService.remove(id);
    return res.status(200).json(data);
  }
}
