import { Repository, In } from 'typeorm';
import { User } from '../entities/User';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class UserRepository extends BaseRepository<User> {
    private readonly userRepository: Repository<User>;

    constructor() {
        const repository = AppDataSource.getRepository(User);
        super(repository);
        this.userRepository = repository;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { googleId } });
    }

    async findByIds(ids: string[]): Promise<User[]> {
        return this.userRepository.find({ where: { id: In(ids) } });
    }

    async searchUsers(query: string, limit: number = 20): Promise<User[]> {
        return this.userRepository
            .createQueryBuilder('user')
            .where('user.email ILIKE :query', { query: `%${query}%` })
            .orWhere('user.displayName ILIKE :query', { query: `%${query}%` })
            .limit(limit)
            .getMany();
    }
}