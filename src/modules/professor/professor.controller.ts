import { type Request, type Response } from 'express';
import { ProfessorService } from './professor.service.js';

export class ProfessorController {
  static async getPerfil(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const perfil = await ProfessorService.getPerfil(userId);
      res.status(200).json(perfil);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async atualizarPerfil(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const perfil = await ProfessorService.atualizarPerfil(userId, req.body);
      res.status(200).json(perfil);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async criarCurso(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const curso = await ProfessorService.criarCurso(userId, req.body);
      res.status(201).json(curso);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async listarMeusCursos(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const cursos = await ProfessorService.listarMeusCursos(userId);
      res.status(200).json(cursos);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async detalharCurso(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const { id } = req.params as { id: string };
      const curso = await ProfessorService.detalharCurso(userId, id);
      res.status(200).json(curso);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async listarInscricoesDoCurso(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const { id } = req.params as { id: string };
      const inscricoes = await ProfessorService.listarInscricoesDoCurso(userId, id);
      res.status(200).json(inscricoes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
