import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * DTO para el registro de nuevos usuarios
 * Valida que el email sea válido y la contraseña tenga al menos 6 caracteres
 */
export class RegisterDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;
}
