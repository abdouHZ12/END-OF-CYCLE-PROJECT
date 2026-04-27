import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import mainRouter from './routes/index.route.js';
import { config } from './config/config.js';

const app: Express = express();

app.use(express.json());
app.use(corsMiddleware);
app.use('/api', mainRouter);
app.use(errorHandler);

export default app;

const PRIVATE_NETWORK_ORIGINS = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/;

function isAllowedOrigin(origin: string): boolean {
  if (origin === config.clientUrl) return true;
  if (config.nodeEnv !== 'production' && PRIVATE_NETWORK_ORIGINS.test(origin)) return true;
  return false;
}

function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}
