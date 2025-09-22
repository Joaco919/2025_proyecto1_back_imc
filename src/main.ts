import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend local o usando la variable FRONTEND_URL
  // const frontendUrl = 'http://localhost:5173';
  const frontendUrl = 'https://2025-proyecto1-front-imc-sepia.vercel.app';
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Nest application listening on port ${port}`);
}
bootstrap();
