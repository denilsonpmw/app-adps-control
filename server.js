const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
// Servir arquivos estáticos do frontend (index.html, script.js, etc)
app.use(express.static(__dirname));

// Usuários
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Caixas
app.get('/api/caixas', async (req, res) => {
  const caixas = await prisma.caixa.findMany();
  res.json(caixas);
});

// Transações
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
