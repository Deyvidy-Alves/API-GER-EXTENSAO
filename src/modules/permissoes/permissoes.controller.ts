import type { Request, Response } from "express";
import { PermissoesService } from "./permissoes.service.js";

function getParam(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

export class PermissoesController {
  static async listPapeis(_req: Request, res: Response) {
    try {
      const data = await PermissoesService.listPapeis();
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async listPermissoes(_req: Request, res: Response) {
    try {
      const data = await PermissoesService.listPermissoes();
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async createPermissao(req: Request, res: Response) {
    try {
      const data = await PermissoesService.createPermissao(req.body);
      return res.status(201).json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async vincularPapel(req: Request, res: Response) {
    try {
      const userId = getParam(req.params.userId);
      if (!userId) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const data = await PermissoesService.vincularPapel(userId, req.body.papelId);
      return res.status(201).json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async desvincularPapel(req: Request, res: Response) {
    try {
      const userId = getParam(req.params.userId);
      const papelId = getParam(req.params.papelId);
      if (!userId || !papelId) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const data = await PermissoesService.desvincularPapel(userId, papelId);
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async vincularPermissao(req: Request, res: Response) {
    try {
      const papelId = getParam(req.params.papelId);
      if (!papelId) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const data = await PermissoesService.vincularPermissao(papelId, req.body.permissaoId);
      return res.status(201).json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async desvincularPermissao(req: Request, res: Response) {
    try {
      const papelId = getParam(req.params.papelId);
      const permissaoId = getParam(req.params.permissaoId);
      if (!papelId || !permissaoId) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const data = await PermissoesService.desvincularPermissao(papelId, permissaoId);
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}
