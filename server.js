// Captura erros globais para facilitar diagnóstico
process.on('uncaughtException', err => {
  console.error('Erro não tratado:', err);
});
process.on('unhandledRejection', err => {
  console.error('Promise rejeitada não tratada:', err);
});

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('🚀 Iniciando servidor...');

const prisma = new PrismaClient();
const app = express();

console.log('📦 Prisma e Express inicializados');
app.use(cors());
app.use(express.json());
// Servir arquivos estáticos do frontend (index.html, script.js, etc)
app.use(express.static(__dirname));

// Endpoint seguro de autenticação
app.post('/api/auth', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: 'Usuário e senha obrigatórios' });
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.json({ success: false, message: 'Usuário não encontrado' });
  }
  // Comparação segura usando bcrypt
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.json({ success: false, message: 'Senha incorreta' });
  }
  // Nunca envie o hash para o frontend
  const { passwordHash, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

// Usuários
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Caixas

// Listar caixas
app.get('/api/caixas', async (req, res) => {
  const caixas = await prisma.caixa.findMany();
  res.json(caixas);
});

// Criar caixa
app.post('/api/caixas', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do caixa é obrigatório.' });
    // Gera uma key única
    const key = name.toLowerCase().replace(/[^a-z0-9]/gi, '');
    // Verifica se já existe
    const exists = await prisma.caixa.findUnique({ where: { key } });
    if (exists) return res.status(400).json({ error: 'Já existe um caixa com esse nome.' });
    const caixa = await prisma.caixa.create({ data: { name, key } });
    res.json(caixa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar caixa
app.put('/api/caixas/:key', async (req, res) => {
  try {
    const { name } = req.body;
    const { key } = req.params;
    if (!name) return res.status(400).json({ error: 'Nome do caixa é obrigatório.' });
    // Verifica se existe
    const exists = await prisma.caixa.findUnique({ where: { key } });
    if (!exists) return res.status(404).json({ error: 'Caixa não encontrado.' });
    const caixa = await prisma.caixa.update({ where: { key }, data: { name } });
    res.json(caixa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir caixa
app.delete('/api/caixas/:key', async (req, res) => {
  try {
    const { key } = req.params;
    await prisma.caixa.delete({ where: { key } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transações
// Buscar transação por ID
// Buscar transação por ID
app.get('/api/transactions/:id', async (req, res) => {
// Atualizar transação
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const data = req.body;
    // Buscar o usuário pelo username enviado
    let userId = data.userId;
    if (!userId && data.user) {
      const user = await prisma.user.findUnique({ where: { username: data.user } });
      if (!user) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }
      userId = user.id;
    }
    // Converter caixa para ID se vier como string
    let caixaId = data.caixaId;
    if (!caixaId && data.caixa) {
      const caixa = await prisma.caixa.findUnique({ where: { key: data.caixa } });
      if (!caixa) {
        return res.status(400).json({ error: 'Caixa não encontrado' });
      }
      caixaId = caixa.id;
    }
    // Converter data para Date
    const date = data.date ? new Date(data.date) : new Date();
    // Validação dos campos obrigatórios
    if (!data.type || !caixaId || !userId || !data.amount || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes ou inválidos.' });
    }
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        caixaId,
        description: data.description || '',
        person: data.person || '',
        amount: data.amount,
        date,
        userId,
      },
      include: { caixa: true, user: true, receipt: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { caixa: true, user: true, receipt: true }
  });
  if (!transaction) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json(transaction);
});
app.get('/api/transactions', async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: { caixa: true, user: true, receipt: true },
    orderBy: { date: 'desc' }
  });
  res.json(transactions);
});
app.post('/api/transactions', async (req, res) => {
  try {
    const data = req.body;
    console.log('Recebido em /api/transactions:', data);
    // Buscar o usuário pelo username enviado
    let userId = data.userId;
    if (!userId && data.user) {
      const user = await prisma.user.findUnique({ where: { username: data.user } });
      if (!user) {
        console.error('Usuário não encontrado:', data.user);
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }
      userId = user.id;
    }
    // Converter caixa para ID se vier como string
    let caixaId = data.caixaId;
    if (!caixaId && data.caixa) {
      const caixa = await prisma.caixa.findUnique({ where: { key: data.caixa } });
      if (!caixa) {
        console.error('Caixa não encontrado:', data.caixa);
        return res.status(400).json({ error: 'Caixa não encontrado' });
      }
      caixaId = caixa.id;
    }
    // Converter data para Date
    const date = data.date ? new Date(data.date) : new Date();
    // Validação dos campos obrigatórios
    if (!data.type || !caixaId || !userId || !data.amount || !date) {
      console.error('Campos obrigatórios ausentes:', { type: data.type, caixaId, userId, amount: data.amount, date });
      return res.status(400).json({ error: 'Campos obrigatórios ausentes ou inválidos.' });
    }
    // Permitir apenas entrada e saída
    if (data.type !== 'entrada' && data.type !== 'saida') {
      return res.status(400).json({ error: 'Tipo de transação inválido. Use apenas "entrada" ou "saida".' });
    }
    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        caixaId,
        description: data.description || '',
        person: data.person || '',
        amount: data.amount,
        date,
        userId,
      },
      include: { caixa: true, user: true, receipt: true }
    });
    res.json(transaction);
  } catch (err) {
    console.error('Erro ao criar transação:', err, req.body);
    res.status(500).json({ error: err.message });
  }
});

// Excluir transação
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar se a transação existe
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { receipt: true }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Se há recibo associado, excluir primeiro
    if (transaction.receipt) {
      await prisma.receipt.delete({
        where: { id: transaction.receipt.id }
      });
    }

    // Excluir a transação
    await prisma.transaction.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Transação excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir transação:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir transação' });
  }
});

// Recibos
app.get('/api/receipts', async (req, res) => {
  const receipts = await prisma.receipt.findMany({
    include: { user: true, transaction: true },
    orderBy: { date: 'desc' }
  });
  res.json(receipts);
});
app.post('/api/receipts', async (req, res) => {
  try {
    const data = req.body;
    // Buscar o usuário pelo username enviado
    let userId = data.userId;
    if (!userId && data.user) {
      const user = await prisma.user.findUnique({ where: { username: data.user } });
      if (!user) {
        console.error('Usuário não encontrado:', data.user);
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }
      userId = user.id;
    }
    // Converter data para Date
    const date = data.date ? new Date(data.date) : new Date();
    const receipt = await prisma.receipt.create({
      data: {
        name: data.name,
        type: data.type,
        amount: data.amount,
        date,
        notes: data.notes,
        userId,
      }
    });
    res.json(receipt);
  } catch (err) {
    console.error('Erro ao criar recibo:', err, req.body);
    res.status(500).json({ error: err.message });
  }
});

// Dados da igreja
app.get('/api/church', async (req, res) => {
  const data = await prisma.churchData.findFirst();
  res.json(data);
});
app.put('/api/church', async (req, res) => {
  try {
    const input = req.body;
    // Busca o registro existente (assume que só existe 1)
    let church = await prisma.churchData.findFirst();
    if (!church) {
      // Se não existir, cria um novo
      church = await prisma.churchData.create({
        data: {
          name: input.name,
          address: input.address,
          phone: input.phone,
          email: input.email,
          cnpj: input.cnpj,
          logoUrl: input.logoUrl
        }
      });
      return res.json(church);
    }
    // Atualiza o registro existente
    const updated = await prisma.churchData.update({
      where: { id: church.id },
      data: {
        name: input.name,
        address: input.address,
        phone: input.phone,
        email: input.email,
        cnpj: input.cnpj,
        logoUrl: input.logoUrl
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar dados da igreja', details: err.message });
  }
});

// ROTA ADMIN PARA RECRIAR RECIBOS FALTANTES
// ROTA ADMIN PARA EXCLUIR TODOS OS RECIBOS DE SAÍDA
app.post('/admin/delete-receipts-saida', async (req, res) => {
  const token = req.query.token;
  const TOKEN_ESPERADO = process.env.ADMIN_TOKEN || 'supersecreto';
  if (token !== TOKEN_ESPERADO) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  try {
    // Exclui todos os recibos do tipo 'saida'
    const deleted = await prisma.receipt.deleteMany({
      where: { type: 'saida' }
    });
    res.json({ success: true, deleted: deleted.count });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir recibos de saída', details: err.message });
  }
});
app.post('/admin/seed-receipts-missing', async (req, res) => {
  const token = req.query.token;
  const TOKEN_ESPERADO = process.env.ADMIN_TOKEN || 'supersecreto';
  if (token !== TOKEN_ESPERADO) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  try {
    // Busca todas as transações que não possuem recibo
    const transactionsWithoutReceipt = await prisma.transaction.findMany({
      where: {
        receipt: null
      },
      include: { caixa: true, user: true }
    });
    // Busca dados da igreja
    const church = await prisma.churchData.findFirst();
    let count = 0;
    for (const transaction of transactionsWithoutReceipt) {
      let receiptName;
      if (transaction.type === 'saida') {
        receiptName = church?.name || 'Igreja';
      } else {
        receiptName = transaction.person || transaction.caixa?.name || 'Desconhecido';
      }
      await prisma.receipt.create({
        data: {
          transactionId: transaction.id,
          name: receiptName,
          type: transaction.type,
          amount: transaction.amount,
          date: transaction.date,
          notes: transaction.description || '',
          userId: transaction.userId,
        }
      });
      count++;
    }
    res.json({ success: true, created: count });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar recibos', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    app.listen(PORT, () => {
      console.log(`🌐 Backend rodando em http://localhost:${PORT}`);
      console.log('🔑 Usuários disponíveis: admin/admin123, tesoureiro/tesoureiro123, secretario/secretario123');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
