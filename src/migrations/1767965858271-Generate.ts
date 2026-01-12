import { MigrationInterface, QueryRunner } from 'typeorm';

export class Generate1767965858271 implements MigrationInterface {
  name = 'Generate1767965858271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );
  }

  public async down(): Promise<void> {}
}
