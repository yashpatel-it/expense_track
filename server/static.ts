import type { Express } from "express";
import express from "express";
import path from "path";

export function serveStatic(app: Express) {
  // __dirname here points to dist/ at runtime
  const publicDir = path.join(__dirname, "public");

  // Serve static assets (JS, CSS, images)
  app.use(express.static(publicDir));

  // Catch-all: always return index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}
