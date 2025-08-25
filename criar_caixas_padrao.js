// Script para criar novamente os caixas padrão via API
// Execute no console do navegador na página do sistema (após login)

(async () => {
  const caixas = [
    'Escola Bíblica',
    'Missões',
    'Missões do Campo',
    'Geral'
  ];
  try {
    for (const name of caixas) {
      await fetch('http://localhost:3001/api/caixas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    }
    alert('Caixas padrão criados com sucesso!');
  } catch (err) {
    alert('Erro ao criar caixas: ' + err.message);
  }
})();
