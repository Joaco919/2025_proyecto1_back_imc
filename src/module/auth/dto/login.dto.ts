import { IsEmail, IsString } from 'class-validator';

/**
 * DTO para el login de usuarios existentes
 * Valida el formato del email y que la contraseña sea un string
 */
export class LoginDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString({ message: 'La contraseña es requerida' })
  password: string;
}
