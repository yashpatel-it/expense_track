// Vercel serverless function handler
// Import the app creation function from the built server
import type { Express } from "express";
import { createRequire } from "module";

// Use require to load the CommonJS build
// In Vercel, the dist folder is included at the root level
const require = createRequire(import.meta.url);
const serverModule = require("../dist/index.cjs");
const { createApp } = serverModule;

// Initialize the app once (outside the handler for better performance)
// This is cached across invocations in the same container/warm instance
let appPromise: Promise<Express> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

// Vercel serverless function handler
// Vercel will call this function for each request
export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    if (!app) {
      throw new Error("Failed to initialize app");
    }
    
    // Vercel's request/response objects are compatible with Express middleware
    // Pass them through to the Express app which will handle routing
    return new Promise<void>((resolve) => {
      app(req, res, () => {
        // If no route matched, send 404
        if (!res.headersSent) {
          res.status(404).json({ message: "Not found" });
        }
        resolve();
      });
    });
  } catch (error) {
    console.error("Error in Vercel handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

