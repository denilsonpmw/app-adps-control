const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  // Usuários
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: bcrypt.hashSync('admin123', 10), name: 'Administrador', role: 'admin' },
    create: { username: 'admin', name: 'Administrador', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin' },
  });
  const tesoureiro = await prisma.user.upsert({
    where: { username: 'tesoureiro' },
    update: { passwordHash: bcrypt.hashSync('tesoureiro123', 10), name: 'Tesoureiro', role: 'tesoureiro' },
    create: { username: 'tesoureiro', name: 'Tesoureiro', passwordHash: bcrypt.hashSync('tesoureiro123', 10), role: 'tesoureiro' },
  });
  const secretario = await prisma.user.upsert({
    where: { username: 'secretario' },
    update: { passwordHash: bcrypt.hashSync('secretario123', 10), name: 'Secretário', role: 'secretario' },
    create: { username: 'secretario', name: 'Secretário', passwordHash: bcrypt.hashSync('secretario123', 10), role: 'secretario' },
  });

  // Caixas
  const escolabiblica = await prisma.caixa.upsert({ where: { key: 'escolabiblica' }, update: { name: 'Escola Bíblica' }, create: { key: 'escolabiblica', name: 'Escola Bíblica' } });
  const missoessede = await prisma.caixa.upsert({ where: { key: 'missoessede' }, update: { name: 'Missões Sede' }, create: { key: 'missoessede', name: 'Missões Sede' } });
  const missoescampo = await prisma.caixa.upsert({ where: { key: 'missoescampo' }, update: { name: 'Missões Campo' }, create: { key: 'missoescampo', name: 'Missões Campo' } });
  

  // Dados da igreja
  await prisma.churchData.create({
    data: {
      name: 'Assembleia de Deus CIADSETA',
      address: 'Rua 16, Qd 35, Lts. 24/25 - Taquaralto, Palmas/TO',
      phone: '(63) 99220-2878',
      email: 'contato@ciadseta.org',
      cnpj: '26.752.949/0001-31',
      logoUrl: null,
    },
  });

  // Transações
  const t1 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: escola.id,
      description: 'Oferta Escola Bíblica',
      amount: 150.00,
      date: new Date('2025-08-15'),
      userId: admin.id,
    },
  });
  const t2 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: missoes.id,
      description: 'Carnê de Missões - João Silva',
      amount: 50.00,
      date: new Date('2025-08-14'),
      userId: tesoureiro.id,
    },
  });
  const t3 = await prisma.transaction.create({
    data: {
      type: 'saida',
      caixaId: geral.id,
      description: 'Material de expediente',
      amount: 25.50,
      date: new Date('2025-08-13'),
      userId: admin.id,
    },
  });
  const t4 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: geral.id,
      description: 'Oferta de Culto',
      amount: 320.00,
      date: new Date('2025-08-12'),
      userId: admin.id,
    },
  });
  const t5 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: campo.id,
      description: 'Doação para Missões do Campo',
      amount: 200.00,
      date: new Date('2025-08-11'),
      userId: secretario.id,
    },
  });
  const t6 = await prisma.transaction.create({
    data: {
      type: 'transferencia',
      caixaId: geral.id,
      description: 'Transferência para Escola Bíblica',
      amount: 100.00,
      date: new Date('2025-08-10'),
      transferToId: escola.id,
      userId: admin.id,
    },
  });

  // Recibos
  await prisma.receipt.create({
    data: {
      name: 'João Silva',
      type: 'carnê',
      amount: 50.00,
      date: new Date('2025-08-14'),
      notes: 'Carnê de Missões - Janeiro 2025',
      userId: tesoureiro.id,
      transactionId: t2.id,
    },
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
