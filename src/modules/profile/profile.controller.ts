import { type Request, type Response } from "express";
import { ProfileService } from "./profile.service.js";


export class ProfileController {
  static async upsertStudentProfile (req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const roles = req.user!.roles;
      const { profile, created } = await ProfileService.upsertStudentProfile(userId, roles, req.body);
      res.status(created ? 201 : 200).json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
    static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const roles = req.user!.roles;
      const profile = await ProfileService.getProfile(userId, roles);
      return res.status(200).json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
 
  static async uploadFoto(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const user = await ProfileService.saveFoto(userId, req.file);
      return res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
 
  static async updateTelefone(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const user = await ProfileService.updateTelefone(userId, req.body);
      return res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
 
  static async updateEndereco(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const user = await ProfileService.updateEndereco(userId, req.body);
      return res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

}