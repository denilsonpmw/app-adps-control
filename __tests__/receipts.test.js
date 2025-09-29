const request = require('supertest');
const { app, prisma } = require('../server');

beforeAll(async () => {
  // Ensure there's a church record and a test user
  await prisma.churchData.upsert({
    where: { id: 1 },
    update: { name: 'Assembleia de Deus CIADSETA' },
    create: { name: 'Assembleia de Deus CIADSETA' }
  });
  // Create or ensure test user exists
  await prisma.user.upsert({
    where: { username: 'tesoureiro' },
    update: { passwordHash: 'x', name: 'Tesoureiro', role: 'tesoureiro' },
    create: { username: 'tesoureiro', passwordHash: 'x', name: 'Tesoureiro', role: 'tesoureiro' }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/receipts', () => {
  test("creates a 'saida' receipt using church name when no name provided", async () => {
    const payload = { type: 'saida', amount: 10.5, date: '2025-09-22', notes: 'test', user: 'tesoureiro' };
    const res = await request(app).post('/api/receipts').send(payload).set('Accept', 'application/json');
    expect([200,201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Assembleia de Deus CIADSETA');
  });

  test("returns 400 when 'entrada' receipt missing name", async () => {
    const payload = { type: 'entrada', amount: 5, date: '2025-09-22', notes: 'test entrada', user: 'tesoureiro' };
    const res = await request(app).post('/api/receipts').send(payload).set('Accept', 'application/json');
    // Current logic expects a name for 'entrada' receipts; assert 400
    expect(res.status).toBe(400);
  });

  test("creates an 'entrada' receipt when name is provided", async () => {
    const payload = { type: 'entrada', name: 'Doação', amount: 20, date: '2025-09-22', notes: 'doacao', user: 'tesoureiro' };
    const res = await request(app).post('/api/receipts').send(payload).set('Accept', 'application/json');
    expect([200,201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Doação');
  });

  test("returns 400 when creating 'saida' receipt but church data missing", async () => {
    // Remove church data
    await prisma.churchData.deleteMany();
    const payload = { type: 'saida', amount: 15, date: '2025-09-22', notes: 'teste sem igreja', user: 'tesoureiro' };
    const res = await request(app).post('/api/receipts').send(payload).set('Accept', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/igreja/i);
    // Recreate church data for other tests
    await prisma.churchData.create({ data: { name: 'Assembleia de Deus CIADSETA' } });
  });
});
