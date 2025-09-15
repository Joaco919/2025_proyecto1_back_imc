import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * Estrategia JWT para validar tokens de autenticación
 * Se ejecuta automáticamente cuando se usa el guard JwtAuthGuard
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      // Extrae el JWT del header Authorization como Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // La clave secreta debe ser la misma que se usa para firmar los tokens
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  /**
   * Valida el payload del JWT y retorna el usuario
   * Este método se ejecuta después de que el token sea verificado
   */
  async validate(payload: any) {
    const { sub: userId } = payload;
    
    // Busca el usuario en la base de datos
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // El usuario se inyectará en el request como req.user
    return user;
  }
}
