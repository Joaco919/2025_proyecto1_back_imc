import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserSequence1734220900000 implements MigrationInterface {
    name = 'FixUserSequence1734220900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajustar la secuencia de IDs para que el próximo sea después del máximo existente
        await queryRunner.query(`
            SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No hay necesidad de revertir esto
    }
}
