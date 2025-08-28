const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Usuário admin para produção
  await prisma.user.create({
    data: {
      username: 'admin',
      name: 'Denilson Maciel',
      passwordHash: 'cd1526',
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
