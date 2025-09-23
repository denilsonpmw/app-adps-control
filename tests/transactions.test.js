const request = require('supertest');
const { app, prisma } = require('../server');

let createdId;

beforeAll(async () => {
  // Ensure test user and caixa exist
  await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: { username: 'testuser', name: 'Test User', passwordHash: '$2b$10$saltsaltsaltsaltsaltsaltsaltsaltsaltsaltsaltsalt', role: 'user' }
  });
  await prisma.caixa.upsert({ where: { key: 'testcaixa' }, update: { name: 'Test Caixa' }, create: { key: 'testcaixa', name: 'Test Caixa' } });
});

afterAll(async () => {
  // Cleanup created transaction and test data
  try {
    if (createdId) await prisma.transaction.delete({ where: { id: createdId } });
  } catch (e) {}
  await prisma.user.deleteMany({ where: { username: { in: ['testuser'] } } });
  await prisma.caixa.deleteMany({ where: { key: { in: ['testcaixa'] } } });
  await prisma.$disconnect();
});

test('POST /api/transactions -> create transaction', async () => {
  const payload = { type: 'entrada', caixa: 'testcaixa', user: 'testuser', description: 'test', amount: 12.34, date: '2025-09-22' };
  const res = await request(app).post('/api/transactions').send(payload).set('Accept', 'application/json');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('id');
  createdId = res.body.id;
});

test('GET /api/transactions/:id -> returns created transaction', async () => {
  const res = await request(app).get(`/api/transactions/${createdId}`);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('id', createdId);
});

test('PUT /api/transactions/:id -> update transaction', async () => {
  const payload = { type: 'saida', caixa: 'testcaixa', user: 'testuser', description: 'updated', amount: 5.00, date: '2025-09-23' };
  const res = await request(app).put(`/api/transactions/${createdId}`).send(payload).set('Accept', 'application/json');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('description', 'updated');
});

test('DELETE /api/transactions/:id -> delete transaction', async () => {
  const res = await request(app).delete(`/api/transactions/${createdId}`);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('success', true);
});
