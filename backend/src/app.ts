import express, {type Express} from 'express';
import { errorHandler } from "./middlewares/errorHandler.js";
import DocumentRouter from './routes/DocumentRoute.js'
const app: Express = express();

app.use(express.json());

// Routes

app.use('/',DocumentRouter)
// Global error handler (should be after routes)
app.use(errorHandler);

export default app;

