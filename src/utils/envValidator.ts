// src/utils/envValidator.ts
export function validateEnv(): void {
  const requiredEnvVars = ['MONGODB_URI'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}