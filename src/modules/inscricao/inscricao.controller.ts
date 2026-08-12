import { type Request, type Response } from 'express';
import { InscricaoService } from './inscricao.service.js';

function handleError(res: Response, error: any) {
  return res.status(error.statusCode ?? 500).json({
    error: error.message ?? 'Erro interno do servidor',
  });
}

export class InscricaoController {
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
      }
      const sub = await InscricaoService.create(req.body, userId);
      res.status(201).json(sub);
    } catch (error: any) {
      handleError(res, error);
    }
  }

  static async listByCourse(req: Request<{ cursoId: string }>, res: Response) {
    try {
      const userId = req.user?.sub;
      const roles = req.user?.roles ?? [];
      if (!userId) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
      }
      const { cursoId } = req.params;
      const subs = await InscricaoService.listByCourse(cursoId, userId, roles);
      res.status(200).json(subs);
    } catch (error: any) {
      handleError(res, error);
    }
  }

  static async listMine(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
      }
      const subs = await InscricaoService.listMine(userId);
      res.status(200).json(subs);
    } catch (error: any) {
      handleError(res, error);
    }
  }

  static async approve(req: Request<{ id: string }>, res: Response) {
    await InscricaoController.handleStatusChange(req, res, 'APROVADA');
  }

  static async reject(req: Request<{ id: string }>, res: Response) {
    await InscricaoController.handleStatusChange(req, res, 'REJEITADA');
  }

  static async cancel(req: Request<{ id: string }>, res: Response) {
    await InscricaoController.handleStatusChange(req, res, 'CANCELADA');
  }

  static async waitlist(req: Request<{ id: string }>, res: Response) {
    await InscricaoController.handleStatusChange(req, res, 'LISTA_ESPERA');
  }

  private static async handleStatusChange(
    req: Request<{ id: string }>,
    res: Response,
    status: 'APROVADA' | 'REJEITADA' | 'CANCELADA' | 'LISTA_ESPERA'
  ) {
    try {
      const userId = req.user?.sub;
      const roles = req.user?.roles ?? [];
      if (!userId) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
      }
      const { id } = req.params;
      const { observacao } = req.body;
      const sub = await InscricaoService.updateStatus(id, status, userId, roles, observacao);
      res.status(200).json(sub);
    } catch (error: any) {
      handleError(res, error);
    }
  }
}