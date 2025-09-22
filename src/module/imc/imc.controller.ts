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
   * GET /imc/historial?limit=20&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
   * Requiere token JWT válido
   */
  @Get('historial')
  historial(
    @CurrentUser() user: User,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string
  ) {
    return this.imcService.historial(user, limit, fechaInicio, fechaFin);
  }

  /**
   * Obtiene estadísticas agregadas del usuario autenticado
   * GET /imc/estadisticas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
   * Requiere token JWT válido
   */
  @Get('estadisticas')
  estadisticas(
    @CurrentUser() user: User,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string
  ) {
    return this.imcService.estadisticas(user, fechaInicio, fechaFin);
  }
}
