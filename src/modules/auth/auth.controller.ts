import { type Request, type Response } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
  static async register (req: Request, res: Response) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message});
    }
  }
}