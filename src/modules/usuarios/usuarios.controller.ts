import type { Request, Response } from "express";
import { UsuariosService } from "./usuarios.service.js";
import { type ListUsuariosQueryDTO } from "./usuarios.schema.js";

export class UsuariosController {
  static async index(req: Request, res: Response) {
    const data = await UsuariosService.list(req.query as ListUsuariosQueryDTO);
    return res.status(200).json(data);
  }

  static async show(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await UsuariosService.getById(id);
    return res.status(200).json(data);
  }

  static async update(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await UsuariosService.update(id, req.body);
    return res.status(200).json(data);
  }

  static async remove(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await UsuariosService.remove(id);
    return res.status(200).json(data);
  }
}
