import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalcularImcDto } from "./dto/calcular-imc-dto";
import { ImcCalculation } from './entities/imc-calculation.entity';


@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcCalculation)
    private readonly imcRepo: Repository<ImcCalculation>,
  ) {}

  async calcularImc(data: CalcularImcDto): Promise<{ imc: number; categoria: string }> {
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

    // Persistir el cálculo
    await this.imcRepo.save(
      this.imcRepo.create({ altura, peso, imc: imcRedondeado, categoria }),
    );

    return { imc: imcRedondeado, categoria };
  }

  async historial(limit = 20): Promise<ImcCalculation[]> {
    return this.imcRepo.find({ order: { createdAt: 'DESC' }, take: limit });
  }
}

