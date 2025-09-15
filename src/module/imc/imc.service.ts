import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   */
  async historial(user: User, limit = 20): Promise<ImcCalculation[]> {
    return this.imcRepo.find({ 
      where: { userId: user.id }, // Solo cálculos del usuario autenticado
      order: { createdAt: 'DESC' }, 
      take: limit 
    });
  }
}

