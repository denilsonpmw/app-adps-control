// Script para limpar todos os caixas do banco via API
// Execute no console do navegador na página do sistema (após login)

(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/caixas');
    const caixas = await res.json();
    for (const caixa of caixas) {
      await fetch(`http://localhost:3001/api/caixas/${caixa.key}`, { method: 'DELETE' });
    }
    alert('Todos os caixas foram removidos do banco!');
  } catch (err) {
    alert('Erro ao limpar caixas: ' + err.message);
  }
})();
