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
      // Si se proporcionan ambas fechas, usar Between para un rango completo
      const startDate = new Date(fechaInicio + 'T00:00:00.000Z');
      const endDate = new Date(fechaFin + 'T23:59:59.999Z');
      
      // Usar query builder para una consulta más precisa con ambas condiciones
      return this.imcRepo
        .createQueryBuilder('imc')
        .where('imc.userId = :userId', { userId: user.id })
        .andWhere('imc.createdAt >= :startDate', { startDate })
        .andWhere('imc.createdAt <= :endDate', { endDate })
        .orderBy('imc.createdAt', 'DESC')
        .limit(limit)
        .getMany();
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

  /**
   * Obtiene estadísticas agregadas de IMC para un usuario específico
   * @param user - Usuario del cual obtener las estadísticas
   * @param fechaInicio - Fecha de inicio para filtrar (formato YYYY-MM-DD)
   * @param fechaFin - Fecha de fin para filtrar (formato YYYY-MM-DD)
   */
  async estadisticas(user: User, fechaInicio?: string, fechaFin?: string) {
    let query = this.imcRepo
      .createQueryBuilder('imc')
      .where('imc.userId = :userId', { userId: user.id });

    // Aplicar filtros de fecha si se proporcionan
    if (fechaInicio) {
      const startDate = new Date(fechaInicio + 'T00:00:00.000Z');
      query = query.andWhere('imc.createdAt >= :startDate', { startDate });
    }
    if (fechaFin) {
      const endDate = new Date(fechaFin + 'T23:59:59.999Z');
      query = query.andWhere('imc.createdAt <= :endDate', { endDate });
    }

    // Obtener datos para el gráfico temporal (últimos 30 registros ordenados por fecha)
    const datosTemporales = await query
      .clone()
      .orderBy('imc.createdAt', 'ASC')
      .limit(30)
      .getMany();

    // Calcular estadísticas agregadas
    const estadisticasGenerales = await query
      .clone()
      .select([
        'COUNT(*) as total_calculos',
        'AVG(imc.imc) as promedio_imc',
        'AVG(imc.peso) as promedio_peso',
        'MIN(imc.imc) as min_imc',
        'MAX(imc.imc) as max_imc',
        'STDDEV(imc.imc) as desviacion_imc'
      ])
      .getRawOne();

    // Verificar si hay datos
    if (!estadisticasGenerales || Number(estadisticasGenerales.total_calculos) === 0) {
      return {
        resumen: {
          totalCalculos: 0,
          promedioImc: 0,
          promedioPeso: 0,
          minImc: 0,
          maxImc: 0,
          desviacionImc: 0,
          variacionImc: 0,
          variacionPeso: 0
        },
        categorias: [],
        evolucionTemporal: []
      };
    }

    // Conteo por categorías (raw) -> normalizamos para garantizar el campo 'categoria'
    const categoriasRaw = await query
      .clone()
      .select(['imc.categoria', 'COUNT(*) as cantidad'])
      .groupBy('imc.categoria')
      .getRawMany();

  // Calcular variación tomando último vs penúltimo registro
    // Traemos los dos últimos registros ordenados por fecha descendente
    const ultimos = await query.clone().orderBy('imc.createdAt', 'DESC').limit(2).getMany();

    let variacionImc = 0;
    let variacionPeso = 0;

    if (ultimos && ultimos.length >= 2) {
      // ultimos[0] es el más reciente, ultimos[1] es el penúltimo
      const reciente = ultimos[0];
      const penultimo = ultimos[1];

      // Aseguramos que imc/peso sean numbers antes de operar
  const imcReciente = typeof reciente.imc === 'number' ? reciente.imc : Number(reciente.imc);
      const imcPenultimo = typeof penultimo.imc === 'number' ? penultimo.imc : Number(penultimo.imc);

  const pesoReciente = typeof reciente.peso === 'number' ? reciente.peso : Number(reciente.peso);
      const pesoPenultimo = typeof penultimo.peso === 'number' ? penultimo.peso : Number(penultimo.peso);

      if (Number.isFinite(imcReciente) && Number.isFinite(imcPenultimo)) {
        variacionImc = Number((imcReciente - imcPenultimo).toFixed(2));
      }

      if (Number.isFinite(pesoReciente) && Number.isFinite(pesoPenultimo)) {
        variacionPeso = Number((pesoReciente - pesoPenultimo).toFixed(2));
      }
    }

    // Helper para encontrar la clave que contiene el nombre de la categoría
    const findCategoryKey = (obj: Record<string, unknown>) => {
      const keys = Object.keys(obj);
      return (
        keys.find((k) => k.toLowerCase().includes('categoria')) ??
        keys.find((k) => !k.toLowerCase().includes('cantidad') && !k.toLowerCase().includes('count')) ??
        keys[0]
      );
    };

    const stats: any = estadisticasGenerales;

    return {
      resumen: {
        totalCalculos: Number(stats.total_calculos),
        promedioImc: Number(Number(stats.promedio_imc).toFixed(2)),
        promedioPeso: Number(Number(stats.promedio_peso).toFixed(2)),
        minImc: Number(Number(stats.min_imc).toFixed(2)),
        maxImc: Number(Number(stats.max_imc).toFixed(2)),
        desviacionImc: Number(Number(stats.desviacion_imc || 0).toFixed(2)),
        variacionImc,
        variacionPeso,
      },
      categorias: categoriasRaw.map((cat: unknown) => {
        const catRecord = cat as Record<string, unknown>;
        const nameKey = String(findCategoryKey(catRecord) ?? '');
        const cantidadRaw = (catRecord['cantidad'] ?? catRecord['count'] ?? catRecord['COUNT(*)'] ?? 0) as number;
        const cantidad = Number(cantidadRaw);
        const total = Number(stats.total_calculos) || 1;
        const porcentaje = Number(((cantidad / total) * 100).toFixed(1));
        return {
          categoria: String(catRecord[nameKey] ?? ''),
          cantidad,
          porcentaje,
        };
      }),
      evolucionTemporal: datosTemporales.map((calc) => ({
        fecha: calc.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
        imc: Number(Number(calc.imc).toFixed(2)),
        peso: Number(Number(calc.peso).toFixed(2)),
        altura: Number(Number(calc.altura).toFixed(2)),
        categoria: calc.categoria,
      }))
    };
  }
}

