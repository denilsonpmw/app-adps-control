
// init-app carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a aplicação
    try {
        // evita exceção se localStorage não estiver disponível
        localStorage.getItem('currentUser');
    } catch (e) { /* ignore */ }
    window.app = new ChurchFinanceApp();
});
