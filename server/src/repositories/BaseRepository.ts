import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import { BaseEntity } from '../entities/BaseEntity';
import { NotFoundException } from '../exceptions/index';

export abstract class BaseRepository<T extends BaseEntity> {
    protected constructor(protected readonly repository: Repository<T>) {}

    async findById(id: string): Promise<T | null> {
        return this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
    }

    async findByIdOrFail(id: string): Promise<T> {
        const entity = await this.findById(id);
        if (!entity) {
            throw new NotFoundException(`${this.repository.metadata.name} not found`);
        }
        return entity;
    }

    async findAll(): Promise<T[]> {
        return this.repository.find();
    }

    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }

    async update(id: string, data: DeepPartial<T>): Promise<T> {
        await this.repository.update(id, data as any);
        return this.findByIdOrFail(id);
    }

    async delete(id: string): Promise<void> {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`${this.repository.metadata.name} not found`);
        }
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.repository.count({ where: { id } as unknown as FindOptionsWhere<T> });
        return count > 0;
    }

    async countBy(where: FindOptionsWhere<T>): Promise<number> {
        return this.repository.count({ where });
    }
}