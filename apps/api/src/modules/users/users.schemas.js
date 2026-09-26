import { z } from 'zod';

export const updateMeSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  department: z.string().max(120).nullable().optional(),
  studentId: z.string().max(50).nullable().optional(),
  password: z.string().min(8).max(128).optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(['STUDENT', 'ORGANIZER', 'ADMIN']),
});

export const setActiveSchema = z.object({
  isActive: z.boolean(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(['STUDENT', 'ORGANIZER', 'ADMIN']).optional(),
  q: z.string().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});