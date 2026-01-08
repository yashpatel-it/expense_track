import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertExpense } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useExpenses(params?: { month?: number; year?: number; category?: string }) {
  return useQuery({
    queryKey: [api.expenses.list.path, params],
    queryFn: async () => {
      const url = buildUrl(api.expenses.list.path);
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.append("month", params.month.toString());
      if (params?.year) searchParams.append("year", params.year.toString());
      if (params?.category) searchParams.append("category", params.category);

      const res = await fetch(`${url}?${searchParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return api.expenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useExpenseStats(params?: { month?: number; year?: number }) {
  return useQuery({
    queryKey: [api.expenses.summary.path, params],
    queryFn: async () => {
      const url = buildUrl(api.expenses.summary.path);
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.append("month", params.month.toString());
      if (params?.year) searchParams.append("year", params.year.toString());
      
      const res = await fetch(`${url}?${searchParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch statistics");
      return api.expenses.summary.responses[200].parse(await res.json());
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertExpense) => {
      try {
        const validated = api.expenses.create.input.parse(data);
        const url = buildUrl(api.expenses.create.path);
        
        // Validate URL is not malformed
        if (!url || typeof url !== 'string' || !url.startsWith('/')) {
          throw new Error(`Invalid API URL: ${url}`);
        }
        
        const res = await fetch(url, {
          method: api.expenses.create.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
          credentials: "include",
        });

        if (!res.ok) {
          let errorMessage = "Failed to create expense";
          try {
            const errorData = await res.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If response is not JSON, use default message
            errorMessage = `Failed to create expense: ${res.status} ${res.statusText}`;
          }
          throw new Error(errorMessage);
        }
        return api.expenses.create.responses[201].parse(await res.json());
      } catch (error) {
        // Re-throw with a clean error message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred while creating the expense");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.expenses.summary.path] });
      toast({
        title: "Expense Added",
        description: "Your expense has been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.expenses.delete.path, { id });
      const res = await fetch(url, {
        method: api.expenses.delete.method,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Expense not found");
        throw new Error("Failed to delete expense");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.expenses.summary.path] });
      toast({
        title: "Deleted",
        description: "Expense removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
