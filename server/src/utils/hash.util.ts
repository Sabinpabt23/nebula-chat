import bcrypt from 'bcryptjs';

class HashUtil {
    private readonly saltRounds: number;

    constructor() {
        this.saltRounds = 12;
    }

    async hash(data: string): Promise<string> {
        return bcrypt.hash(data, this.saltRounds);
    }

    async compare(data: string, hash: string): Promise<boolean> {
        return bcrypt.compare(data, hash);
    }
}

export const hashUtil = new HashUtil();