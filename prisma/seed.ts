import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Usuários
  const bcrypt = require('bcryptjs');
  await prisma.user.deleteMany();
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      name: 'Administrador',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
    },
  });
  const tesoureiro = await prisma.user.create({
    data: {
      username: 'tesoureiro',
      name: 'Tesoureiro',
      passwordHash: bcrypt.hashSync('tesoureiro123', 10),
      role: 'tesoureiro',
    },
  });
  const secretario = await prisma.user.create({
    data: {
      username: 'secretario',
      name: 'Secretário',
      passwordHash: bcrypt.hashSync('secretario123', 10),
      role: 'secretario',
    },
  });
  const denilson = await prisma.user.create({
    data: {
      username: 'denilson',
      name: 'Denilson',
      passwordHash: '$2b$10$Nrn4JRLaSO2Rk9MPDdls3eEJRYkmiHzJhuxy0ZRNFovO4eJlf7yZC',
      role: 'admin',
    },
  });

  // Caixas
  const escolabiblica = await prisma.caixa.create({ data: { key: 'escolabiblica', name: 'Escola Bíblica' } });
  const missoessede = await prisma.caixa.create({ data: { key: 'missoessede', name: 'Missões Sede' } });
  const missoescampo = await prisma.caixa.create({ data: { key: 'missoescampo', name: 'Missões Campo' } });

  // Dados da igreja
  await prisma.churchData.create({
    data: {
      name: 'Igreja Exemplo',
      address: 'Rua das Flores, 123',
      phone: '(99) 99999-9999',
      email: 'contato@igrejaexemplo.org',
      cnpj: '12.345.678/0001-99',
      logoUrl: null,
    },
  });

  // Transações
  const t1 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: escolabiblica.id,
      description: 'Oferta Escola Bíblica',
      amount: 150.00,
      date: new Date('2025-08-15'),
      userId: admin.id,
    },
  });
  const t2 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: missoessede.id,
      description: 'Carnê de Missões - João Silva',
      amount: 50.00,
      date: new Date('2025-08-14'),
      userId: tesoureiro.id,
    },
  });
  const t3 = await prisma.transaction.create({
    data: {
      type: 'saida',
      caixaId: escolabiblica.id,
      description: 'Material de expediente',
      amount: 25.50,
      date: new Date('2025-08-13'),
      userId: admin.id,
    },
  });
  const t4 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: missoessede.id,
      description: 'Oferta de Culto',
      amount: 320.00,
      date: new Date('2025-08-12'),
      userId: admin.id,
    },
  });
  const t5 = await prisma.transaction.create({
    data: {
      type: 'entrada',
      caixaId: missoescampo.id,
      description: 'Doação para Missões do Campo',
      amount: 200.00,
      date: new Date('2025-08-11'),
      userId: secretario.id,
    },
  });
  const t6 = await prisma.transaction.create({
    data: {
      type: 'transferencia',
      caixaId: missoessede.id,
      description: 'Transferência para Escola Bíblica',
      amount: 100.00,
      date: new Date('2025-08-10'),
      transferToId: escolabiblica.id,
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
      userId: denilson.id,
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
      userId: denilson.id,
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
      userId: denilson.id,
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
      userId: denilson.id,
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
      userId: denilson.id,
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
      userId: denilson.id,
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
