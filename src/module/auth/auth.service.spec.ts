import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      const savedUser = {
        id: 1,
        ...registerDto,
        password: hashedPassword,
        imcCalculations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          imcCalculations: savedUser.imcCalculations,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
        access_token: 'test-token',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(savedUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = { id: 1, email: registerDto.email };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully and return access token', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashedPassword',
        nombre: 'Test User',
      };
      const accessToken = 'jwt-token';

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
        },
        access_token: accessToken,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashedPassword',
        nombre: 'Test User',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user data if validation is successful', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        nombre: 'Test User',
        password: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser(user.id);

      // validateUser devuelve el usuario completo incluyendo password
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        password: user.password,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(999);

      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });
});
