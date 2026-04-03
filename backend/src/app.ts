import express, {type Express} from 'express';
import { errorHandler } from "./middlewares/errorHandler.js";
import mainRouter from './routes/index.route.js';

const app: Express = express();

app.use(express.json());

// Routes
app.use('/api', mainRouter);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;

