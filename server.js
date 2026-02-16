const http = require('http');
const path = require('path');
const fs = require('fs');

// 1. Basic Setup & Logging
const LOG_FILE = path.join(__dirname, 'server-debug.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {}
}

log("----------------------------------------");
log("Server process started.");
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`Current Directory: ${process.cwd()}`);

// 2. Load Environment Variables
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    log("Loaded .env file");
  } else {
    log("No .env file found in root");
  }
} catch (e) {
  log(`Failed to load .env: ${e.message}`);
}

// 3. Define the Request Handler (Dynamic)
let currentHandler = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><meta http-equiv="refresh" content="5"></head>
      <body>
        <h1>Application Starting...</h1>
        <p>Please wait while the server initializes.</p>
        <p>Current time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
};

// 4. Start the HTTP Server IMMEDIATELY
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  try {
    currentHandler(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    res.writeHead(500);
    res.end("Internal Server Error during request handling");
  }
});

server.listen(port, (err) => {
  if (err) {
    log(`FATAL: Failed to bind port ${port}: ${err.message}`);
    process.exit(1);
  }
  log(`Server listening on port ${port}`);
  
  // 5. Attempt to Load Next.js App
  initializeNextApp();
});

// 6. Initialization Logic
async function initializeNextApp() {
  try {
    log("Initializing Next.js application...");
    
    // Check for standalone build
    const standaloneDir = path.join(__dirname, '.next', 'standalone');
    let nextHandler;

    if (fs.existsSync(standaloneDir)) {
      log(`Found standalone directory: ${standaloneDir}`);
      
      // We must change directory for standalone to work correctly
      try {
        process.chdir(standaloneDir);
        log(`Changed cwd to: ${process.cwd()}`);
      } catch (e) {
        log(`WARNING: Failed to change cwd: ${e.message}`);
      }
      
      // Require the standalone server
      // Note: Standalone server.js usually starts its own server.
      // We need to import the handler logic or let it run.
      // BUT, standard Next.js standalone 'server.js' executes 'startServer' immediately.
      // We cannot easily wrap it. 
      // STRATEGY: We will try to load it. If it starts its own server, it might conflict on port if we don't close ours.
      // HOWEVER, Hostinger expects US to bind the port.
      
      // Let's try to load the standard Next.js dev/prod server programmatically instead.
      // This is safer than relying on the standalone 'server.js' implementation details.
      
      // Reset CWD to root if we are going to use 'next' package directly
      process.chdir(__dirname); 
    }
    
    // Use standard Next.js Custom Server API
    // This works for both standalone (if node_modules are present) and standard build
    const next = require('next');
    const { parse } = require('url');
    
    const dev = process.env.NODE_ENV !== 'production';
    const app = next({ dev, dir: __dirname });
    const handle = app.getRequestHandler();
    
    await app.prepare();
    log("Next.js app.prepare() completed successfully.");
    
    // Update the handler to use Next.js
    currentHandler = (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    };
    
    log("Server fully operational.");
    
  } catch (err) {
    log(`CRITICAL INITIALIZATION ERROR: ${err.message}`);
    log(err.stack);
    
    // Update handler to show error page
    currentHandler = (req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family:sans-serif; padding:2rem;">
            <h1 style="color:red">Application Failed to Start</h1>
            <p>The server encountered an error during initialization.</p>
            <div style="background:#eee; padding:1rem; border-radius:5px; overflow:auto;">
              <pre>${err.message}\n\n${err.stack}</pre>
            </div>
            <p>Check <code>server-debug.log</code> for full details.</p>
          </body>
        </html>
      `);
    };
  }
}

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}`);
  log(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`);
});
