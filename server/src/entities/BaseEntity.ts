/**
 * Base Entity Abstract Class
 * * An abstract database model that serves as the foundation for all application entities.
 * By extending TypeORM's `BaseEntity`, it enables the Active Record pattern across the 
 * data layer, providing built-in utility methods like `.save()`, `.find()`, and `.delete()`.
 * * Shared Fields:
 * - id        (UUID)        — Primary key uniquely identifying each record (v4 UUID)
 * - createdAt (TIMESTAMPTZ) — Immutable timestamp captured automatically upon record insertion
 * - updatedAt (TIMESTAMPTZ) — Mutable timestamp updated automatically whenever a row is modified
 */

import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt!: Date;
}