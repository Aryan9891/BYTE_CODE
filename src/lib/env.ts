import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Sahayak'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'hi', 'bn']).default('en'),
  DEFAULT_REGION_CODE: z.string().min(2).default('IN'),
  SUPPORT_MODE: z.enum(['demo', 'launch']).default('demo'),
  NEXT_PUBLIC_SUPPORT_MODE: z.enum(['demo', 'launch']).default('demo'),
  ENABLE_DESIGN_SYSTEM_SHOWCASE: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  ENABLE_AUTOMATED_EMERGENCY_DISPATCH: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  K_ANONYMITY_MIN_COHORT_SIZE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(5))
    .default('10'),
  // Optional in M0, required in M1+
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  PSEUDO_SALT_SECRET: z.string().optional(),
  APP_MASTER_ENCRYPTION_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const env = validateEnv();
