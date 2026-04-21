import "dotenv/config";

import app from './app.js'
import {config} from './config/config.js';
import { initBrowser } from "./modules/documents/Document.service.js";

await initBrowser();

app.listen(config.port, () => {
  console.log(`Server running: http://localhost:${config.port}`);
});