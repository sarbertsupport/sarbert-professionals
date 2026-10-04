import { z } from 'zod';

/** Matches server `CreateSupportTicketRequest` / sanitization expectations */
export const supportTicketFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(500, 'Subject must be at most 500 characters'),
  category: z.enum(['GENERAL', 'BILLING', 'TECHNICAL', 'ACCOUNT', 'OTHER']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  message: z
    .string()
    .trim()
    .min(1, 'Please describe your issue')
    .max(20000, 'Message is too long'),
});

export const supportReplySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Enter a message')
    .max(20000, 'Message is too long'),
});
