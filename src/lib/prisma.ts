import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { getEnv } from "../utils/getEnv.js";

// Bancos gerenciados na nuvem (ex: Aiven) exigem conexao via SSL/TLS.
// Habilite definindo DATABASE_SSL=true no ambiente de producao.
const useSsl = process.env.DATABASE_SSL === "true";

const adapter = new PrismaMariaDb({
  host: getEnv("DATABASE_HOST"),
  port: Number(process.env.DATABASE_PORT) || 3308,
  user: getEnv("DATABASE_USER"),
  password: getEnv("DATABASE_PASSWORD"),
  database: getEnv("DATABASE_NAME"),
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});
const prisma = new PrismaClient({ adapter });

export { prisma };