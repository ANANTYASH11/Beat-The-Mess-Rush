import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

async function testPrismaTmp() {
  const tmpDir = os.tmpdir();
  const tmpDbPath = path.join(tmpDir, 'test_dev.db');
  const srcDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  fs.copyFileSync(srcDbPath, tmpDbPath);
  console.log(`Copied from ${srcDbPath} to ${tmpDbPath} (size: ${fs.statSync(tmpDbPath).size})`);

  const client = new PrismaClient({
    datasources: {
      db: {
        url: `file:${tmpDbPath}`
      }
    }
  });

  const messes = await client.mess.findMany();
  console.log(`Found ${messes.length} messes in copied DB:`, messes.slice(0, 3).map(m => m.name));

  const northMess = await client.mess.findFirst({ where: { code: 'central-mess-north' } });
  console.log('Found north mess:', northMess?.name);

  await client.$disconnect();
  fs.unlinkSync(tmpDbPath);
  console.log('PASS: Copied SQLite works with PrismaClient datasources override!');
}

testPrismaTmp().catch(e => {
  console.error('FAIL:', e);
  process.exit(1);
});
