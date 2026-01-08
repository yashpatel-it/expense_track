import { db } from "./db";
import { expenses, type Expense, type InsertExpense } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  createExpense(userId: string, expense: InsertExpense): Promise<Expense>;
  getExpenses(userId: string, filters?: { month?: number, year?: number, category?: string }): Promise<Expense[]>;
  deleteExpense(userId: string, id: number): Promise<void>;
  getExpense(userId: string, id: number): Promise<Expense | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createExpense(userId: string, insertExpense: InsertExpense): Promise<Expense> {
    try {
      const [expense] = await db.insert(expenses).values({ ...insertExpense, userId }).returning();
      return expense;
    } catch (error) {
      console.error("Database error creating expense:", error);
      throw error;
    }
  }

  async getExpenses(userId: string, filters?: { month?: number, year?: number, category?: string }): Promise<Expense[]> {
    let query = db.select().from(expenses).where(eq(expenses.userId, userId));
    const allExpenses = await query;
    
    let filtered = allExpenses;
    if (filters) {
      if (filters.month) {
        filtered = filtered.filter(e => e.date.getMonth() + 1 === filters.month);
      }
      if (filters.year) {
        filtered = filtered.filter(e => e.date.getFullYear() === filters.year);
      }
      if (filters.category) {
        filtered = filtered.filter(e => e.category === filters.category);
      }
    }
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async deleteExpense(userId: string, id: number): Promise<void> {
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }

  async getExpense(userId: string, id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return expense;
  }
}

export const storage = new DatabaseStorage();
