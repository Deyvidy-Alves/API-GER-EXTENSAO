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

  static async login (req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      return res.status(200).json(result)
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}