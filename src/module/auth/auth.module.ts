import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Módulo de autenticación que configura JWT, Passport y las dependencias necesarias
 */
@Module({
  imports: [
    ConfigModule.forRoot(), // Para acceder a variables de entorno
    TypeOrmModule.forFeature([User]), // Registra la entidad User
    PassportModule, // Para usar strategies de autenticación
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Clave secreta para firmar tokens
      signOptions: { expiresIn: '24h' }, // Tokens expiran en 24 horas
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Exporta el servicio para usar en otros módulos
})
export class AuthModule {}
