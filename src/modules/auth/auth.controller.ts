import { type Request, type Response } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
  static async register (req: Request, res: Response) {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  }

  static async login (req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    return res.status(200).json(result)
  }

   static async me (req: Request, res: Response) {
     return res.status(200).json({ user: req.user });
  }

  static async forgotPassword(req: Request, res: Response) {
    const result = await AuthService.forgotPassword(req.body);
    return res.status(200).json(result);
  }

  static async resetPassword(req: Request, res: Response) {
    const result = await AuthService.resetPassword(req.body);
    return res.status(200).json(result);
  }

   static async refresh(req: Request, res: Response) {
    const result = await AuthService.refresh(req.body);
    return res.status(200).json(result);
  }

  static async logout(req: Request, res: Response) {
    const result = await AuthService.logout(req.body);
    return res.status(200).json(result);
  }
}
