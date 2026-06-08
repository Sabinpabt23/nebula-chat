/**
 * Generic Base Repository
 * * @module repositories/BaseRepository
 * * @description
 * An abstract architectural layer wraps TypeORM's native Repository pattern.
 * It enforces a unified, reusable Data Access Object (DAO) pattern across all domain 
 * models, consolidating common CRUD operations and eliminating boilerplate data access logic.
 * * Architectural Advantages:
 * 1. Strong Typing         — Leverages TypeScript generics bound strictly to subclasses of {@link BaseEntity}.
 * 2. Standardized Failure  — Automates missing resource tracking by incorporating domain-specific exceptions directly into queries.
 * 3. Dynamic Meta-scoping  — Utilizes structural TypeORM metadata parameters (`this.repository.metadata.name`) to dynamically formulate precise exception contexts.
 */

import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import { BaseEntity } from '../entities/BaseEntity';
import { NotFoundException } from '../exceptions/index';

export abstract class BaseRepository<T extends BaseEntity> {
    /**
     * Initializes the concrete implementation instance.
     * @param {Repository<T>} repository - The native TypeORM repository instance for entity mapping.
     */
    protected constructor(protected readonly repository: Repository<T>) {}

    /**
     * Retrieves a single entity entry by its unique UUID string identifier.
     * @param {string} id - The primary identifier key.
     * @returns {Promise<T | null>} The entity object if found, otherwise null.
     */
    async findById(id: string): Promise<T | null> {
        return this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
    }

    /**
     * Retrieves a single entity entry by its unique identifier or forcefully rejects.
     * @param {string} id - The primary identifier key.
     * @throws {NotFoundException} If no entry corresponds to the requested resource.
     * @returns {Promise<T>} Resolves with the found entity object.
     */
    async findByIdOrFail(id: string): Promise<T> {
        const entity = await this.findById(id);
        if (!entity) {
            throw new NotFoundException(`${this.repository.metadata.name} not found`);
        }
        return entity;
    }

    /**
     * Fetches all database entries registered to this specific entity table space.
     * @returns {Promise<T[]>} Collection listing all available entity rows.
     */
    async findAll(): Promise<T[]> {
        return this.repository.find();
    }

    /**
     * instantiates and persists a fresh record matching the entity criteria.
     * @param {DeepPartial<T>} data - Partial structure matching the schema definitions.
     * @returns {Promise<T>} The saved entity reference enriched with database-assigned variables.
     */
    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }

    /**
     * Alters properties on an existing entity entry and retrieves the modified state.
     * @param {string} id - Target resource key.
     * @param {DeepPartial<T>} data - Structural subset specifying parameters to transform.
     * @returns {Promise<T>} The updated entity schema state.
     */
    async update(id: string, data: DeepPartial<T>): Promise<T> {
        await this.repository.update(id, data as any);
        return this.findByIdOrFail(id);
    }

    /**
     * Hard-deletes a row entry from the data store corresponding to the given identifier.
     * @param {string} id - Target deletion identifier.
     * @throws {NotFoundException} If no entry matched the requested ID to purge.
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`${this.repository.metadata.name} not found`);
        }
    }

    /**
     * Verifies the existence of an entity entry matched against a given primary identifier.
     * @param {string} id - Target lookup verification token.
     * @returns {Promise<boolean>} Evaluates true if matching counts exceed zero.
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.repository.count({ where: { id } as unknown as FindOptionsWhere<T> });
        return count > 0;
    }

    /**
     * Calculates the aggregate scale of records fulfilling explicit filtering bounds.
     * @param {FindOptionsWhere<T>} where - Criteria conditions array applied to the database evaluation query.
     * @returns {Promise<number>} Collective number of rows matching constraints.
     */
    async countBy(where: FindOptionsWhere<T>): Promise<number> {
        return this.repository.count({ where });
    }
}