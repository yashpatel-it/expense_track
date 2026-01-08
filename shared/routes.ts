import { z } from 'zod';
import { insertExpenseSchema, expenses } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses',
      input: z.object({
        month: z.coerce.number().optional(), // 1-12
        year: z.coerce.number().optional(),
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof expenses.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema,
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/expenses/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    summary: { 
        method: 'GET' as const,
        path: '/api/stats',
        input: z.object({
            month: z.coerce.number().optional(),
            year: z.coerce.number().optional(),
        }).optional(),
        responses: {
            200: z.object({
                total: z.number(),
                byCategory: z.array(z.object({
                    category: z.string(),
                    amount: z.number(),
                    count: z.number()
                })),
                monthlyTrend: z.array(z.object({
                    date: z.string(),
                    amount: z.number()
                }))
            })
        }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
