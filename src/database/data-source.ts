import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ImcCalculation } from '../module/imc/entities/imc-calculation.entity';
import { User } from '../module/user/entities/user.entity';

// Carga .env solo si no hay DATABASE_URL definida y si dotenv está instalado.
(() => {
  if (!process.env.DATABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('dotenv').config();
    } catch (_) {
      // Ignorar si dotenv no está instalado (Render no lo necesita)
    }
  }
})();

const ssl = (() => {
  const v = String(process.env.DB_SSL || 'true').toLowerCase();
  if (['false', '0', 'off', 'disable', 'disabled'].includes(v)) return false;
  if (v === 'strict') return { rejectUnauthorized: true };
  return { rejectUnauthorized: false };
})();

const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl,
  entities: [ImcCalculation, User],
  migrations: [isProd ? 'dist/database/migrations/*.js' : 'src/database/migrations/*.ts'],
  synchronize: false,
});
