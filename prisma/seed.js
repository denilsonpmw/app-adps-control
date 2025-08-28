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
  });
  await prisma.receipt.create({
    data: {
      name: 'Administrador',
      type: 'oferta',
      amount: 150.00,
      date: new Date('2025-08-15'),
      notes: 'Oferta Escola Bíblica',
      userId: admin.id,
      transactionId: t1.id,
    },
  });
  await prisma.receipt.create({
    data: {
      name: 'Administrador',
      type: 'saida',
      amount: 25.50,
      date: new Date('2025-08-13'),
      notes: 'Material de expediente',
      userId: admin.id,
      transactionId: t3.id,
    },
  });
  await prisma.receipt.create({
    data: {
      name: 'Administrador',
      type: 'oferta',
      amount: 320.00,
      date: new Date('2025-08-12'),
      notes: 'Oferta de Culto',
      userId: admin.id,
      transactionId: t4.id,
    },
  });
  await prisma.receipt.create({
    data: {
      name: 'Tesoureiro',
      type: 'oferta',
      amount: 200.00,
      date: new Date('2025-08-11'),
      notes: 'Doação para Missões do Campo',
      userId: secretario.id,
      transactionId: t5.id,
    },
  });
  await prisma.receipt.create({
    data: {
      name: 'Administrador',
      type: 'transferencia',
      amount: 100.00,
      date: new Date('2025-08-10'),
      notes: 'Transferência para Escola Bíblica',
      userId: admin.id,
      transactionId: t6.id,
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
