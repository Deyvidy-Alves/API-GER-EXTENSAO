import cors, { type CorsOptions } from 'cors';

// Origens liberadas vem da env CORS_ORIGINS (separadas por virgula).
// Sem a env, libera todas as origens (util em desenvolvimento).
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requisicoes sem origin (ex: Postman, apps server-to-server) sao liberadas.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origem nao permitida pelo CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
