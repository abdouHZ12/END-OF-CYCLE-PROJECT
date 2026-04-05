import express, {type Express} from 'express';
import { errorHandler } from "./middlewares/errorHandler.js";
import mainRouter from './routes/index.route.js';
import { config } from './config/config.js';

const app: Express = express();

app.use(express.json());

// CORS (minimal) for browser clients (e.g. Next.js on http://localhost:3000)
app.use((req, res, next) => {
	const origin = req.headers.origin;

	const isDevLocalhostOrigin =
		typeof origin === 'string' &&
		(origin.startsWith('http://localhost:') ||
			origin.startsWith('http://127.0.0.1:'));

	const allowOrigin =
		origin &&
		(origin === config.clientUrl ||
			(process.env.NODE_ENV !== 'production' && isDevLocalhostOrigin));

	if (allowOrigin) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin');
		res.setHeader('Access-Control-Allow-Credentials', 'true');
	}

	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET,POST,PUT,PATCH,DELETE,OPTIONS'
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization'
	);

	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	next();
});

// Routes
app.use('/api', mainRouter);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;

