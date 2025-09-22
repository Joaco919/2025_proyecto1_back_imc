import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImcService } from "./imc.service";
import { CalcularImcDto } from "./dto/calcular-imc-dto";
import { ImcCalculation } from './entities/imc-calculation.entity';
import { User } from '../user/entities/user.entity';

describe('ImcService', () => {
  let service: ImcService;
  let imcRepository: Repository<ImcCalculation>;

  const mockImcRepository = {
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    imcCalculations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImcService,
        {
          provide: getRepositoryToken(ImcCalculation),
          useValue: mockImcRepository,
        },
      ],
    }).compile();

    service = module.get<ImcService>(ImcService);
    imcRepository = module.get<Repository<ImcCalculation>>(getRepositoryToken(ImcCalculation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calcularImc', () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 70 };

    it('should calculate IMC correctly and save to database', async () => {
      const expectedCalc = {
        altura: 1.75,
        peso: 70,
        imc: 22.86,
        categoria: 'Normal',
        userId: 1,
      };

      mockImcRepository.create.mockReturnValue(expectedCalc);
      mockImcRepository.save.mockResolvedValue(expectedCalc);

      const result = await service.calcularImc(dto, mockUser);

      expect(result.imc).toBe(22.86);
      expect(result.categoria).toBe('Normal');
      expect(mockImcRepository.create).toHaveBeenCalledWith(expectedCalc);
      expect(mockImcRepository.save).toHaveBeenCalled();
    });

    it('should return Bajo peso for IMC < 18.5', async () => {
      const lowWeightDto: CalcularImcDto = { altura: 1.75, peso: 50 };
      const expectedCalc = {
        altura: 1.75,
        peso: 50,
        imc: 16.33,
        categoria: 'Bajo peso',
        userId: 1,
      };

      mockImcRepository.create.mockReturnValue(expectedCalc);
      mockImcRepository.save.mockResolvedValue(expectedCalc);

      const result = await service.calcularImc(lowWeightDto, mockUser);

      expect(result.imc).toBe(16.33);
      expect(result.categoria).toBe('Bajo peso');
    });

    it('should return Sobrepeso for 25 <= IMC < 30', async () => {
      const overweightDto: CalcularImcDto = { altura: 1.75, peso: 80 };
      const expectedCalc = {
        altura: 1.75,
        peso: 80,
        imc: 26.12,
        categoria: 'Sobrepeso',
        userId: 1,
      };

      mockImcRepository.create.mockReturnValue(expectedCalc);
      mockImcRepository.save.mockResolvedValue(expectedCalc);

      const result = await service.calcularImc(overweightDto, mockUser);

      expect(result.imc).toBe(26.12);
      expect(result.categoria).toBe('Sobrepeso');
    });

    it('should return Obeso for IMC >= 30', async () => {
      const obeseDto: CalcularImcDto = { altura: 1.75, peso: 100 };
      const expectedCalc = {
        altura: 1.75,
        peso: 100,
        imc: 32.65,
        categoria: 'Obeso',
        userId: 1,
      };

      mockImcRepository.create.mockReturnValue(expectedCalc);
      mockImcRepository.save.mockResolvedValue(expectedCalc);

      const result = await service.calcularImc(obeseDto, mockUser);

      expect(result.imc).toBe(32.65);
      expect(result.categoria).toBe('Obeso');
    });
  });

  describe('historial', () => {
    const mockCalculations = [
      {
        id: 1,
        altura: 1.75,
        peso: 70,
        imc: 22.86,
        categoria: 'Normal',
        userId: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        altura: 1.75,
        peso: 72,
        imc: 23.51,
        categoria: 'Normal',
        userId: 1,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      },
    ];

    it('should return user history without date filters', async () => {
      mockImcRepository.find.mockResolvedValue(mockCalculations);

      const result = await service.historial(mockUser);

      expect(result).toEqual(mockCalculations);
      expect(mockImcRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
        take: 20,
      });
    });

    it('should return user history with date range filter', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCalculations),
      };

      mockImcRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.historial(mockUser, 20, '2023-01-01', '2023-01-31');

      expect(result).toEqual(mockCalculations);
      expect(mockImcRepository.createQueryBuilder).toHaveBeenCalledWith('imc');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('imc.userId = :userId', { userId: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });

    it('should handle custom limit', async () => {
      mockImcRepository.find.mockResolvedValue(mockCalculations.slice(0, 1));

      const result = await service.historial(mockUser, 1);

      expect(result).toHaveLength(1);
      expect(mockImcRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
        take: 1,
      });
    });
  });

  describe('estadisticas', () => {
    it('should return statistics with data', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      };

      mockImcRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock estadísticas generales
      mockQueryBuilder.getRawOne.mockResolvedValue({
        total_calculos: '5',
        promedio_imc: '23.5',
        promedio_peso: '70.5',
        min_imc: '20.0',
        max_imc: '27.0',
        desviacion_imc: '2.5',
      });

      // Mock categorías
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { categoria: 'Normal', cantidad: 3 },
        { categoria: 'Sobrepeso', cantidad: 2 },
      ]);

      // Mock datos temporales
      mockQueryBuilder.getMany
        .mockResolvedValueOnce([
          {
            createdAt: new Date('2023-01-01'),
            imc: 22.86,
            peso: 70,
            altura: 1.75,
            categoria: 'Normal',
          },
        ])
        .mockResolvedValueOnce([
          {
            imc: 23.0,
            peso: 71,
            createdAt: new Date('2023-01-02'),
          },
          {
            imc: 22.5,
            peso: 70,
            createdAt: new Date('2023-01-01'),
          },
        ]);

      const result = await service.estadisticas(mockUser);

      expect(result.resumen.totalCalculos).toBe(5);
      expect(result.resumen.promedioImc).toBe(23.5);
      expect(result.categorias).toHaveLength(2);
      expect(result.evolucionTemporal).toHaveLength(1);
    });

    it('should return empty statistics when no data', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({ total_calculos: '0' }),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockImcRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.estadisticas(mockUser);

      expect(result.resumen.totalCalculos).toBe(0);
      expect(result.resumen.promedioImc).toBe(0);
      expect(result.categorias).toHaveLength(0);
      expect(result.evolucionTemporal).toHaveLength(0);
    });
  });
});