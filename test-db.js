const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testando conexão com banco do Railway...');
  
  // Use a URL real do seu banco PostgreSQL do Railway aqui
  const DATABASE_URL = process.env.RAILWAY_DATABASE_URL || "postgresql://postgres:oAkxAqEQrrOfUmBXDsAmLyZqPbwUommG@postgres.railway.internal:5432/railway";
  
  console.log('📍 DATABASE_URL configurada:', DATABASE_URL ? 'SIM' : 'NÃO');
  console.log('🌐 URL (sem senha):', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  });

  try {
    console.log('⏳ Conectando...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida!');
    
    // Testa se as tabelas existem
    console.log('📋 Verificando tabelas...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Usuários encontrados: ${userCount}`);
    } catch (err) {
      console.log('❌ Tabela User não existe:', err.message);
    }
    
    try {
      const transactionCount = await prisma.transaction.count();
      console.log(`💸 Transações encontradas: ${transactionCount}`);
    } catch (err) {
      console.log('❌ Tabela Transaction não existe:', err.message);
    }
    
    try {
      const receiptCount = await prisma.receipt.count();
      console.log(`📋 Recibos encontrados: ${receiptCount}`);
    } catch (err) {
      console.log('❌ Tabela Receipt não existe:', err.message);
    }
    
    try {
      const caixaCount = await prisma.caixa.count();
      console.log(`💰 Caixas encontradas: ${caixaCount}`);
    } catch (err) {
      console.log('❌ Tabela Caixa não existe:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.error('🔧 Detalhes:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado');
  }
}

testConnection();