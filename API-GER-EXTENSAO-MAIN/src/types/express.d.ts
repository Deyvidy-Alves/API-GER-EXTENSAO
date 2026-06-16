import { JwtPayload } from "jsonwebtoken";
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string
        name: string
        email: string
        roles: string[]
        permissions: string[]
      }
    }
  }
}