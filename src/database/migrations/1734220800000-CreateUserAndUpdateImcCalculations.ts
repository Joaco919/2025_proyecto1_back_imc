import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndUpdateImcCalculations1734220800000 implements MigrationInterface {
    name = 'CreateUserAndUpdateImcCalculations1734220800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1) Crear tabla users
        await queryRunner.query(`
            CREATE TABLE "users"(
                "id" SERIAL NOT NULL,
                "email" varchar(255) NOT NULL,
                "password" varchar(255) NOT NULL,
                "name" varchar(100),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY("id")
            )
        `);

        // 2) Insertar usuario por defecto
        await queryRunner.query(`
            INSERT INTO "users"("id", "email", "password", "name")
            VALUES(1, 'default@example.com', '$2b$10$example.hash.for.default.user', 'Usuario por defecto')
            ON CONFLICT("id") DO NOTHING
        `);
        
        // 3) Agregar columna user_id a imc_calculations
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" ADD "user_id" integer NOT NULL DEFAULT 1
        `);

        // 4) Crear índice
        await queryRunner.query(`
            CREATE INDEX "IDX_user_id_imc_calculations" ON "imc_calculations"("user_id")
        `);

        // 5) Agregar foreign key
        await queryRunner.query(`
            ALTER TABLE "imc_calculations"
            ADD CONSTRAINT "FK_imc_calculations_user_id"
            FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        // 6) Remover DEFAULT para futuros inserts
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" ALTER COLUMN "user_id" DROP DEFAULT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" DROP CONSTRAINT "FK_imc_calculations_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_user_id_imc_calculations"
        `);
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }
}