import type { Request, Response } from "express";
import { DepartamentosService } from "./departamentos.service.js";
import { type ListDepartamentosQueryDTO } from "./departamentos.schema.js";

export class DepartamentosController {
  static async index(req: Request, res: Response) {
    const data = await DepartamentosService.list(req.query as ListDepartamentosQueryDTO);
    return res.status(200).json(data);
  }

  static async show(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await DepartamentosService.getById(id);
    return res.status(200).json(data);
  }

  static async create(req: Request, res: Response) {
    const data = await DepartamentosService.create(req.body);
    return res.status(201).json(data);
  }

  static async update(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await DepartamentosService.update(id, req.body);
    return res.status(200).json(data);
  }

  static async remove(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await DepartamentosService.remove(id);
    return res.status(200).json(data);
  }
}
