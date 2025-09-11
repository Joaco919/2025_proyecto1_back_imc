import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'imc_calculations' })
export class ImcCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  // Altura en metros
  @Column({ type: 'double precision' })
  altura: number;

  // Peso en kilogramos
  @Column({ type: 'double precision' })
  peso: number;

  // Índice de masa corporal
  @Column({ type: 'double precision' })
  imc: number;

  // Categoría calculada (Bajo peso, Normal, Sobrepeso, Obeso)
  @Column({ type: 'varchar', length: 32 })
  categoria: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

