import { Test, TestingModule } from '@nestjs/testing';
import { ImcController } from './imc.controller';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { User } from '../user/entities/user.entity';

describe('ImcController', () => {
  let controller: ImcController;
  let service: ImcService;

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
      controllers: [ImcController],
      providers: [
        {
          provide: ImcService,
          useValue: {
            calcularImc: jest.fn(),
            historial: jest.fn(),
            estadisticas: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImcController>(ImcController);
    service = module.get<ImcService>(ImcService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return IMC and category for valid input', async () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
    jest
      .spyOn(service, 'calcularImc')
      .mockResolvedValue({ imc: 22.86, categoria: 'Normal' });

    const result = await controller.calcular(dto, mockUser);
    expect(result).toEqual({ imc: 22.86, categoria: 'Normal' });
    expect(service.calcularImc).toHaveBeenCalledWith(dto, mockUser);
  });

  it('should call historial service method', async () => {
    const mockHistorial = [
      {
        id: 1,
        altura: 1.75,
        peso: 70,
        imc: 22.86,
        categoria: 'Normal',
        userId: 1,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    jest.spyOn(service, 'historial').mockResolvedValue(mockHistorial);

    const result = await controller.historial(
      mockUser,
      20,
      '2023-01-01',
      '2023-12-31',
    );
    expect(result).toEqual(mockHistorial);
    expect(service.historial).toHaveBeenCalledWith(
      mockUser,
      20,
      '2023-01-01',
      '2023-12-31',
    );
  });

  it('should call estadisticas service method', async () => {
    const mockEstadisticas = {
      resumen: {
        totalCalculos: 5,
        promedioImc: 23.5,
        promedioPeso: 70.5,
        minImc: 20.0,
        maxImc: 27.0,
        desviacionImc: 2.5,
        variacionImc: 0.5,
        variacionPeso: 1.0,
      },
      categorias: [],
      evolucionTemporal: [],
    };

    jest.spyOn(service, 'estadisticas').mockResolvedValue(mockEstadisticas);

    const result = await controller.estadisticas(
      mockUser,
      '2023-01-01',
      '2023-12-31',
    );
    expect(result).toEqual(mockEstadisticas);
    expect(service.estadisticas).toHaveBeenCalledWith(
      mockUser,
      '2023-01-01',
      '2023-12-31',
    );
  });

  it('should throw BadRequestException for invalid input', async () => {
    const invalidDto: CalcularImcDto = { altura: -1, peso: 70 };

    // Aplicar ValidationPipe manualmente en la prueba
    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    await expect(
      validationPipe.transform(invalidDto, {
        type: 'body',
        metatype: CalcularImcDto,
      }),
    ).rejects.toThrow(BadRequestException);

    // Verificar que el servicio no se llama porque la validación falla antes
    expect(service.calcularImc).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid input', async () => {
    const invalidDto: CalcularImcDto = { altura: -1, peso: -30 };

    // Aplicar ValidationPipe manualmente en la prueba
    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    await expect(
      validationPipe.transform(invalidDto, {
        type: 'body',
        metatype: CalcularImcDto,
      }),
    ).rejects.toThrow(BadRequestException);

    // Verificar que el servicio no se llama porque la validación falla antes
    expect(service.calcularImc).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid input', async () => {
    const invalidDto: CalcularImcDto = { altura: 2, peso: -30 };

    // Aplicar ValidationPipe manualmente en la prueba
    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    await expect(
      validationPipe.transform(invalidDto, {
        type: 'body',
        metatype: CalcularImcDto,
      }),
    ).rejects.toThrow(BadRequestException);

    // Verificar que el servicio no se llama porque la validación falla antes
    expect(service.calcularImc).not.toHaveBeenCalled();
  });
});
