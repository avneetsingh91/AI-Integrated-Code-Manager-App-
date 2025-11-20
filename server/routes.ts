import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import fileRoutes from "./routes/files";
import aiRoutes from "./routes/ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/ai", aiRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
