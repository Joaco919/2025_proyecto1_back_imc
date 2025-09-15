import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migración para crear la tabla de usuarios y actualizar la tabla de cálculos IMC
 * - Crea la tabla 'users' con campos email, password, name y timestamps
 * - Agrega la columna user_id a la tabla 'imc_calculations' para establecer la relación
 * - Crea índices y claves foráneas necesarias
 */
export class CreateUserAndUpdateImcCalculations1734220800000 implements MigrationInterface {
    name = 'CreateUserAndUpdateImcCalculations1734220800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla users
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL, 
                "email" character varying(255) NOT NULL, 
                "password" character varying(255) NOT NULL, 
                "name" character varying(100), 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Agregar columna user_id a imc_calculations
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" 
            ADD "user_id" integer NOT NULL DEFAULT 1
        `);

        // Crear índice para user_id
        await queryRunner.query(`
            CREATE INDEX "IDX_user_id_imc_calculations" ON "imc_calculations" ("user_id")
        `);

        // Crear clave foránea
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" 
            ADD CONSTRAINT "FK_imc_calculations_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        // Insertar usuario por defecto para mantener integridad referencial
        await queryRunner.query(`
            INSERT INTO "users" ("email", "password", "name") 
            VALUES ('default@example.com', '$2b$10$example.hash.for.default.user', 'Usuario por defecto')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar clave foránea
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" 
            DROP CONSTRAINT "FK_imc_calculations_user_id"
        `);

        // Eliminar índice
        await queryRunner.query(`
            DROP INDEX "IDX_user_id_imc_calculations"
        `);

        // Eliminar columna user_id
        await queryRunner.query(`
            ALTER TABLE "imc_calculations" 
            DROP COLUMN "user_id"
        `);

        // Eliminar tabla users
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }
}
