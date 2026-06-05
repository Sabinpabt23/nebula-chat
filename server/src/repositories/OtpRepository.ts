import { Repository, MoreThan } from 'typeorm';
import { Otp } from '../entities/Otp';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class OtpRepository extends BaseRepository<Otp> {
    private readonly otpRepository: Repository<Otp>;

    constructor() {
        const repository = AppDataSource.getRepository(Otp);
        super(repository);
        this.otpRepository = repository;
    }

    async findValidByEmail(email: string): Promise<Otp | null> {
        return this.otpRepository.findOne({
            where: {
                email,
                isUsed: false,
                expiresAt: MoreThan(new Date()),
            },
            order: { createdAt: 'DESC' },
        });
    }

    async findRecentByEmail(email: string): Promise<Otp | null> {
        return this.otpRepository.findOne({
            where: { email },
            order: { createdAt: 'DESC' },
        });
    }

    async markUsed(id: string): Promise<void> {
        await this.otpRepository.update(id, { isUsed: true });
    }

    async incrementAttempts(id: string): Promise<void> {
        await this.otpRepository.increment({ id }, 'attempts', 1);
    }
}