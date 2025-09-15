import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración de CORS para permitir conexión con el frontend
  app.enableCors({
    origin: [
      'http://localhost:3000', // Para desarrollo local del frontend
      /^https:\/\/.*\.vercel\.app$/, // Para frontend desplegado en Vercel
      // Agregar aquí la URL específica de tu frontend si es necesario
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Permite cookies y headers de autenticación
  });
  
  // Configuración global de validación
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true, // Transforma los tipos automáticamente
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API running on port ${port}`);
  console.log(`📚 Endpoints disponibles:`);
  console.log(`   POST /auth/register - Registro de usuarios`);
  console.log(`   POST /auth/login - Login de usuarios`);
  console.log(`   GET  /auth/profile - Perfil del usuario (requiere JWT)`);
  console.log(`   POST /imc/calcular - Calcular IMC (requiere JWT)`);
  console.log(`   GET  /imc/historial - Historial de cálculos (requiere JWT)`);
}
bootstrap();
