const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Caixas
  const escolabiblica = await prisma.caixa.findFirst({ where: { key: 'escolabiblica' } });
  const missoessede = await prisma.caixa.findFirst({ where: { key: 'missoessede' } });
  const missoescampo = await prisma.caixa.findFirst({ where: { key: 'missoescampo' } });

  // Usuários
  const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
  const tesoureiro = await prisma.user.findFirst({ where: { username: 'tesoureiro' } });
  const secretario = await prisma.user.findFirst({ where: { username: 'secretario' } });

  // Transações
  const transacoes = [
    {
      type: 'entrada',
      caixaId: escolabiblica.id,
      description: 'Oferta Escola Bíblica',
      person: 'João Silva',
      amount: 150.00,
      date: new Date('2025-08-15'),
      userId: admin.id,
    },
    {
      type: 'entrada',
      caixaId: missoessede.id,
      description: 'Carnê de Missões',
      person: 'João Silva',
      amount: 50.00,
      date: new Date('2025-08-14'),
      userId: tesoureiro.id,
    },
    {
      type: 'saida',
      caixaId: missoessede.id,
      description: 'Material de expediente',
      person: 'Fornecedor XYZ',
      amount: 25.50,
      date: new Date('2025-08-13'),
      userId: admin.id,
    },
    {
      type: 'entrada',
      caixaId: missoessede.id,
      description: 'Oferta de Culto',
      person: 'Maria Souza',
      amount: 320.00,
      date: new Date('2025-08-12'),
      userId: admin.id,
    },
    {
      type: 'entrada',
      caixaId: missoescampo.id,
      description: 'Doação para Missões do Campo',
      person: 'Carlos Lima',
      amount: 200.00,
      date: new Date('2025-08-11'),
      userId: secretario.id,
    },
    {
      type: 'transferencia',
      caixaId: missoessede.id,
      description: 'Transferência para Escola Bíblica',
      person: 'Administrador',
      amount: 100.00,
      date: new Date('2025-08-10'),
      transferToId: escolabiblica.id,
      userId: admin.id,
    },
  ];

  for (const t of transacoes) {
    const transaction = await prisma.transaction.create({ data: t });

    // Recibo vinculado ao ofertante/fornecedor
    await prisma.receipt.create({
      data: {
        name: t.person,
        type: t.type,
        amount: t.amount,
        date: t.date,
        notes: t.description,
        userId: t.userId,
        transactionId: transaction.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
