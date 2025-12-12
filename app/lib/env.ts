export const requiredEnvVars = [
] as const;

export type RequiredEnvVar = typeof requiredEnvVars[number];

export function validateEnvVars() {
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
} 