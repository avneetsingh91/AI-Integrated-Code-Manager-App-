import dotenv from "dotenv";
dotenv.config(); // Load environment variables


import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import mongoose from "mongoose";
import cors from "cors";

// Initialize the express app
const app = express();
app.use(cors());

// Define types for raw body access
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Logging middleware
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

// Main async function to initialize the app
(async () => {
  // Check if MONGODB_URI is set in the environment variables
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    let uri = process.env.MONGODB_URI;
    // Sanitize URI: remove quotes if present
    uri = uri.replace(/^['"]|['"]$/g, '');
    
    // Ensure protocol is present
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.warn("MONGODB_URI is missing protocol. Attempting to prepend 'mongodb://'");
      uri = `mongodb://${uri}`;
    }

    // Attempt to connect to MongoDB
    await mongoose.connect(uri);
    log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't exit, just log error so server can still start (frontend might work partially)
    // process.exit(1); 
  }

  // Register API routes
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Set up Vite in development mode
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Always serve the app on the port specified in the environment variable PORT
  const port = parseInt(process.env.PORT || '5001', 10);

// Old code (fails on Windows)
// server.listen({ port, host: '0.0.0.0', reusePort: true }, () => log(`Server running`));

// New code (Windows-safe)
server.listen(port, 'localhost', () => {
  console.log(`Server running on http://localhost:${port}`);
});;
})();
