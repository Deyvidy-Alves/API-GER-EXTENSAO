import { type Request, type Response } from "express";

import { DeppiService } from "./deppi.service.js";

export class DeppiController {
  /**
   * POST /deppi
   */
  static async create(req: Request, res: Response) {
    try {
      const deppi = await DeppiService.create(req.body);

      return res.status(201).json({
        message: "Usuário DEPPI cadastrado com sucesso.",
        deppi,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /deppi
   */
  static async findAll(req: Request, res: Response) {
    try {
      const deppis = await DeppiService.findAll();

      return res.status(200).json({
        deppis,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /deppi/:id
   */
  static async findById(req: Request, res: Response) {
    try {
      const deppi = await DeppiService.findById(req.params.id as string);

      return res.status(200).json({
        deppi,
      });
    } catch (error: any) {
      return res.status(404).json({
        error: error.message,
      });
    }
  }

  /**
   * PATCH /deppi/:id
   */
  static async update(req: Request, res: Response) {
    try {
      const deppi = await DeppiService.update(
        req.params.id as string,
        req.body
      );

      return res.status(200).json({
        message: "Usuário DEPPI atualizado com sucesso.",
        deppi,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * DELETE /deppi/:id
   *
   * Executa soft delete.
   */
  static async remove(req: Request, res: Response) {
    try {
      const deppi = await DeppiService.remove(req.params.id as string);

      return res.status(200).json({
        message: "Usuário DEPPI desativado com sucesso.",
        deppi,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}
