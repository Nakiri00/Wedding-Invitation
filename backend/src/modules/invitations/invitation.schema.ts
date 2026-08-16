import { z } from 'zod'

export const rsvpSchema = z.object({
  name: z.string().trim().min(2).max(160),
  attendance: z.enum(['attending', 'not_attending']),
  guestCount: z.number().int().min(0).max(50),
  babyCount: z.number().int().min(0).max(50).default(0),
})

export const messageSchema = z.object({
  name: z.string().trim().min(2).max(160),
  message: z.string().trim().min(1).max(1000),
})
