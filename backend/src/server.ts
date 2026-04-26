import "dotenv/config";

import app from './app.js'
import {config} from './config/config.js';
import { initBrowser } from "./modules/documents/Document.service.js";

await initBrowser();

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${config.port}`);
});