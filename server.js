
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
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
  // Comparação simples, para produção use bcrypt
  if (user.passwordHash !== password) {
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
    // Converter caixa e transferTo para IDs se vierem como string
    let caixaId = data.caixaId;
    if (!caixaId && data.caixa) {
      const caixa = await prisma.caixa.findUnique({ where: { key: data.caixa } });
      if (!caixa) {
        return res.status(400).json({ error: 'Caixa não encontrado' });
      }
      caixaId = caixa.id;
    }
    let transferToId = data.transferToId;
    if (!transferToId && data.transferTo) {
      const caixa = await prisma.caixa.findUnique({ where: { key: data.transferTo } });
      transferToId = caixa ? caixa.id : null;
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
        transferToId,
        userId,
      },
      include: { caixa: true, user: true, transferTo: true, receipt: true }
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
    include: { caixa: true, user: true, transferTo: true, receipt: true }
  });
  if (!transaction) return res.status(404).json({ error: 'Transação não encontrada' });
  res.json(transaction);
});
app.get('/api/transactions', async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: { caixa: true, user: true, transferTo: true, receipt: true },
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
    // Converter caixa e transferTo para IDs se vierem como string
    let caixaId = data.caixaId;
    if (!caixaId && data.caixa) {
      const caixa = await prisma.caixa.findUnique({ where: { key: data.caixa } });
      if (!caixa) {
        console.error('Caixa não encontrado:', data.caixa);
        return res.status(400).json({ error: 'Caixa não encontrado' });
      }
      caixaId = caixa.id;
    }
    let transferToId = data.transferToId;
    if (!transferToId && data.transferTo) {
      const caixa = await prisma.caixa.findUnique({ where: { key: data.transferTo } });
      transferToId = caixa ? caixa.id : null;
    }
    // Converter data para Date
    const date = data.date ? new Date(data.date) : new Date();
    // Validação dos campos obrigatórios
    if (!data.type || !caixaId || !userId || !data.amount || !date) {
      console.error('Campos obrigatórios ausentes:', { type: data.type, caixaId, userId, amount: data.amount, date });
      return res.status(400).json({ error: 'Campos obrigatórios ausentes ou inválidos.' });
    }
    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        caixaId,
        description: data.description || '',
        person: data.person || '',
        amount: data.amount,
        date,
        transferToId,
        userId,
      },
      include: { caixa: true, user: true, transferTo: true, receipt: true }
    });
    res.json(transaction);
  } catch (err) {
    console.error('Erro ao criar transação:', err, req.body);
    res.status(500).json({ error: err.message });
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
  const data = req.body;
  const church = await prisma.churchData.update({ where: { id: data.id }, data });
  res.json(church);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
