const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'tesoureiro', password: 'tesoureiro123' },
    { username: 'secretario', password: 'secretario123' },
  ];

  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { passwordHash: hash },
      create: { username: u.username, name: u.username, passwordHash: hash, role: 'user' },
    });
    console.log(`Set password for ${u.username}`);
  }

  const all = await prisma.user.findMany({ select: { id: true, username: true } });
  console.log('Users in DB:', all);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
