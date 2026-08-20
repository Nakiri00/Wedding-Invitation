import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url('').default('https://nakiri00.github.io'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32).default('development-only-change-this-secret-please'),
})

const parsed = envSchema.parse(process.env)
if (parsed.NODE_ENV === 'production' && parsed.JWT_SECRET === 'development-only-change-this-secret-please') {
  throw new Error('JWT_SECRET wajib diganti pada production.')
}
export const env = parsed
