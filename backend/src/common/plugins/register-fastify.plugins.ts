import { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function registerFastifyPlugins(app: NestFastifyApplication) {
  // CORS is now handled in main.ts, so we remove it from here

  await app.register(require('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(require('@fastify/helmet'), {
    crossOriginResourcePolicy: true,
    contentSecurityPolicy: false,
    referrerPolicy: {
      policy: 'same-origin',
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true, // Optional: Include subdomains
      preload: true, // Optional: Indicate to browsers to preload HSTS
    },
    frameguard: {
      action: 'deny',
    },
  });
}
