import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function initDatabaseUrl(): string | undefined {
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size < 1000) {
        const candidates = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join('/var/task', 'prisma', 'dev.db'),
          path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
          path.join(__dirname, '..', 'prisma', 'dev.db'),
          path.join(process.cwd(), '.next', 'server', 'prisma', 'dev.db'),
        ];
        let copied = false;
        for (const src of candidates) {
          if (fs.existsSync(src)) {
            try {
              fs.copyFileSync(src, tmpDbPath);
              copied = true;
              console.log(`[PRISMA] Successfully initialized SQLite at ${tmpDbPath} from ${src}`);
              break;
            } catch (copyErr) {
              console.error(`[PRISMA] Error copying from ${src}:`, copyErr);
            }
          }
        }
        if (!copied) {
          console.warn('[PRISMA] Warning: Source prisma/dev.db not found in candidate paths:', candidates);
        }
      }
    } catch (e) {
      console.error('[PRISMA] Error preparing temporary database:', e);
    }
    return 'file:/tmp/dev.db';
  }
  return undefined;
}

const dbUrl = initDatabaseUrl();
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
