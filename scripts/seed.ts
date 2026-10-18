import { seedLpu } from '../prisma/seed/lpu';
import { prisma } from '../lib/prisma';

async function main() {
  await seedLpu();
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
