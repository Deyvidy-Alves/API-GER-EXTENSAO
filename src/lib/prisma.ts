import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { getEnv } from "../utils/getEnv.js";

const adapter = new PrismaMariaDb({
  host: getEnv("DATABASE_HOST"),
  port: Number(process.env.DATABASE_PORT) || 3308,
  user: getEnv("DATABASE_USER"),
  password: getEnv("DATABASE_PASSWORD"),
  database: getEnv("DATABASE_NAME"),
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

export { prisma };