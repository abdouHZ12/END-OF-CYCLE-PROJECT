import express, {type Express} from 'express';
import { errorHandler } from "./middlewares/errorHandler.js";
import mainRouter from './routes/index.route.js';
import { config } from './config/config.js';

const app: Express = express();

app.use(express.json());

app.use((req, res, next) => {
	const origin = req.headers.origin;

	const isDevPrivateNetworkOrigin =
		typeof origin === 'string' &&
		(origin.startsWith('http://localhost:') ||
			origin.startsWith('http://127.0.0.1:') ||
			origin.startsWith('http://192.168.') ||
			origin.startsWith('http://10.') ||
			/^http:\/\/172\.(1[6-9]|2\d|3[0-1])\./.test(origin));

	const allowOrigin =
		origin &&
		(origin === config.clientUrl ||
			(process.env.NODE_ENV !== 'production' && isDevPrivateNetworkOrigin));

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

