import 'dotenv/config';
import app from './app.js';
import { config } from './config/config.js';
import { initBrowser, closeBrowser } from './modules/documents/index.js';

async function start(): Promise<void> {
  await initBrowser();

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    await closeBrowser();
    
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});