const express = require('express');
const next = require('next');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Logging setup
const LOG_FILE = path.join(__dirname, 'server-start.log');
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
}

log("Starting Express server (server.js)...");

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

// Fallback server
function startFallbackServer(errorMessage) {
  log("Starting FALLBACK Express server due to error: " + errorMessage);
  const app = express();
  app.get('*', (req, res) => {
    res.status(503).send(`
      <h1>503 Service Unavailable</h1>
      <p>The application failed to start.</p>
      <p><strong>Error:</strong> ${errorMessage}</p>
      <p>Please check <code>server-start.log</code>.</p>
    `);
  });
  app.listen(port, () => {
    log(`Fallback server listening on port ${port}`);
  });
}

try {
  log(`Initializing Next.js (dev: ${dev})...`);
  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare()
    .then(() => {
      log("Next.js prepared successfully.");
      const server = express();

      // Express Middleware
      server.disable('x-powered-by');
      server.use(express.json());
      server.use(express.urlencoded({ extended: true }));

      // Custom Health Check
      server.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      });

      // Serve static files if needed (Next.js usually handles this)
      // server.use(express.static(path.join(__dirname, 'public')));

      // Handle all requests with Next.js
      server.all('*', (req, res) => {
        return handle(req, res);
      });

      server.listen(port, (err) => {
        if (err) throw err;
        log(`🚀 Express Server ready on port ${port}`);
        log(`> Ready on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      log("Error during app.prepare(): " + (err.stack || err.message));
      startFallbackServer("Next.js build failed. Details: " + (err.message || 'Unknown error'));
    });

} catch (err) {
  log("Critical error in server.js: " + (err.stack || err.message));
  startFallbackServer("Critical startup error: " + (err.message || 'Unknown error'));
}
