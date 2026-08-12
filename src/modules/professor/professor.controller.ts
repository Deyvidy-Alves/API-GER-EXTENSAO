import { type Request, type Response } from 'express';
import { ProfessorService } from './professor.service.js';

export class ProfessorController {
  static async getPerfil(req: Request, res: Response) {
    const userId = req.user!.sub;
    const perfil = await ProfessorService.getPerfil(userId);
    res.status(200).json(perfil);
  }

  static async atualizarPerfil(req: Request, res: Response) {
    const userId = req.user!.sub;
    const perfil = await ProfessorService.atualizarPerfil(userId, req.body);
    res.status(200).json(perfil);
  }

  static async listarMeusCursos(req: Request, res: Response) {
    const userId = req.user!.sub;
    const cursos = await ProfessorService.listarMeusCursos(userId);
    res.status(200).json(cursos);
  }

  static async detalharCurso(req: Request, res: Response) {
    const userId = req.user!.sub;
    const id = req.params.id as string;
    const curso = await ProfessorService.detalharCurso(userId, id);
    res.status(200).json(curso);
  }

  static async listarInscricoesDoCurso(req: Request, res: Response) {
    const userId = req.user!.sub;
    const id = req.params.id as string;
    const inscricoes = await ProfessorService.listarInscricoesDoCurso(userId, id);
    res.status(200).json(inscricoes);
  }
}
