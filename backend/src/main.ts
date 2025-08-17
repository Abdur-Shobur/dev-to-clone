import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { config } from 'dotenv';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { registerFastifyPlugins } from './common/plugins/register-fastify.plugins';
import { configureAuthSwaggerDocs } from './helpers/configure-auth-swagger-docs.helper';
import { configureSwaggerDocs } from './helpers/configure-swagger-docs.helper';
import { formatValidationErrors } from './helpers/validation-error-formatter.helper';
import { validateSchemaEnv } from './helpers/validation-schema-env';

// Load environment variables
config();

// Validate environment schema
validateSchemaEnv(process.env);

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { bufferLogs: true },
  );

  // Register Fastify plugins (includes CORS)
  registerFastifyPlugins(app);

  // Configure Swagger documentation
  configureAuthSwaggerDocs(app);
  configureSwaggerDocs(app);

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Configure global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = formatValidationErrors(errors);
        return new BadRequestException({
          error: formattedErrors,
          message: 'Validation error',
          statusCode: 400,
        });
      },
    }),
  );

  const port = process.env.PORT || process.env.SERVER_PORT || 3000;

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Start the application
  await app.listen(port, '0.0.0.0');

  Logger.debug(`🚀 Server running on port ${port}`, 'Bootstrap');

  if (process.env.NODE_ENV !== 'production') {
    Logger.debug(`📍 Application URL: ${await app.getUrl()}`, 'Environment');
    Logger.debug(
      `📚 Swagger Documentation: ${await app.getUrl()}/docs`,
      'Swagger',
    );
    Logger.debug(
      `🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Not configured'}`,
      'Database',
    );
  }
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error, 'Bootstrap');
  process.exit(1);
});
