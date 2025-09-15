import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Servicio de autenticación que maneja registro, login y validación de usuarios
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   * Verifica que el email no esté ya registrado y hashea la contraseña
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Verifica si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashea la contraseña antes de guardarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crea el nuevo usuario
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    const savedUser = await this.userRepository.save(user);

    // Genera el token JWT
    const payload = { email: savedUser.email, sub: savedUser.id };
    const access_token = this.jwtService.sign(payload);

    // Retorna el usuario sin la contraseña y el token
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  /**
   * Autentica un usuario existente
   * Verifica email y contraseña, retorna JWT si es válido
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Busca el usuario por email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verifica la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Genera el token JWT
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    // Retorna el usuario sin la contraseña y el token
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  /**
   * Valida un usuario por ID (usado por la estrategia JWT)
   */
  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }
}
