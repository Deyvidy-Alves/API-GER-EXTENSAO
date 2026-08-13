import type { Request, Response } from "express";
import { InstituicoesService } from "./instituicoes.service.js";

export class InstituicoesController {
  static async index(_req: Request, res: Response) {
    const data = await InstituicoesService.list();
    return res.status(200).json(data);
  }

  static async show(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await InstituicoesService.getById(id);
    return res.status(200).json(data);
  }

  static async create(req: Request, res: Response) {
    const data = await InstituicoesService.create(req.body);
    return res.status(201).json(data);
  }

  static async update(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await InstituicoesService.update(id, req.body);
    return res.status(200).json(data);
  }

  static async setAtivo(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await InstituicoesService.setAtivo(id, req.body.ativo);
    return res.status(200).json(data);
  }

  static async remove(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await InstituicoesService.remove(id);
    return res.status(200).json(data);
  }
}
