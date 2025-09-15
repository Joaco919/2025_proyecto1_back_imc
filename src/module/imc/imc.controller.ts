import { Controller, Post, Body, ValidationPipe, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';


/**
 * Controlador de cálculos IMC - ahora requiere autenticación
 * Todos los endpoints están protegidos y asociados al usuario autenticado
 */
@Controller('imc')
@UseGuards(JwtAuthGuard) // Protege todos los endpoints del controlador
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  /**
   * Calcula el IMC para el usuario autenticado
   * POST /imc/calcular
   * Requiere token JWT válido
   */
  @Post('calcular')
  calcular(
    @Body(ValidationPipe) data: CalcularImcDto,
    @CurrentUser() user: User
  ) {
    return this.imcService.calcularImc(data, user);
  }

  /**
   * Obtiene el historial de cálculos del usuario autenticado
   * GET /imc/historial?limit=20
   * Requiere token JWT válido
   */
  @Get('historial')
  historial(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @CurrentUser() user: User
  ) {
    return this.imcService.historial(user, limit);
  }
}
