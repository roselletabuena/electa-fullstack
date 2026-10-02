import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().optional(),
    AUTH_PROVIDER: z.enum(["local", "localstack", "cognito"]).default("local"),
    AUTH_SECRET: z.string().min(1).default("electa_local_jwt_secret_dev_32_bytes_long"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    TURNSTILE_SECRET_KEY: z.string().min(1).default("1x0000000000000000000000000000000AA"),
    PAYMONGO_SECRET_KEY: z.string().optional().default(""),
    PAYMONGO_PUBLIC_KEY: z.string().optional().default(""),
    PAYMONGO_WEBHOOK_SECRET_KEY: z.string().optional().default(""),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_AWS_REGION: z.string().min(1).default("ap-southeast-1"),
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: z.string().min(1).default("ap-southeast-1_local"),
    NEXT_PUBLIC_COGNITO_CLIENT_ID: z.string().min(1).default("mock-cognito-client-id"),
    NEXT_PUBLIC_COGNITO_DOMAIN: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).default("1x00000000000000000000AA"),
    NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY: z.string().optional().default(""),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY ?? process.env.PAYMONGO_PUBLIC_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
});
