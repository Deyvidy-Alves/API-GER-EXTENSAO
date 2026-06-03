import { type Request, type Response } from "express";
import { UserService } from "./user.service.js";

export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const user = await UserService.create(req.body);
      return res.status(201).json(user);
    } catch(error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json( { error: 'Erro interno do servidor' });
    }
  }
}