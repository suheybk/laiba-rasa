import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const getClient = () => {
    // Return standard Prisma instance strictly globally cached in dev
    if (process.env.NODE_ENV !== "production") {
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = new PrismaClient({
                log: ["query", "error", "warn"],
            });
        }
        return globalForPrisma.prisma;
    }

    // In Edge/Production execution, dynamically bind Cloudflare D1
    try {
        const ctx = getCloudflareContext() as any;
        const env = ctx?.env;
        if (env && env.DB) {
            const adapter = new PrismaD1(env.DB as any);
            return new PrismaClient({ adapter });
        }
    } catch (error) {
        // Ignored, fallback to default local database execution if missing request context
    }

    return new PrismaClient();
};

export const prisma = new Proxy({} as PrismaClient, {
    get: (_, prop) => {
        const client = getClient();
        return client[prop as keyof PrismaClient];
    }
});

export default prisma;
