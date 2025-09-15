import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

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

  // Relación muchos a uno: múltiples cálculos pueden pertenecer a un usuario
  @ManyToOne(() => User, (user) => user.imcCalculations, {
    onDelete: 'CASCADE', // Si se elimina el usuario, se eliminan sus cálculos
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ID del usuario propietario del cálculo
  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

