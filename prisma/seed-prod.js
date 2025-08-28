
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();


async function main() {
  // Usuário admin para produção
  const passwordHash = await bcrypt.hash('cd1526', 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      name: 'Denilson Maciel',
      passwordHash,
      role: 'admin',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
