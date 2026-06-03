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

}