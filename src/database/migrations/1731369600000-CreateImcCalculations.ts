import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImcCalculations1731369600000 implements MigrationInterface {
  name = 'CreateImcCalculations1731369600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "imc_calculations" (
        "id" SERIAL NOT NULL,
        "altura" double precision NOT NULL,
        "peso" double precision NOT NULL,
        "imc" double precision NOT NULL,
        "categoria" character varying(32) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_imc_calculations_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "imc_calculations"');
  }
}

