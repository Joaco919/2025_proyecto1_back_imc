import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ImcCalculation } from '../../imc/entities/imc-calculation.entity';

/**
 * Entidad User que representa los usuarios del sistema
 * Cada usuario puede tener múltiples cálculos de IMC asociados
 */
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // Email único del usuario (se usará para el login)
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // Hash de la contraseña (nunca se almacena la contraseña en texto plano)
  @Column({ type: 'varchar', length: 255 })
  password: string;

  // Nombre del usuario (opcional)
  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string;

  // Relación uno a muchos: un usuario puede tener múltiples cálculos de IMC
  @OneToMany(() => ImcCalculation, (calculation) => calculation.user, {
    cascade: true, // Permite crear cálculos cuando se crea un usuario
  })
  imcCalculations: ImcCalculation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
