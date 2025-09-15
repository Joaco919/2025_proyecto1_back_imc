import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rutas utilizando autenticación JWT
 * Hereda de AuthGuard y utiliza la estrategia 'jwt'
 * Se puede usar como decorator @UseGuards(JwtAuthGuard) en controladores o métodos
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
