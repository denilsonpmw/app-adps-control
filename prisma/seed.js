const { PrismaClient } = require('@prisma/client');
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
  await prisma.caixa.deleteMany();
  const escolabiblica = await prisma.caixa.create({ data: { key: 'escolabiblica', name: 'Escola Bíblica' } });
  const missoessede = await prisma.caixa.create({ data: { key: 'missoessede', name: 'Missões Sede' } });
  const missoescampo = await prisma.caixa.create({ data: { key: 'missoescampo', name: 'Missões Campo' } });

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

  console.log('✅ Seed concluído: Usuários, caixas e dados da igreja criados');
  console.log('📋 Tabelas de recibos e transações ficaram vazias conforme solicitado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
