import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, useDefaults: true });

const schema = {
  type: 'object',
  properties: {
    // Database
    DATABASE_URL: { type: 'string' },

    // Server
    PORT: { type: 'string', default: '3000' },
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'production', 'test'],
      default: 'development',
    },

    // JWT
    JWT_SECRET: { type: 'string' },
    JWT_EXPIRES_IN: { type: 'string', default: '7d' },
    JWT_REFRESH_SECRET: { type: 'string' },
    JWT_REFRESH_EXPIRES_IN: { type: 'string', default: '30d' },

    // Mailer (optional)
    MAILER_HOST: { type: 'string' },
    MAILER_PORT: { type: 'string' },
    MAILER_USER: { type: 'string' },
    MAILER_PASS: { type: 'string' },
  },
  required: ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'],
};

const validate = ajv.compile(schema);

interface EnvVariables {
  // Database
  DATABASE_URL: string;

  // Server
  PORT: string;
  NODE_ENV: 'development' | 'production' | 'test';

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Mailer (optional)
  MAILER_HOST?: string;
  MAILER_PORT?: string;
  MAILER_USER?: string;
  MAILER_PASS?: string;
}

export const validateSchemaEnv = (env: unknown) => {
  const valid = validate(env);
  if (!valid) {
    const errorMessages =
      validate.errors
        ?.map(
          (err: { instancePath?: string; message?: string }) =>
            `- ${err.instancePath || ''} ${err.message || 'Unknown error'}`,
        )
        .join('\n') ?? 'Unknown error';
    console.error(`Environment validation error: \n${errorMessages}`);
    throw new Error(`Environment validation failed: \n${errorMessages}`);
  }
  return env as EnvVariables;
};
