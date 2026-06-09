import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db-init";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'pilotzap-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'lax', // Proteção CSRF
  },
  name: 'zapfast.sid', // Nome customizado do cookie
}));

// Logging de sessões (apenas em desenvolvimento)
if (app.get("env") === "development") {
  app.use((req, res, next) => {
    const session = req.session as any;
    if (session?.userId) {
      console.log(`🔐 [SESSION] User ${session.userId} - ${req.method} ${req.path}`);
    }
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize the app and setup routes
let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return app;
  
  await initializeDatabase();
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const server = require('http').createServer(app);
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  isInitialized = true;
  return app;
};

// For Vercel serverless function
export default async (req: Request, res: Response) => {
  const app = await initializeApp();
  return app(req, res);
};

// For local development server
(async () => {
  if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    const listenOptions: any = {
      port,
      host: "0.0.0.0",
    };
    if (process.platform !== "win32") {
      listenOptions.reusePort = true;
    }
    server.listen(listenOptions, () => {
      log(`serving on port ${port}`);
      // Inicializar verificação de status e webhook ao iniciar o servidor
      import("./services/whatsappService").then(({ whatsappService }) => {
        whatsappService.getConnectionStatus("default-user").catch(console.error);
      });
      
      // Inicializar serviço de verificação de planos (verifica a cada 24h)
      import("./services/planExpirationService").then(({ planExpirationService }) => {
        planExpirationService.start(24); // Verifica a cada 24 horas
      });
    });
  }
})();
