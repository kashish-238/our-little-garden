import { z } from 'zod';
import { 
  insertGardenSchema, 
  insertUserSchema, 
  insertFlowerSchema, 
  insertLetterSchema,
  gardens,
  users,
  flowers,
  letters
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const gardenStateSchema = z.object({
  garden: z.custom<typeof gardens.$inferSelect>(),
  users: z.array(z.custom<typeof users.$inferSelect>()),
  flowers: z.array(z.custom<typeof flowers.$inferSelect>()),
  letters: z.array(z.custom<typeof letters.$inferSelect>()),
});

export const api = {
  gardens: {
    create: {
      method: 'POST' as const,
      path: '/api/gardens' as const,
      input: insertGardenSchema,
      responses: {
        201: z.custom<typeof gardens.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/gardens/:code' as const,
      responses: {
        200: z.custom<typeof gardens.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getState: {
      method: 'GET' as const,
      path: '/api/gardens/:code/state' as const,
      responses: {
        200: gardenStateSchema,
        404: errorSchemas.notFound,
      },
    },
    updateHealth: {
      method: 'PATCH' as const,
      path: '/api/gardens/:code/health' as const,
      input: z.object({ healthScore: z.number() }),
      responses: {
        200: z.custom<typeof gardens.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    createUser: {
      method: 'POST' as const,
      path: '/api/gardens/:code/users' as const,
      input: insertUserSchema.omit({ gardenCode: true }), // code comes from URL
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    createFlower: {
      method: 'POST' as const,
      path: '/api/gardens/:code/flowers' as const,
      input: insertFlowerSchema.omit({ gardenCode: true }),
      responses: {
        201: z.custom<typeof flowers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateFlower: {
      method: 'PATCH' as const,
      path: '/api/gardens/:code/flowers/:id' as const,
      input: insertFlowerSchema.partial(),
      responses: {
        200: z.custom<typeof flowers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    createLetter: {
      method: 'POST' as const,
      path: '/api/gardens/:code/letters' as const,
      input: insertLetterSchema.omit({ gardenCode: true }),
      responses: {
        201: z.custom<typeof letters.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    readLetter: {
      method: 'PATCH' as const,
      path: '/api/gardens/:code/letters/:id/read' as const,
      responses: {
        200: z.custom<typeof letters.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
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

// Types
export type GardenState = z.infer<typeof gardenStateSchema>;
