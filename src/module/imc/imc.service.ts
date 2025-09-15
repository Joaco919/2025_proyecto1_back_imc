import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CalcularImcDto } from "./dto/calcular-imc-dto";
import { ImcCalculation } from './entities/imc-calculation.entity';
import { User } from '../user/entities/user.entity';


@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcCalculation)
    private readonly imcRepo: Repository<ImcCalculation>,
  ) {}

  /**
   * Calcula el IMC para un usuario específico y guarda el resultado
   * @param data - Datos de altura y peso
   * @param user - Usuario que realiza el cálculo
   */
  async calcularImc(data: CalcularImcDto, user: User): Promise<{ imc: number; categoria: string }> {
    const { altura, peso } = data;
    const imc = peso / (altura * altura);
    const imcRedondeado = Math.round(imc * 100) / 100; // Dos decimales

    let categoria: string;
    if (imc < 18.5) {
      categoria = 'Bajo peso';
    } else if (imc < 25) {
      categoria = 'Normal';
    } else if (imc < 30) {
      categoria = 'Sobrepeso';
    } else {
      categoria = 'Obeso';
    }

    // Persistir el cálculo asociado al usuario
    await this.imcRepo.save(
      this.imcRepo.create({ 
        altura, 
        peso, 
        imc: imcRedondeado, 
        categoria,
        userId: user.id // Asocia el cálculo al usuario autenticado
      }),
    );

    return { imc: imcRedondeado, categoria };
  }

  /**
   * Obtiene el historial de cálculos IMC de un usuario específico
   * @param user - Usuario del cual obtener el historial
   * @param limit - Límite de resultados a retornar
   * @param fechaInicio - Fecha de inicio para filtrar (formato YYYY-MM-DD)
   * @param fechaFin - Fecha de fin para filtrar (formato YYYY-MM-DD)
   */
  async historial(user: User, limit = 20, fechaInicio?: string, fechaFin?: string): Promise<ImcCalculation[]> {
    const whereConditions: any = { userId: user.id };
    
    // Agregar filtros de fecha si se proporcionan
    if (fechaInicio && fechaFin) {
      // Si se proporcionan ambas fechas
      const startDate = new Date(fechaInicio + 'T00:00:00.000Z');
      const endDate = new Date(fechaFin + 'T23:59:59.999Z');
      whereConditions.createdAt = MoreThanOrEqual(startDate);
      
      return this.imcRepo.find({ 
        where: [
          { ...whereConditions, createdAt: MoreThanOrEqual(startDate) },
        ],
        order: { createdAt: 'DESC' }, 
        take: limit 
      }).then(results => 
        results.filter(item => 
          new Date(item.createdAt) >= startDate && 
          new Date(item.createdAt) <= endDate
        )
      );
    } else if (fechaInicio) {
      // Solo fecha de inicio
      const startDate = new Date(fechaInicio + 'T00:00:00.000Z');
      whereConditions.createdAt = MoreThanOrEqual(startDate);
    } else if (fechaFin) {
      // Solo fecha de fin
      const endDate = new Date(fechaFin + 'T23:59:59.999Z');
      whereConditions.createdAt = LessThanOrEqual(endDate);
    }
    
    return this.imcRepo.find({ 
      where: whereConditions,
      order: { createdAt: 'DESC' }, 
      take: limit 
    });
  }
}

