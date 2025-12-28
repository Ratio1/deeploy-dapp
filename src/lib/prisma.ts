import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma-generated/client';

const globalForPrisma = globalThis as {
    prisma?: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    (() => {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });

        return new PrismaClient({ adapter });
    })();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
