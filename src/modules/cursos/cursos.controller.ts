import { type Request, type Response } from "express";
import { CursosService } from "./cursos.service.js";

export class CursosController {
  static async create(req: Request, res: Response) {
    const userId = req.user!.sub;
    const curso = await CursosService.createCurso(userId, req.body);
    return res.status(201).json(curso);
  }
  static async uploadImagem(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const curso = await CursosService.uploadImagem(
        id,
        req.file
    );

    return res.json(curso);
  }
  static async list(req: Request, res: Response) {
    const cursos = await CursosService.listCursos(req.query as any);
    return res.status(200).json(cursos);
  }

  static async findById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const curso = await CursosService.findCursoById(id);
    return res.status(200).json(curso);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.sub;
    const roles = req.user!.roles;

    const curso = await CursosService.updateCurso(id, userId, roles, req.body);
    return res.status(200).json(curso);
  }
    static async close(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.sub;
    const roles = req.user!.roles;

    const curso = await CursosService.closeCurso(id, userId, roles);
    return res.status(200).json(curso);
  }


  static async remove(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.sub;
    const roles = req.user!.roles;

    const curso = await CursosService.removeCurso(id, userId, roles);
    return res.status(200).json(curso);
  }

  static async publicar(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.sub;
    const roles = req.user!.roles;

    const curso = await CursosService.publicarCurso(id, userId, roles);
    return res.status(200).json(curso);
  }

  static async encerrar(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.sub;
    const roles = req.user!.roles;

    const curso = await CursosService.encerrarCurso(id, userId, roles);
    return res.status(200).json(curso);
  }
}
