// Testes automatizados para ADPS Control usando TestSprite
// Execução: node test-adps.js

const test_config = {
  baseURL: 'http://localhost:3001',
  testUser: {
    username: 'admin',
    password: 'admin123'
  },
  endpoints: [
    // Autenticação
    {
      method: 'POST',
      path: '/api/auth',
      description: 'Autenticação de usuário válido',
      body: {
        username: 'admin',
        password: 'admin123'
      },
      expectedStatus: 200,
      expectedFields: ['success', 'user']
    },
    {
      method: 'POST',
      path: '/api/auth',
      description: 'Autenticação com senha inválida',
      body: {
        username: 'admin',
        password: 'senhaerrada'
      },
      expectedStatus: 200,
      expectedResponse: { success: false }
    },

    // Usuários
    {
      method: 'GET',
      path: '/api/users',
      description: 'Listar todos os usuários',
      expectedStatus: 200,
      expectedType: 'array'
    },

    // Caixas
    {
      method: 'GET',
      path: '/api/caixas',
      description: 'Listar todas as caixas',
      expectedStatus: 200,
      expectedType: 'array'
    },
    {
      method: 'POST',
      path: '/api/caixas',
      description: 'Criar nova caixa',
      body: {
        name: 'Caixa Teste',
        description: 'Descrição da caixa de teste'
      },
      expectedStatus: 200
    },

    // Transações
    {
      method: 'GET',
      path: '/api/transactions',
      description: 'Listar todas as transações',
      expectedStatus: 200,
      expectedType: 'array'
    },
    {
      method: 'POST',
      path: '/api/transactions',
      description: 'Criar nova transação',
      body: {
        date: new Date().toISOString(),
        type: 'ENTRADA',
        amount: 100.50,
        description: 'Transação de teste',
        person: 'João da Silva',
        caixaKey: 'caixa-principal'
      },
      expectedStatus: 200
    },

    // Recibos
    {
      method: 'GET',
      path: '/api/receipts',
      description: 'Listar todos os recibos',
      expectedStatus: 200,
      expectedType: 'array'
    },
    {
      method: 'POST',
      path: '/api/receipts',
      description: 'Criar novo recibo',
      body: {
        date: new Date().toISOString(),
        person: 'Maria Silva',
        amount: 250.00,
        description: 'Recibo de teste'
      },
      expectedStatus: 200
    },

    // Igreja
    {
      method: 'GET',
      path: '/api/church',
      description: 'Obter informações da igreja',
      expectedStatus: 200,
      expectedFields: ['name', 'address']
    }
  ]
};

console.log('Configuração de testes ADPS Control carregada.');
console.log(`Total de endpoints para testar: ${test_config.endpoints.length}`);
