import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertExpenseSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // List
  app.get(api.expenses.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const category = req.query.category as string | undefined;
    
    const expenses = await storage.getExpenses(userId, { month, year, category });
    res.json(expenses);
  });

  // Create
  app.post(api.expenses.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertExpenseSchema.parse(req.body);
      
      // Convert amount to integer (round to nearest whole number for rupees)
      const expenseData = {
        ...data,
        amount: Math.round(data.amount),
      };
      
      const expense = await storage.createExpense(userId, expenseData);
      res.status(201).json(expense);
    } catch (e) {
       if (e instanceof z.ZodError) {
          console.error("Validation error:", e.errors);
          res.status(400).json({ message: e.errors.map(err => err.message).join(", ") });
       } else {
          console.error("Error creating expense:", e);
          // Get more detailed error information
          let errorMessage = "Internal server error";
          if (e instanceof Error) {
            errorMessage = e.message;
            // Check for common database errors
            if (e.message.includes("relation") && e.message.includes("does not exist")) {
              errorMessage = "Database table not found. Please run migrations to create the expenses table.";
            } else if (e.message.includes("connection") || e.message.includes("ECONNREFUSED")) {
              errorMessage = "Database connection failed. Please check your DATABASE_URL environment variable.";
            }
          }
          console.error("Full error details:", {
            message: errorMessage,
            stack: e instanceof Error ? e.stack : undefined,
            error: e
          });
          res.status(500).json({ message: errorMessage });
       }
    }
  });

  // Delete
  app.delete(api.expenses.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    await storage.deleteExpense(userId, id);
    res.status(204).end();
  });

  // Stats
  app.get(api.expenses.summary.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    
    const expenses = await storage.getExpenses(userId, { month, year });
    
    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const categoryMap = new Map<string, {amount: number, count: number}>();
    expenses.forEach(e => {
        const current = categoryMap.get(e.category) || { amount: 0, count: 0 };
        categoryMap.set(e.category, { 
            amount: current.amount + (Number(e.amount) || 0),
            count: current.count + 1
        });
    });
    
    const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        amount: stats.amount,
        count: stats.count
    }));

    const trendMap = new Map<string, number>();
    expenses.forEach(e => {
        const dateStr = e.date.toISOString().split('T')[0];
        trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + (Number(e.amount) || 0));
    });
    const monthlyTrend = Array.from(trendMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
        total,
        byCategory,
        recent: expenses.slice(0, 5),
        monthlyTrend
    });
  });

  return httpServer;
}
