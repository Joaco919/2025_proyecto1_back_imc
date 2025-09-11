import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcService } from './imc.service';
import { ImcController } from './imc.controller';
import { ImcCalculation } from './entities/imc-calculation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImcCalculation])],
  controllers: [ImcController],
  providers: [ImcService],
})
export class ImcModule {}
