import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { ImcModule } from './module/imc/imc.module';
import { AppController } from './app.controller';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      // Render requiere TLS. Controlable por DB_SSL (ver .env.example)
      ssl: (() => {
        const v = String(process.env.DB_SSL || 'true').toLowerCase();
        if (['false', '0', 'off', 'disable', 'disabled'].includes(v)) return false;
        if (v === 'strict') return { rejectUnauthorized: true };
        return { rejectUnauthorized: false };
      })(),
    }),
    ImcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}