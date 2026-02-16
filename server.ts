import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import next from 'next';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, 'server-start.log');

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
}

log("Starting Express server...");

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

// Fallback server function
function startFallbackServer(errorMessage: string): void {
  log("Starting FALLBACK Express server due to error: " + errorMessage);
  
  const app = express();
  
  app.get('*', (req: Request, res: Response) => {
    res.status(503).send(`
      <h1>503 Service Unavailable</h1>
      <p>The application failed to start.</p>
      <p><strong>Error:</strong> ${errorMessage}</p>
      <p>Please check <code>server-start.log</code> in the root directory for more details.</p>
    `);
  });

  app.listen(port, () => {
    log(`Fallback server listening on port ${port}`);
  });
}

try {
  log(`Initializing Next.js (dev: ${dev})...`);
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  nextApp.prepare()
    .then(() => {
      log("Next.js prepared successfully.");
      const app = express();

      // Express Middleware examples (can be extended)
      app.disable('x-powered-by');
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      // Health check route
      app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      });

      // Serve static files from public if needed explicitly (Next.js handles this usually)
      // app.use(express.static(path.join(__dirname, 'public')));

      // Handle all other routes with Next.js
      app.all('*', (req: Request, res: Response) => {
        return handle(req, res);
      });

      app.listen(port, () => {
        log(`🚀 Express Server ready on port ${port}`);
        log(`> Ready on http://localhost:${port}`);
      });
    })
    .catch((err: any) => {
      const stack = err?.stack || 'No stack trace';
      const message = err?.message || 'Unknown error';
      log("Error during nextApp.prepare(): " + stack);
      startFallbackServer("Next.js build not found or failed to load. Ensure 'npm run build' was successful. Details: " + message);
    });

} catch (err: any) {
  const stack = err?.stack || 'No stack trace';
  const message = err?.message || 'Unknown error';
  log("Critical error in server.ts: " + stack);
  startFallbackServer("Critical startup error: " + message);
}
