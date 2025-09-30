// Detecta URL do backend automaticamente
// Define a URL base da API usando a origem da página quando possível.
// Se estiver em localhost (ou abrindo via file:// durante testes locais), aponta para o servidor local.
const API_BASE_URL = (() => {
    try {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        // Se a página foi aberta via file:// (ex.: desenvolvimento local sem servidor),
        // apontamos para o backend local para evitar chamadas ao ambiente de produção por engano.
        if (window.location.protocol === 'file:') {
            return 'http://localhost:3001';
        }
        // Em produção/servido via HTTP(S), use a mesma origem da página
        if (window.location.origin && window.location.origin !== 'null') {
            return window.location.origin;
        }
    } catch (e) {
        // fallback conservador
    }
    return 'https://adps-finance.up.railway.app';
})();

// script.js carregado
// Helpers globais mínimos usados em vários trechos do app
function pxPerMm(){
    try{
        var el = document.createElement('div');
        el.style.width = '1mm';
        el.style.position = 'absolute';
        el.style.visibility = 'hidden';
        document.body.appendChild(el);
        var px = el.getBoundingClientRect().width || 0;
        document.body.removeChild(el);
        return px || (96/25.4);
    } catch(e){ return (96/25.4); }
}

function waitImagesLoaded(){
    try{
        var imgs = Array.from(document.images || []);
        if(imgs.length === 0) return Promise.resolve();
        return Promise.all(imgs.map(function(img){
            if(img.complete) return Promise.resolve();
            return new Promise(function(res){ img.onload = img.onerror = res; });
        }));
    } catch(e){ return Promise.resolve(); }
}

function waitFontsLoaded(){
    try{
        if(document.fonts && document.fonts.ready) return document.fonts.ready.catch(function(){/*ignore*/});
    } catch (e) { /* ignore */ }
    return Promise.resolve();
}
// Carregamento dinâmico dos caixas do backend
let CAIXAS = {};
async function loadCaixas() {
    const res = await fetch(`${API_BASE_URL}/api/caixas`);
    const caixasArr = await res.json();
    CAIXAS = {};
    caixasArr.forEach(caixa => {
        CAIXAS[caixa.key] = caixa.name;
    });
}

const USUARIOS = {
    admin: 'Administrador',
    tesoureiro: 'Tesoureiro',
    secretario: 'Secretário'
};

// Classe principal do aplicativo
class ChurchFinanceApp {
    // Retorna o label amigável para o tipo de recibo
    getReceiptTypeLabel(type) {
        const labels = {
            entrada: 'Entrada',
            saida: 'Saída',
            'carnê': 'Carnê de Missões',
            'oferta': 'Oferta de Culto',
            'escola': 'Oferta Escola Bíblica',
            'outro': 'Outro'
        };
        return labels[type] || type || '-';
    }
    // Carregar recibos do backend
    async loadReceipts() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/receipts`);
            if (!res.ok) throw new Error('Error loading receipts');
            this.receipts = await res.json();
        } catch (err) {
            this.receipts = [];
            this.showNotification('Erro ao carregar recibos do servidor', 'error');
        }
    }
    // Carregar transações do backend
    async loadTransactions() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/transactions`);
            if (!res.ok) throw new Error('Error loading transactions');
            this.transactions = await res.json();
        } catch (err) {
            this.transactions = [];
            this.showNotification('Erro ao carregar transações do servidor', 'error');
        }
    }
    constructor() {
        this.caixas = { ...CAIXAS };
        this.currentUser = null;
        this.transactions = [];
        this.receipts = [];
        this.balances = {
            escola: 0,
            missoes: 0,
            campo: 0,
            geral: 0
        };
        this.currentTheme = 'light';
        this.churchData = {
            id: null,
            name: '',
            address: '',
            phone: '',
            email: '',
            cnpj: ''
        };
        this.churchLogo = null;
        this.loadUsers();
        this.init();
    }

    // Não é mais necessário carregar usuários para o select
    async loadUsers() {}

    async init() {

        // Persistência de login
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser && USUARIOS[savedUser]) {
            this.currentUser = savedUser;
            this.switchScreen('mainApp');
            const currentUserDiv = document.getElementById('currentUser');
            if (currentUserDiv) {
                const savedUserName = localStorage.getItem('currentUserName');
                currentUserDiv.textContent = savedUserName || USUARIOS[this.currentUser];
            }
        }

        await loadCaixas();
        this.caixas = { ...CAIXAS };
        this.renderCaixaList();
        await this.loadChurchData();
        await this.loadTransactions();
        await this.loadReceipts();
    this.loadTheme();
        this.setupEventListeners();
    // Monta navegação mobile dentro do dropdown do usuário (para mostrar opções no avatar)
    this.mountMobileNavIntoDropdown();
        this.updateBalances();
        this.renderDashboard();

        // Dropdown do usuário: toggle ao clicar no avatar
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            // Toggle ao clicar no avatar; se o clique for dentro do dropdown, não impede a propagação
            userMenu.addEventListener('click', function (e) {
                // Se clicou dentro do dropdown, não interferimos (permitir delegação de clicks nas nav-tab)
                if (e.target.closest('.user-dropdown')) return;
                // Caso contrário (clicou no avatar), alterna e impede propagação para evitar fechar imediatamente
                userMenu.classList.toggle('open');
                e.stopPropagation();
            });
            // Fecha o dropdown se clicar fora
            document.addEventListener('click', function () {
                if (userMenu.classList.contains('open')) userMenu.classList.remove('open');
            });
            // Não impedir a propagação: permitimos que a delegação de eventos capture cliques
            // em elementos .nav-tab dentro do dropdown para navegar corretamente.
            // (Se for necessário evitar fechamento ao clicar em áreas específicas, podemos tratar
            // isso de forma seletiva no futuro.)
            
                        // expõe a função de scale pública para ser chamada pelo botão
                        window.scaleToFit = function(){
                            try{
                                var safetyMm = 10; // 10mm de folga
                                var pxmm = pxPerMm();
                                var printableHeightMm = 297 - (2 * 10);
                                var printableHeightPx = printableHeightMm * pxmm - (safetyMm * pxmm);
                                var printableWidthMm = 210 - (2 * 10);
                                var printableWidthPx = printableWidthMm * pxmm;
                                var container = document.querySelector('.receipt-container');
                                if(!container) return;
                                container.style.transform = '';
                                container.style.transformOrigin = 'top left';
                                container.style.width = printableWidthPx + 'px';
                                container.style.maxWidth = printableWidthPx + 'px';
                                container.style.boxSizing = 'border-box';
                                var rect = container.getBoundingClientRect();
                                var contentHeight = rect.height;
                                var tolerance = Math.max(4, pxmm * 1);
                                var scale = 1;
                                if(contentHeight > (printableHeightPx - tolerance)){
                                    scale = (printableHeightPx - tolerance) / contentHeight;
                                }
                                scale = Math.min(1, scale);
                                if(scale < 1){
                                    container.style.transform = 'scale(' + scale + ')';
                                    container.style.transformOrigin = 'top left';
                                    document.body.style.height = (printableHeightPx + safetyMm*pxmm) + 'px';
                                    document.documentElement.style.height = (printableHeightPx + safetyMm*pxmm) + 'px';
                                    document.body.style.width = printableWidthPx + 'px';
                                    document.documentElement.style.width = printableWidthPx + 'px';
                                    container.style.top = '10mm';
                                    container.style.left = '10mm';
                                } else {
                                    document.body.style.height = 'auto';
                                    document.documentElement.style.height = 'auto';
                                    container.style.top = '10mm';
                                    container.style.left = '10mm';
                                }
                            }catch(e){/*ignore*/}
                        };

                        // espera imagens e fontes carregarem e só então habilita o botão
                        Promise.all([waitImagesLoaded(), waitFontsLoaded()]).then(function(){
                            // pequena espera para layout estabilizar
                            setTimeout(function(){
                                var btn = document.querySelector('.footer-print-btn');
                                if(btn) btn.disabled = false;
                            }, 120);
                        });
                    }
                }

    // Carrega dados da igreja do backend
    async loadChurchData() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/church`);
            if (!res.ok) throw new Error('Erro ao carregar dados da igreja');
            const data = await res.json();
            if (data) {
                this.churchData = {
                    id: data.id,
                    name: data.name || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    cnpj: data.cnpj || '',
                    logoUrl: data.logoUrl || null
                };
                this.churchLogo = data.logoUrl || null;
                this.updateLogoPreview();
            }
        } catch (err) {
            this.churchData = { id: null, name: '', address: '', phone: '', email: '', cnpj: '', logoUrl: null };
            this.churchLogo = null;
            this.updateLogoPreview();
            this.showNotification('Erro ao carregar dados da igreja', 'error');
        }
    }

    // Clona as nav-tabs do menu mobile para o container dentro do dropdown do usuário
    mountMobileNavIntoDropdown() {
        try {
            const container = document.getElementById('mobileNavContainer');
            const mobileMenu = document.getElementById('mobileNavMenu');
            if (!container || !mobileMenu) return;
            // Limpa container
            container.innerHTML = '';
            // Clona cada botão (.nav-tab) e adiciona ao container
            const tabs = Array.from(mobileMenu.querySelectorAll('.nav-tab'));
            tabs.forEach(tab => {
                const clone = tab.cloneNode(true);
                // Remove display:none caso exista
                clone.style.display = '';
                container.appendChild(clone);
            });
            // Adiciona listener local para diagnosticar cliques (não substitui delegação global)
            try {
                container.addEventListener('click', function(ev){
                    const nt = ev.target.closest('.nav-tab');
                    if(nt){
                        // diagnostic removed: mobileNavContainer click
                    }
                });
            } catch(e){}
        } catch (e) {
            // ignore
        }
    }

    saveData() {
        localStorage.setItem('churchTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('churchReceipts', JSON.stringify(this.receipts));
        localStorage.setItem('churchBalances', JSON.stringify(this.balances));
        // churchData agora é persistido no backend
        if (this.churchLogo) {
            localStorage.setItem('churchLogo', this.churchLogo);
        }
    }

    // Gerenciamento de tema
    loadTheme() {
        const savedTheme = localStorage.getItem('churchTheme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        } else {
            // Detecta tema do sistema
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? 'dark' : 'light';
            this.currentTheme = theme;
            this.applyTheme(theme);
        }
    }

    saveTheme() {
        localStorage.setItem('churchTheme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveTheme();
    }

    // Configuração de event listeners
    setupEventListeners() {

        // Gerenciamento de Caixas
        document.getElementById('caixaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingCaixaKey) {
                this.updateCaixa();
            } else {
                this.addCaixa();
            }
        });
        document.getElementById('updateCaixaBtn').addEventListener('click', () => this.updateCaixa());
        document.getElementById('cancelCaixaEditBtn').addEventListener('click', () => this.cancelCaixaEdit());
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navegação
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchPage(e.target.closest('.nav-tab').dataset.page);
            });
        });
        // Event delegation: captura cliques em .nav-tab que possam ser inseridos dinamicamente
        document.addEventListener('click', (e) => {
            const navTab = e.target.closest('.nav-tab');
            if (navTab) {
                e.preventDefault();
                this.switchPage(navTab.dataset.page);
            }
        });

        // Modais
        const newTransactionBtn = document.getElementById('newTransactionBtn');
        if (newTransactionBtn) {
            newTransactionBtn.addEventListener('click', () => {

                this.openModal('transactionModal');
            });
        } else {

        }

        document.getElementById('newReceiptBtn').addEventListener('click', () => {
            this.openModal('receiptModal');
        });

        // Fechar modais
        document.querySelectorAll('.modal-close, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Formulários
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionSubmit();
        });

        document.getElementById('receiptForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReceiptSubmit();
        });

        // Filtros
    document.getElementById('filterType').addEventListener('change', () => this.filterTransactions());
    document.getElementById('filterCaixa').addEventListener('change', () => this.filterTransactions());

        // Relatórios
        // Garante que só o botão ao lado do imprimir tabela exporta CSV
        setTimeout(() => {
            const exportCsvBtn = document.getElementById('exportCsvBtn');
            if (exportCsvBtn) {
                exportCsvBtn.onclick = () => this.exportToCSV();
            }
            const printReportsBtn = document.getElementById('printReportsBtn');
            if (printReportsBtn) {
                printReportsBtn.onclick = () => this.printReportsTable();
            }
        }, 0);
        document.getElementById('reportPeriod').addEventListener('change', (e) => this.handleReportPeriodChange(e));
        document.getElementById('reportDateStart').addEventListener('change', () => this.updateReports());
        document.getElementById('reportDateEnd').addEventListener('change', () => this.updateReports());
        document.getElementById('reportCaixa').addEventListener('change', () => this.updateReports());
        document.getElementById('reportType').addEventListener('change', () => this.updateReports());

        // Configurações
        document.getElementById('churchDataForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChurchDataSubmit();
        });

        document.getElementById('selectLogoBtn').addEventListener('click', () => {
            document.getElementById('logoUpload').click();
        });

        document.getElementById('logoUpload').addEventListener('change', (e) => {
            this.handleLogoUpload(e);
        });

        document.getElementById('removeLogoBtn').addEventListener('click', () => {
            this.removeLogo();
        });

        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
                this.saveTheme();
            });
        });

        // Fechar modais ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // Autenticação
    handleLogin() {
        const userSelect = document.getElementById('userSelect');
        const password = document.getElementById('password').value;

        if (!userSelect.value) {
            this.showNotification('Digite o usuário', 'error');
            return;
        }
        if (!password) {
            this.showNotification('Digite uma senha', 'error');
            return;
        }

        // Envia username e senha para o backend validar
        try {
            // diagnostic removed: auth attempt from frontend
        } catch (e) { /* ignore */ }
        fetch(`${API_BASE_URL}/api/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userSelect.value, password })
            })
            .then(res => {
                // diagnostic removed: auth response status
                // Tentar parse seguro: se falhar, ler texto para diagn f3stico
                return res.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        // resposta inválida do servidor ao autenticar
                        return { success: false, message: 'Resposta do servidor inválida' };
                    }
                });
            })
            .then(result => {
            if (!result.success) {
                this.showNotification(result.message || 'Usuário ou senha inválidos', 'error');
                return;
            }
            this.currentUser = result.user.username;
            localStorage.setItem('currentUser', this.currentUser);
            localStorage.setItem('currentUserName', result.user.name);
            // Atualiza o nome do usuário no dropdown
            const currentUserDiv = document.getElementById('currentUser');
            if (currentUserDiv) {
                currentUserDiv.textContent = result.user.name;
            }
            this.switchScreen('mainApp');
            this.showNotification(`Bem-vindo, ${result.user.name}!`, 'success');
        })
        .catch((err) => {
            // Falha de rede ao chamar /api/auth
            this.showNotification('Erro ao autenticar (network)', 'error');
        });

    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserName');
        // Limpa o nome do usuário do dropdown
        const currentUserDiv = document.getElementById('currentUser');
        if (currentUserDiv) {
            currentUserDiv.textContent = '';
        }
        this.switchScreen('loginScreen');
        this.showNotification('Logout realizado com sucesso', 'success');
    }

    // Navegação
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    switchPage(pageId) {
        // diagnostic removed: switchPage called
        // Atualizar navegação
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Atualizar páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');

        // Carregar conteúdo específico da página
        switch (pageId) {
            case 'dashboard':
                this.loadTransactions().then(() => {
                    this.renderDashboard();
                });
                break;
            case 'transactions':
                this.renderTransactions();
                break;
            case 'receipts':
                this.renderReceipts();
                break;
            case 'reports':
                this.loadTransactions().then(() => {
                    this.renderReports();
                });
                break;
            case 'users':
                // Carregar usuários quando acessar a página
                if (userManager) {
                    userManager.loadUsers();
                }
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    // Modais
    openModal(modalId) {

        const modal = document.getElementById(modalId);
        if (!modal) {

            return;
        }
        modal.classList.add('active');

        // Definir data atual nos formulários
        const today = new Date().toISOString().split('T')[0];
        if (modalId === 'transactionModal') {

            const input = document.getElementById('transactionDate');
            if (input) {
                input.value = today;

            } else {

            }
        } else if (modalId === 'receiptModal') {
            const input = document.getElementById('receiptDate');
            if (input) {
                input.value = today;

            } else {

            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        
        // Limpar formulários
        if (modalId === 'transactionModal') {
            document.getElementById('transactionForm').reset();
            this.editingTransactionId = null;
            // Restaura título e botão
            const title = modal.querySelector('.modal-header h3');
            if (title) title.textContent = 'Nova Transação';
            const submitBtn = document.querySelector('#transactionForm .btn-primary');
            if (submitBtn) submitBtn.textContent = 'Salvar';
        } else if (modalId === 'receiptModal') {
            document.getElementById('receiptForm').reset();
        }
    }

    // Transações
    handleTransactionSubmit() {
    const form = document.getElementById('transactionForm');
    const formData = new FormData(form);
    const type = formData.get('transactionType');
    const caixa = formData.get('transactionCaixa');
    const person = formData.get('transactionPerson');
    const description = formData.get('transactionDescription');
    const amount = parseFloat(formData.get('transactionAmount'));
    let date = formData.get('transactionDate');
    if (date) {
        date = date + 'T03:00:00.000Z';
    }
    
    const transaction = {
        type,
        caixa,
        description,
        person,
        amount,
        date,
        user: this.currentUser
    };
    if (this.editingTransactionId) {
        // Edição
        this.updateTransaction(this.editingTransactionId, transaction);
    } else {
        // Nova
        this.addTransaction(transaction);
    }
    this.closeModal('transactionModal');
    // Restaura título e botão para o padrão ao fechar
    setTimeout(() => {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            const title = modal.querySelector('.modal-header h3');
            if (title) title.textContent = 'Nova Transação';
        }
        const submitBtn = document.querySelector('#transactionForm .btn-primary');
        if (submitBtn) submitBtn.textContent = 'Salvar';
        this.editingTransactionId = null;
    }, 300);
}

    async addTransaction(transaction) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });
            if (!res.ok) throw new Error('Error adding transaction');
            const newTransaction = await res.json();
            this.transactions.unshift(newTransaction);
            this.updateBalances();
            this.renderDashboard();
            this.renderTransactions();
            this.showNotification('Transação registrada com sucesso!', 'success');

            // Gerar recibo automaticamente
            const receipt = {
                name: newTransaction.person || '',
                type: newTransaction.type,
                amount: newTransaction.amount,
                date: newTransaction.date,
                notes: newTransaction.description || '',
                user: this.currentUser,
                transactionId: newTransaction.id
            };
            const receiptRes = await fetch(`${API_BASE_URL}/api/receipts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receipt)
            });
            if (receiptRes.ok) {
                const newReceipt = await receiptRes.json();
                this.receipts.unshift(newReceipt);
                // Abrir página de impressão do recibo
                setTimeout(() => {
                    this.printReceipt(newReceipt.id);
                }, 500);
            }
        } catch (err) {
            this.showNotification('Erro ao registrar transação', 'error');
        }
    }

    async updateTransaction(id, transaction) {
    try {
    const res = await fetch(`${API_BASE_URL}/api/transactions/${id}` , {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        if (!res.ok) throw new Error('Erro ao atualizar transação');
        const updated = await res.json();
        // Atualiza localmente
        const idx = this.transactions.findIndex(t => t.id === id);
        if (idx !== -1) this.transactions[idx] = updated;
        this.updateBalances();
        this.renderDashboard();
        this.renderTransactions();
        this.showNotification('Transação atualizada com sucesso!', 'success');
    } catch (err) {
        this.showNotification('Erro ao atualizar transação', 'error');
    }
}

    // Recibos
    async handleReceiptSubmit() {
        const form = document.getElementById('receiptForm');
        const formData = new FormData(form);
        const receipt = {
            name: formData.get('receiptName'),
            type: formData.get('receiptType'),
            amount: parseFloat(formData.get('receiptAmount')),
            date: formData.get('receiptDate'),
            notes: formData.get('receiptNotes'),
            user: this.currentUser // Envia o usuário logado
        };
        await this.addReceipt(receipt);
        this.closeModal('receiptModal');
    }

    async addReceipt(receipt) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/receipts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receipt)
            });
            if (!res.ok) throw new Error('Error adding receipt');
            const newReceipt = await res.json();
            this.receipts.unshift(newReceipt);
            this.renderReceipts();
            this.showNotification('Recibo gerado com sucesso!', 'success');
            // Imprimir recibo automaticamente após gerar
            setTimeout(() => {
                this.printReceipt(newReceipt.id);
            }, 500);
        } catch (err) {
            this.showNotification('Erro ao registrar recibo', 'error');
        }
    }

    // Renderização
    async renderDashboard() {
        await this.updateBalances();
        this.renderDashboardCards();
        this.renderRecentTransactions();
        this.renderDashboardChart();
    }

    // Renderiza os cards do dashboard dinamicamente
    renderDashboardCards() {
        const cardsGrid = document.getElementById('dashboardCards');
        if (!cardsGrid) return;
        cardsGrid.innerHTML = '';
        // Ícones padrão para alguns nomes conhecidos
        const iconMap = {
            escola: 'fa-graduation-cap',
            missoes: 'fa-globe',
            campo: 'fa-map-marker-alt',
            geral: 'fa-wallet',
        };
        // Para cada caixa, renderiza um card
        Object.entries(this.caixas).forEach(([key, name]) => {
            // Saldo atual
            const saldo = this.balances[key] || 0;
            // Percentual de variação neste mês
            const percent = this.getCaixaPercentThisMonth(key);
            // Ícone
            const icon = iconMap[key] || 'fa-cash-register';
            // Cor do percentual
            const trendClass = percent >= 0 ? 'trend positive' : 'trend negative';
            const trendIcon = percent >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            const percentText = percent === null ? '--' : `${percent > 0 ? '+' : ''}${percent}% este mês`;
            cardsGrid.innerHTML += `
                <div class="card balance-card">
                    <div class="card-header">
                        <h4>${name}</h4>
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="card-amount" id="balance-${key}">${this.formatCurrency(saldo)}</div>
                    <div class="card-footer">
                        <span class="${trendClass}"><i class="fas ${trendIcon}"></i> ${percentText}</span>
                    </div>
                </div>
            `;
        });
    }

    // Calcula o percentual de variação do saldo do caixa neste mês
    getCaixaPercentThisMonth(key) {
        // Filtra transações deste caixa no mês atual
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        // Saldo no início do mês
        let saldoInicio = 0;
        let saldoAtual = 0;
        this.transactions.forEach(t => {
            const caixaKey = t.caixa && typeof t.caixa === 'object' ? t.caixa.key : t.caixa;
            const tDate = new Date(t.date);
            // Antes do mês atual
            if (caixaKey === key && (t.type === 'entrada' || t.type === 'saida')) {
                if (tDate.getFullYear() < year || (tDate.getFullYear() === year && tDate.getMonth() < month)) {
                    if (t.type === 'entrada') saldoInicio += t.amount;
                    else if (t.type === 'saida') saldoInicio -= t.amount;
                }
            }
        });
        // Saldo atual já está em this.balances[key]
        saldoAtual = this.balances[key] || 0;
        // Saldo no início do mês pode ser zero
        // Se não houve saldo anterior e não houve movimentação, retorna null
        if (saldoInicio === 0 && saldoAtual === 0) return null;
        // Se saldoInicio for 0 mas houve movimentação, retorna 100% ou -100%
        if (saldoInicio === 0) return saldoAtual > 0 ? 100 : -100;
        // Calcula percentual
        const percent = Math.round(((saldoAtual - saldoInicio) / Math.abs(saldoInicio)) * 100);
        return percent;
    }

    renderDashboardChart() {
    const container = document.getElementById('dashboardChart');
    const legendContainer = document.getElementById('dashboardLegend');
    if (!container) return;
    if (!legendContainer) return;
        if (!this.transactions || this.transactions.length === 0) {
            container.innerHTML = '<p>Nenhum dado para exibir</p>';
            legendContainer.innerHTML = '';
            legendContainer.style.display = 'none';
            return;
        }

        // Calcular saldo real de cada caixa (entradas - saídas)
        const caixaSaldos = {};
        Object.keys(CAIXAS).forEach(caixa => {
            caixaSaldos[caixa] = 0;
        });
        this.transactions.forEach(transaction => {
            const caixaKey = transaction.caixa && typeof transaction.caixa === 'object' ? transaction.caixa.key : transaction.caixa;
            if (transaction.type === 'entrada') {
                if (caixaKey && caixaSaldos.hasOwnProperty(caixaKey)) caixaSaldos[caixaKey] += transaction.amount;
            } else if (transaction.type === 'saida') {
                if (caixaKey && caixaSaldos.hasOwnProperty(caixaKey)) caixaSaldos[caixaKey] -= transaction.amount;
            }
        });

        // Calcular totais para pizza
        const totais = Object.keys(caixaSaldos).map(caixa => Math.max(0, caixaSaldos[caixa]));
        const totalGeral = totais.reduce((a, b) => a + b, 0);
        if (totalGeral === 0) {
            container.innerHTML = '<p>Nenhum dado para exibir</p>';
            legendContainer.innerHTML = '';
            legendContainer.style.display = 'none';
            return;
        }

        // Tons de verde do sistema (usar variáveis CSS)
        const verdes = [
            getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#22c55e',
            '#4ade80',
            '#86efac',
            '#bbf7d0',
            getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#f8fafc'
        ];
        // Ordenar do maior para o menor para melhor visual
        const sorted = Object.entries(caixaSaldos)
            .map(([caixa, valor]) => ({
                key: caixa,
                nome: CAIXAS[caixa],
                valor: Math.max(0, valor)
            }))
            .sort((a, b) => b.valor - a.valor);

        // Gera os slices da pizza e percentuais
        let startAngle = 0;
        let slices = '';
        let percLabels = '';
        sorted.forEach((item, i) => {
            if (item.valor === 0) return;
            const angle = (item.valor / totalGeral) * 360;
            const endAngle = startAngle + angle;
            // Calcula coordenadas para arc
            const largeArc = angle > 180 ? 1 : 0;
            const r = 90;
            const cx = 130, cy = 130;
            const x1 = cx + r * Math.cos(Math.PI * startAngle / 180);
            const y1 = cy + r * Math.sin(Math.PI * startAngle / 180);
            const x2 = cx + r * Math.cos(Math.PI * endAngle / 180);
            const y2 = cy + r * Math.sin(Math.PI * endAngle / 180);
            const color = verdes[i % verdes.length];
            slices += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${color}" stroke="#fff" stroke-width="2" />`;
            // Percentual
            const percent = ((item.valor / totalGeral) * 100).toFixed(1).replace('.', ',');
            // Posição do label (meio do arco)
            const midAngle = startAngle + angle / 2;
            const labelR = r * 0.65;
            const lx = cx + labelR * Math.cos(Math.PI * midAngle / 180);
            const ly = cy + labelR * Math.sin(Math.PI * midAngle / 180) + 5;
            // Usa a cor verde escuro do sistema
            const percentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-dark').trim() || '#16a34a';
            percLabels += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="16" fill="${percentColor}" font-weight="bold">${percent}%</text>`;
            startAngle += angle;
        });

        // Legenda
        let legend = '';
        sorted.forEach((item, i) => {
            if (item.valor === 0) return;
            legend += `<div style="display:flex;align-items:center;margin-bottom:4px;"><span style="display:inline-block;width:16px;height:16px;background:${verdes[i % verdes.length]};margin-right:8px;border-radius:3px;"></span>${item.nome}: <b style="margin-left:4px;">${this.formatCurrency(item.valor)}</b></div>`;
        });

    container.innerHTML = `<svg width="260" height="260" viewBox="0 0 260 260" style="display:block;">${slices}${percLabels}</svg>`;
        legendContainer.innerHTML = legend;
        legendContainer.style.display = legend ? 'block' : 'none';
    }

    async updateBalances() {
        // Gera dinamicamente os saldos para todos os caixas existentes no backend
        this.balances = {};
        Object.keys(CAIXAS).forEach(key => {
            this.balances[key] = 0;
        });
        this.transactions.forEach(transaction => {
            const caixaKey = transaction.caixa && typeof transaction.caixa === 'object' ? transaction.caixa.key : transaction.caixa;
            if (transaction.type === 'entrada') {
                if (caixaKey && this.balances.hasOwnProperty(caixaKey)) {
                    this.balances[caixaKey] += transaction.amount;
                }
            } else if (transaction.type === 'saida') {
                if (caixaKey && this.balances.hasOwnProperty(caixaKey)) {
                    this.balances[caixaKey] -= transaction.amount;
                }
            }
        });
        // Atualizar elementos na tela
        Object.keys(this.balances).forEach(caixa => {
            const element = document.getElementById(`balance-${caixa}`);
            if (element) {
                element.textContent = this.formatCurrency(this.balances[caixa]);
            }
        });
    }

    renderRecentTransactions() {
        const container = document.getElementById('recentTransactionsList');
        const recentTransactions = this.transactions.slice(0, 5);
        
        container.innerHTML = recentTransactions.length > 0 
            ? recentTransactions.map(transaction => this.createTransactionHTML(transaction)).join('')
            : '<p class="no-data">Nenhuma transação recente</p>';
    }

    renderTransactions() {
        this.filterTransactions();
    }

    filterTransactions() {
        const typeFilter = document.getElementById('filterType').value;
        const caixaFilter = document.getElementById('filterCaixa').value;

        let filteredTransactions = this.transactions;

        // Se typeFilter for vazio ou 'todos', não filtra por tipo
        if (typeFilter && typeFilter !== 'todos') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }
        // Se caixaFilter for vazio ou 'todos', não filtra por caixa
        if (caixaFilter && caixaFilter !== 'todos') {
            filteredTransactions = filteredTransactions.filter(t => t.caixa === caixaFilter);
        }

        this.renderTransactionsList(filteredTransactions);
    }

    renderTransactionsList(transactions) {
        const container = document.getElementById('transactionsList');
        container.innerHTML = transactions.length > 0 
            ? transactions.map(transaction => this.createTransactionHTML(transaction)).join('')
            : '<p class="no-data">Nenhuma transação encontrada</p>';

        // Adiciona evento de clique para cada card de transação
        if (transactions.length > 0) {
            const items = container.querySelectorAll('.transaction-item');
            items.forEach((item, idx) => {
                item.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const transaction = transactions[idx];
                    if (!transaction.id) {
                        this.showNotification('Transação sem ID. Não é possível buscar no banco.', 'error');
                        return;
                    }
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/transactions/${transaction.id}`);
                        if (!res.ok) throw new Error('Transação não encontrada');
                        const data = await res.json();
                        this.openTransactionCrudModal(data);
                    } catch (err) {
                        this.showNotification('Erro ao buscar transação no banco', 'error');
                    }
                });
            });
        }
    }

    // Abre o modal de CRUD de transação
    openTransactionCrudModal(transaction) {
    const modal = document.getElementById('transactionCrudModal');

    if (!modal) {

        return;
    }
    document.getElementById('crudTransactionDesc').textContent = transaction.description || '';
    modal.classList.add('active');
    // Salva a transação selecionada para uso nos botões de editar/excluir
    this.selectedTransaction = transaction;

    // Configura botões do modal
    const editBtn = document.getElementById('editTransactionBtn');
    const deleteBtn = document.getElementById('deleteTransactionBtn');
    const closeBtn = document.getElementById('closeCrudTransactionModalBtn');

    if (editBtn) {
        editBtn.onclick = async () => {

            // Busca a transação mais atualizada do backend
            try {
                const res = await fetch(`${API_BASE_URL}/api/transactions/${transaction.id}`);
                if (!res.ok) throw new Error('Transação não encontrada');
                const data = await res.json();
                // Preenche o formulário de transação para edição
                this.populateTransactionForm(data);
                modal.classList.remove('active');
                // Abre o modal de edição
                this.openModal('transactionModal');
            } catch (err) {
                this.showNotification('Erro ao buscar transação para edição', 'error');
            }
        };
    }
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/transactions/${transaction.id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const data = await res.json();
                    this.showNotification(data.error || 'Erro ao excluir transação', 'error');
                    return;
                }
                this.showNotification('Transação excluída com sucesso!', 'success');
                modal.classList.remove('active');
                await this.loadTransactions();
                this.renderTransactions();
            } catch (err) {
                this.showNotification('Erro ao excluir transação', 'error');
            }
        };
    }
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
        };
    }
    }

    // Preenche o formulário de transação para edição
    populateTransactionForm(transaction) {

    document.getElementById('transactionType').value = transaction.type || '';
    document.getElementById('transactionCaixa').value = transaction.caixa?.key || transaction.caixaId || '';
    document.getElementById('transactionAmount').value = transaction.amount || '';
    document.getElementById('transactionDate').value = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '';
    document.getElementById('transactionDescription').value = transaction.description || '';
    document.getElementById('transactionPerson').value = transaction.person || '';
    
    // Salva id para update
    this.editingTransactionId = transaction.id;
    // Altera título e botão
    const modal = document.getElementById('transactionModal');
    if (modal) {
        const title = modal.querySelector('.modal-header h3');
        if (title) title.textContent = 'Alterar Transação';
    }
    const submitBtn = document.querySelector('#transactionForm .btn-primary');
    if (submitBtn) submitBtn.textContent = 'Atualizar';
}

    createTransactionHTML(transaction) {
        const typeIcon = {
            entrada: 'fas fa-arrow-down',
            saida: 'fas fa-arrow-up'
        };

        const typeLabel = {
            entrada: 'Entrada',
            saida: 'Saída'
        };

        const amountClass = transaction.type === 'entrada' ? 'positive' : 'negative';
        const amountPrefix = transaction.type === 'entrada' ? '+' : '-';

        // Nome do caixa
        let caixaNome = '';
        if (transaction.caixa && typeof transaction.caixa === 'object') {
            caixaNome = transaction.caixa.name || CAIXAS[transaction.caixa.key] || CAIXAS[transaction.caixa.id] || '';
        } else {
            caixaNome = CAIXAS[transaction.caixa] || '';
        }

        return `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-header">
                    <div class="transaction-title">
                        <i class="${typeIcon[transaction.type]}"></i>
                        ${transaction.description}
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountPrefix}${this.formatCurrency(transaction.amount)}
                    </div>
                </div>
                <div class="transaction-details">
                    <span class="transaction-caixa">${caixaNome}</span>
                    <span>${this.formatDate(transaction.date)}</span>
                </div>
            </div>
        `;
    }

    renderReceipts() {
        const container = document.getElementById('receiptsList');
        
        container.innerHTML = this.receipts.length > 0 
            ? this.receipts.map(receipt => this.createReceiptHTML(receipt)).join('')
            : '<p class="no-data">Nenhum recibo encontrado</p>';
    }

    createReceiptHTML(receipt) {
        // Ajusta classes e estilos para entrada/saída
        const isSaida = receipt.type === 'saida';
        const borderClass = isSaida ? 'receipt-item danger-border' : 'receipt-item success-border';
        const amountClass = isSaida ? 'receipt-amount danger-text' : 'receipt-amount success-text';
        const chipClass = isSaida ? 'receipt-type danger-chip' : 'receipt-type success-chip';
        return `
            <div class="${borderClass}" style="border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.08); margin-bottom: 16px;">
                <div class="receipt-header">
                    <div class="receipt-name">${receipt.name}</div>
                    <div class="${amountClass}">${this.formatCurrency(receipt.amount)}</div>
                </div>
                <div class="receipt-details">
                    <span class="${chipClass}">${this.getReceiptTypeLabel(receipt.type)}</span>
                    <span>${this.formatDate(receipt.date)}</span>
                </div>
                ${receipt.notes ? `<div class="receipt-notes">${receipt.notes}</div>` : ''}
                <div class="receipt-actions">
                    <button class="btn-secondary btn-sm" onclick="app.printReceipt(${receipt.id})">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
        `;
    }

    renderReports() {
        this.updateReports();
    }

    handleReportPeriodChange(event) {
        const period = event.target.value;
        const customDateGroup = document.getElementById('customDateGroup');
        const customDateGroup2 = document.getElementById('customDateGroup2');
        const reportDateStart = document.getElementById('reportDateStart');
        const reportDateEnd = document.getElementById('reportDateEnd');

        if (period === 'personalizado') {
            customDateGroup.style.display = 'flex';
            customDateGroup2.style.display = 'flex';
            
            // Definir datas padrão (últimos 30 dias)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            reportDateStart.value = startDate.toISOString().split('T')[0];
            reportDateEnd.value = endDate.toISOString().split('T')[0];
        } else {
            customDateGroup.style.display = 'none';
            customDateGroup2.style.display = 'none';
        }
        
        this.updateReports();
    }

    updateReports() {
        const period = document.getElementById('reportPeriod').value;
        const caixaFilter = document.getElementById('reportCaixa').value;
        const typeFilter = document.getElementById('reportType').value;

        let startDate, endDate;

        if (period === 'personalizado') {
            const reportDateStart = document.getElementById('reportDateStart').value;
            const reportDateEnd = document.getElementById('reportDateEnd').value;
            
            if (!reportDateStart || !reportDateEnd) {
                return;
            }
            
            startDate = new Date(reportDateStart + 'T00:00:00');
            endDate = new Date(reportDateEnd + 'T23:59:59');
        } else {
            const periodDays = parseInt(period);
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);
        }

        let filteredTransactions = this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        if (caixaFilter && caixaFilter !== 'todos') {
            filteredTransactions = filteredTransactions.filter(t => {
                if (t.caixa && typeof t.caixa === 'object') {
                    return t.caixa.key === caixaFilter;
                }
                return t.caixa === caixaFilter;
            });
        }
        // Permitir também o valor vazio como "todos"
        if (typeFilter && typeFilter !== 'todos') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }

        this.renderReportsTable(filteredTransactions);
    }

    renderReportsTable(transactions) {
        var container = document.getElementById('reportsTableContainer');
        if (!container) return;
        if (!transactions || transactions.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma transação encontrada para o período/caixa/tipo selecionado.</p>';
            return;
        }
        // Ordena por data (mais antiga para mais nova)
        transactions = transactions.slice().sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });

        var total = 0;
        var tableHtml = '';
        tableHtml += '<div class="extrato-table-wrapper">';
        tableHtml += '<table class="extrato-table">';
        tableHtml += '<thead><tr>' +
            '<th>Data</th>' +
            '<th>Tipo</th>' +
            '<th>Caixa</th>' +
            '<th>Ofertante</th>' +
            '<th>Descrição</th>' +
            '<th style="text-align:right;">Valor</th>' +
            '</tr></thead><tbody>';
        for (var i = 0; i < transactions.length; i++) {
            var t = transactions[i];
            var caixaNome = '';
            if (t.caixa && typeof t.caixa === 'object') {
                caixaNome = t.caixa.name || CAIXAS[t.caixa.key] || CAIXAS[t.caixa.id] || '';
            } else {
                caixaNome = CAIXAS[t.caixa] || '';
            }
            tableHtml += '<tr>';
            tableHtml += '<td>' + this.formatDate(t.date) + '</td>';
            tableHtml += '<td>' + (t.type.charAt(0).toUpperCase() + t.type.slice(1)) + '</td>';
            tableHtml += '<td>' + caixaNome + '</td>';
            tableHtml += '<td>' + (t.person || '-') + '</td>';
            tableHtml += '<td>' + t.description + '</td>';
            tableHtml += '<td class="extrato-valor ' + t.type + '" style="text-align:right;">' + this.formatCurrency(t.amount) + '</td>';
            tableHtml += '</tr>';
            total += Number(t.amount) || 0;
        }
        tableHtml += '</tbody>';
        // Totalizador
        tableHtml += '<tfoot><tr>' +
            '<td colspan="5" style="text-align:right;font-weight:bold;">Total</td>' +
            '<td style="text-align:right;font-weight:bold;">' + this.formatCurrency(total) + '</td>' +
            '</tr></tfoot>';
        tableHtml += '</table></div>';
        container.innerHTML = tableHtml;
    }

printReportsTable() {
        const container = document.getElementById('reportsTableContainer');
        if (!container) return;
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        // Cabeçalho com dados da igreja
        const church = this.churchData || {};
        const headerHtml = `
            <div style="text-align:center;margin-bottom:18px;">
                <h2 style="margin:0;color:#14532d;">${church.name || 'Nome da Igreja'}</h2>
                <div style="font-size:15px;color:#333;">${church.address || ''}</div>
                <div style="font-size:15px;color:#333;">${church.phone || ''} ${church.email ? ' | ' + church.email : ''}</div>
                <div style="font-size:14px;color:#555;">${church.cnpj ? 'CNPJ: ' + church.cnpj : ''}</div>
                <div style="margin-top:10px;font-size:18px;font-weight:bold;color:#166534;">Relatório de Transações</div>
            </div>
        `;
        printWindow.document.write(`
            <html>
            <head>
                <title>Relatório de Transações</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; background: transparent !important; color: #222; }
                    table { border-collapse: collapse; margin-bottom: 10px; box-shadow: 0 2px 8px #0001; background: #fff; width: auto; min-width: 100%; }
                    th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 15px; white-space: nowrap; }
                    th { background: #22c55e !important; color: #fff !important; letter-spacing: 1px; font-size: 16px; font-weight: 600; }
                    tr:nth-child(even) { background: #f6f8fa; }
                    tr:nth-child(odd) { background: #fff; }
                    h2 { margin-bottom: 0; color: #166534; }
                    table, th, td { table-layout: auto; }
                    .popup-print-btn { padding: 8px 14px; background: #22c55e; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
                    .popup-print-btn[disabled] { opacity: 0.5; cursor: default; }
                    tfoot td { color: #166534; font-weight: bold; font-size: 16px; }
                </style>
                <script>
                    // Auto-scale helper for popup; no auto-printing — user clicks the print button
                    function waitForImagesLoad(doc, callback) {
                        const imgs = Array.from(doc.images || []);
                        if (imgs.length === 0) return callback();
                        let loaded = 0;
                        imgs.forEach(img => {
                            if (img.complete) {
                                loaded++;
                                if (loaded === imgs.length) callback();
                            } else {
                                img.addEventListener('load', () => { loaded++; if (loaded === imgs.length) callback(); });
                                img.addEventListener('error', () => { loaded++; if (loaded === imgs.length) callback(); });
                            }
                        });
                    }
                    window.addEventListener('DOMContentLoaded', () => {
                        try {
                            waitForImagesLoad(document, () => {
                                // compute printable height (A4 height - margins)
                                const dpi = 96; // fallback
                                const mmToPx = mm => Math.round(mm * dpi / 25.4);
                                const printableHeightPx = mmToPx(297 - 20);
                                const container = document.querySelector('.receipt-container');
                                if (container) {
                                    const contentHeight = container.scrollHeight;
                                    if (contentHeight > printableHeightPx) {
                                        const scale = printableHeightPx / contentHeight;
                                        container.style.transform = 'scale(' + scale + ')';
                                        container.style.transformOrigin = 'top left';
                                        document.body.style.width = Math.round(210 * scale) + 'mm';
                                    }
                                }
                                // habilita o botão de impressão da popup
                                var btn = document.getElementById('popupPrintBtn');
                                if (btn) btn.disabled = false;
                            });
                        } catch (e) { try{ var btn = document.getElementById('popupPrintBtn'); if(btn) btn.disabled = false; }catch(e){} }
                    });
                </script>
            </head>
            <body>
                ${headerHtml}
                <div style="text-align:right;margin:12px 0;">
                    <button id="popupPrintBtn" class="popup-print-btn" disabled>IMPRIMIR RELATÓRIO</button>
                </div>
                ${container.innerHTML}
                <script>
                    (function(){
                        var btn = document.getElementById('popupPrintBtn');
                        if(!btn) return;
                        btn.addEventListener('click', function(){
                            if(window.focus) window.focus();
                            window.print();
                        });
                    })();
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
    }
    renderReportsChart(transactions) {
        const container = document.getElementById('reportsChart');
        if (transactions.length === 0) {
            container.innerHTML = '<p>Nenhum dado para exibir no período selecionado</p>';
            return;
        }

        // Agrupar transações por caixa
        const caixaData = {};
        Object.keys(CAIXAS).forEach(caixa => {
            caixaData[caixa] = {
                entradas: 0,
                saidas: 0
            };
        });
        transactions.forEach(transaction => {
            if (transaction.type === 'entrada') {
                caixaData[transaction.caixa].entradas += transaction.amount;
            } else if (transaction.type === 'saida') {
                caixaData[transaction.caixa].saidas += transaction.amount;
            }
        });

        // Calcular totais para pizza
        const totais = Object.keys(caixaData).map(caixa => Math.max(0, caixaData[caixa].entradas - caixaData[caixa].saidas));
        const totalGeral = totais.reduce((a, b) => a + b, 0);
        if (totalGeral === 0) {
            container.innerHTML = '<p>Nenhum dado para exibir no período selecionado</p>';
            return;
        }

        // Tons de verde do mais escuro para o mais claro
        const verdes = [
            '#22c55e', // mais escuro
            '#4ade80',
            '#86efac',
            '#bbf7d0',
            '#dcfce7'
        ];
        // Ordenar do maior para o menor para melhor visual
        const sorted = Object.entries(caixaData)
            .map(([caixa, data]) => ({
                key: caixa,
                nome: CAIXAS[caixa],
                valor: Math.max(0, data.entradas - data.saidas)
            }))
            .sort((a, b) => b.valor - a.valor);

        // Gera os slices da pizza
        let startAngle = 0;
        let slices = '';
        sorted.forEach((item, i) => {
            if (item.valor === 0) return;
            const angle = (item.valor / totalGeral) * 360;
            const endAngle = startAngle + angle;
            // Calcula coordenadas para arc
            const largeArc = angle > 180 ? 1 : 0;
            const r = 90;
            const cx = 130, cy = 130;
            const x1 = cx + r * Math.cos(Math.PI * startAngle / 180);
            const y1 = cy + r * Math.sin(Math.PI * startAngle / 180);
            const x2 = cx + r * Math.cos(Math.PI * endAngle / 180);
            const y2 = cy + r * Math.sin(Math.PI * endAngle / 180);
            const color = verdes[i % verdes.length];
            slices += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${color}" />`;
            startAngle = endAngle;
        });

        // Rótulos de dados nos slices
        let valueLabels = '';
        startAngle = 0;
        sorted.forEach((item, i) => {
            if (item.valor === 0) return;
            const angle = (item.valor / totalGeral) * 360;
            const midAngle = startAngle + angle / 2;
            const rValor = 90;
            const cx = 130, cy = 130;
            const xValor = cx + rValor * Math.cos(Math.PI * midAngle / 180);
            const yValor = cy + rValor * Math.sin(Math.PI * midAngle / 180);
            valueLabels += `<text x="${xValor}" y="${yValor}" text-anchor="middle" dominant-baseline="middle" alignment-baseline="middle" font-size="15" fill="#22c55e" font-weight="bold" stroke="#166534" stroke-width="2" paint-order="stroke" style="paint-order:stroke;">${this.formatCurrency(item.valor)}</text>`;
            startAngle += angle;
        });

        container.innerHTML = `
            <svg width="260" height="260" viewBox="0 0 260 260" style="display:block;margin:0 auto;">
                <g>
                    ${slices}
                    ${valueLabels}
                </g>
            </svg>
        `;
        // Renderiza a legenda no card separado
        const legendContainer = document.getElementById('reportsLegend');
        if (legendContainer) {
            const legendHtml = sorted.filter(item => item.valor > 0).map((item, i) => {
                const color = verdes[i % verdes.length];
                return `<span style="display:flex;align-items:center;font-size:13px;gap:4px;margin:4px 10px 4px 0;">
                    <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${color};border:1px solid #14532d;"></span>
                    <span style="color:#fff;font-weight:400;">${item.nome}</span>
                </span>`;
            }).join('');
            legendContainer.innerHTML = `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;">${legendHtml}</div>`;
            legendContainer.style.display = legendHtml ? 'block' : 'none';
        }
    }

    // Exportação CSV
    exportToCSV() {
        const period = document.getElementById('reportPeriod').value;
        let startDate, endDate;

        if (period === 'personalizado') {
            const reportDateStart = document.getElementById('reportDateStart').value;
            const reportDateEnd = document.getElementById('reportDateEnd').value;
            
            if (!reportDateStart || !reportDateEnd) {
                this.showNotification('Selecione as datas para exportar', 'error');
                return;
            }
            
            startDate = new Date(reportDateStart + 'T00:00:00');
            endDate = new Date(reportDateEnd + 'T23:59:59');
        } else {
            const periodDays = parseInt(period);
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);
        }


        // Corrige datas e nomes de caixa para exportação
        const filteredTransactions = this.transactions.filter(transaction => {
            // Garante que a data seja sempre válida para comparação
            let tDate = transaction.date;
            if (typeof tDate === 'string' && tDate.length === 10) {
                tDate = tDate + 'T00:00:00';
            }
            const transactionDate = new Date(tDate);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        if (filteredTransactions.length === 0) {
            this.showNotification('Nenhum dado para exportar no período selecionado', 'error');
            return;
        }


        const headers = ['Data', 'Tipo', 'Caixa', 'Descrição', 'Valor'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(transaction => {
                // Nome do caixa
                let caixaNome = '';
                if (transaction.caixa && typeof transaction.caixa === 'object') {
                    caixaNome = transaction.caixa.name || CAIXAS[transaction.caixa.key] || CAIXAS[transaction.caixa.id] || '';
                } else {
                    caixaNome = CAIXAS[transaction.caixa] || '';
                }
                
                return [
                    transaction.date,
                    transaction.type,
                    caixaNome,
                    `"${transaction.description}"`,
                    transaction.amount
                ].join(',');
            })
        ].join('\n');

    // Adiciona BOM para garantir acentuação correta em Excel e outros programas
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_igreja_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Relatório exportado com sucesso!', 'success');
    }

    // Utilitários
    // Gerenciamento de Caixas
    async renderCaixaList() {
        const caixaTableBody = document.getElementById('caixaTableBody');
        if (caixaTableBody) caixaTableBody.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';
        try {
            const res = await fetch(`${API_BASE_URL}/api/caixas`);
            const caixasArr = await res.json();
            this.caixas = {};
            if (caixaTableBody) caixaTableBody.innerHTML = '';
            caixasArr.forEach(caixa => {
                this.caixas[caixa.key] = caixa.name;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="caixa-nome">${caixa.name}</td>
                    <td class="caixa-edit"><button class="btn-secondary" onclick="app.editCaixa('${caixa.key}')"><i class="fas fa-edit"></i></button></td>
                    <td class="caixa-delete"><button class="btn-danger" onclick="app.deleteCaixa('${caixa.key}')"><i class="fas fa-trash"></i></button></td>
                `;
                if (caixaTableBody) caixaTableBody.appendChild(tr);
            });
            this.updateCaixaSelects();
        } catch (err) {
            if (caixaTableBody) caixaTableBody.innerHTML = '<tr><td colspan="3">Erro ao carregar caixas</td></tr>';
        }
    }

    async addCaixa() {
        const caixaNameInput = document.getElementById('caixaName');
        const name = caixaNameInput.value.trim();
        if (!name) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/caixas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (!res.ok) {
                const data = await res.json();
                this.showNotification(data.error || 'Erro ao incluir caixa', 'error');
                return;
            }
            caixaNameInput.value = '';
            await this.renderCaixaList();
            this.showNotification('Caixa incluído com sucesso!', 'success');
        } catch (err) {
            this.showNotification('Erro ao incluir caixa', 'error');
        }
    }

    async editCaixa(key) {
        // Busca o nome e key real do backend
        try {
            const res = await fetch(`${API_BASE_URL}/api/caixas`);
            const caixasArr = await res.json();
            const caixa = caixasArr.find(c => c.key === key);
            if (!caixa) {
                this.showNotification('Caixa não encontrado no banco.', 'error');
                return;
            }
            document.getElementById('caixaName').value = caixa.name;
            // Salva a key real do banco para update
            this.editingCaixaKey = caixa.key;
            document.getElementById('addCaixaBtn').style.display = 'none';
            document.getElementById('updateCaixaBtn').style.display = '';
            document.getElementById('cancelCaixaEditBtn').style.display = '';
        } catch (err) {
            this.showNotification('Erro ao buscar caixa para edição', 'error');
        }
    }

    async updateCaixa() {
        const caixaNameInput = document.getElementById('caixaName');
        const name = caixaNameInput.value.trim();
        if (!name || !this.editingCaixaKey) return;
        try {
            // Sempre usa a key original, não gera nova key!
            const res = await fetch(`${API_BASE_URL}/api/caixas/${this.editingCaixaKey}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (!res.ok) {
                const data = await res.json();
                this.showNotification(data.error || 'Erro ao alterar caixa', 'error');
                return;
            }
            this.editingCaixaKey = null;
            caixaNameInput.value = '';
            document.getElementById('addCaixaBtn').style.display = '';
            document.getElementById('updateCaixaBtn').style.display = 'none';
            document.getElementById('cancelCaixaEditBtn').style.display = 'none';
            await this.renderCaixaList();
            this.showNotification('Caixa alterado com sucesso!', 'success');
        } catch (err) {
            this.showNotification('Erro ao alterar caixa', 'error');
        }
    }

    async deleteCaixa(key) {
        if (!confirm('Tem certeza que deseja excluir este caixa?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/caixas/${key}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                this.showNotification(data.error || 'Erro ao excluir caixa', 'error');
                return;
            }
            await this.renderCaixaList();
            this.showNotification('Caixa excluído com sucesso!', 'success');
        } catch (err) {
            this.showNotification('Erro ao excluir caixa', 'error');
        }
    }

    cancelCaixaEdit() {
        this.editingCaixaKey = null;
        document.getElementById('caixaName').value = '';
        document.getElementById('addCaixaBtn').style.display = '';
        document.getElementById('updateCaixaBtn').style.display = 'none';
        document.getElementById('cancelCaixaEditBtn').style.display = 'none';
    }

    updateCaixaSelects() {
        // Atualiza todos os selects de caixa do sistema
        const selects = [
            document.getElementById('reportCaixa'),
            document.getElementById('filterCaixa'),
            document.getElementById('transactionCaixa')
        ].filter(Boolean);
        selects.forEach(select => {
            const current = select.value;
            // Se for um select de filtro, mantém a opção 'Todos'
            if (select.id === 'reportCaixa' || select.id === 'filterCaixa') {
                select.innerHTML = '<option value="todos">Todos</option>';
            } else {
                select.innerHTML = '<option value="">Selecione o caixa</option>';
            }
            Object.entries(this.caixas).forEach(([key, value]) => {
                select.innerHTML += `<option value="${key}">${value}</option>`;
            });
            // Mantém o valor selecionado se ainda existir
            if (current && this.caixas[current]) {
                select.value = current;
            } else {
                if (select.id === 'reportCaixa' || select.id === 'filterCaixa') {
                    select.value = 'todos';
                } else {
                    select.value = '';
                }
            }
        });
    }
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
    // Ajusta para UTC-3 (Brasília)
    const date = new Date(dateString);
    // Corrige para UTC-3 manualmente
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    // UTC-3 = -180 minutos
    const brt = new Date(utc - (3 * 60 * 60000));
    return brt.toLocaleDateString('pt-BR');
    }

    showNotification(message, type = 'info') {
        // Criar notificação simples
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Configurações
    renderSettings() {
        this.loadSettingsData();
        this.updateLogoPreview();
        this.updateThemeSelection();
    }

    loadSettingsData() {
        document.getElementById('churchName').value = this.churchData.name || '';
        document.getElementById('churchAddress').value = this.churchData.address || '';
        document.getElementById('churchPhone').value = this.churchData.phone || '';
        document.getElementById('churchEmail').value = this.churchData.email || '';
        document.getElementById('churchCnpj').value = this.churchData.cnpj || '';
    }

    handleChurchDataSubmit() {
        const updated = {
            id: this.churchData.id,
            name: document.getElementById('churchName').value,
            address: document.getElementById('churchAddress').value,
            phone: document.getElementById('churchPhone').value,
            email: document.getElementById('churchEmail').value,
            cnpj: document.getElementById('churchCnpj').value,
            logoUrl: this.churchLogo || null
        };
    fetch(`${API_BASE_URL}/api/church`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        })
        .then(async res => {
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok) {
                // Se não for JSON, mostra erro genérico
                if (!contentType.includes('application/json')) {
                    throw new Error('Erro interno no servidor. Tente novamente ou contate o suporte.');
                }
                const data = await res.json();
                throw new Error(data.error || 'Erro ao salvar dados da igreja');
            }
            if (!contentType.includes('application/json')) {
                throw new Error('Resposta inesperada do servidor.');
            }
            return res.json();
        })
        .then(data => {
            this.churchData = data;
            this.churchLogo = data.logoUrl || null;
            this.updateLogoPreview();
            this.showNotification('Dados da igreja salvos com sucesso!', 'success');
        })
        .catch(err => {
            this.showNotification(err.message, 'error');
        });
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this.showNotification('Por favor, selecione apenas arquivos de imagem.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            this.churchLogo = e.target.result;
            this.updateLogoPreview();
            // Salva logo no banco junto com churchData
            this.handleChurchDataSubmit();
        };
        reader.readAsDataURL(file);
    }

    updateLogoPreview() {
        const preview = document.getElementById('logoPreview');
        const removeBtn = document.getElementById('removeLogoBtn');
        if (this.churchLogo) {
            preview.innerHTML = `<img src="${this.churchLogo}" alt="Logo da Igreja">`;
            removeBtn.style.display = 'inline-flex';
        } else {
            preview.innerHTML = `
                <i class="fas fa-church"></i>
                <span>Nenhuma logo selecionada</span>
            `;
            removeBtn.style.display = 'none';
        }
    }

    removeLogo() {
        this.churchLogo = null;
        this.updateLogoPreview();
        // Remove logo do banco junto com churchData
        this.handleChurchDataSubmit();
        this.showNotification('Logo removida com sucesso!', 'success');
    }

    updateThemeSelection() {
        const lightRadio = document.getElementById('themeLight');
        const darkRadio = document.getElementById('themeDark');

        if (this.currentTheme === 'dark') {
            darkRadio.checked = true;
        } else {
            lightRadio.checked = true;
        }
    }

    // Impressão de recibos
    printReceipt(receiptId) {
        const receipt = this.receipts.find(r => r.id === receiptId);
        if (!receipt) {
            this.showNotification('Recibo não encontrado', 'error');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        const printContent = this.generateReceiptHTML(receipt);
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        // Do not invoke print from the opener; the generated HTML includes a script
        // that scales the content to the printable A4 area and calls window.print()
        // after images have loaded. This avoids double-printing and ensures correct scaling.
    }

    generateReceiptHTML(receipt) {
        const churchName = this.churchData.name || 'Igreja';
        const churchAddress = this.churchData.address || '';
        const churchPhone = this.churchData.phone || '';
        const churchEmail = this.churchData.email || '';
        const churchCnpj = this.churchData.cnpj || '';
        
        // Garantir que temos o usuário atual (recuperar do localStorage se necessário)
        const currentUserKey = this.currentUser || localStorage.getItem('currentUser');
        const currentUserName = localStorage.getItem('currentUserName') || USUARIOS[currentUserKey] || 'Sistema';
        
        console.log('Debug - currentUser:', this.currentUser, 'localStorage:', localStorage.getItem('currentUser'), 'currentUserName:', currentUserName);

        // Cores padrão (entrada)
        let gradMain = 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)';
        let gradBorder = 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)';
        let gradAmount = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
        let borderAmount = '#bbf7d0';
        let amountColor = '#15803d';
        let labelColor = '#166534';
        let badgeGrad = 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)';
        let titleColor = '#22c55e';
        let watermarkColor = 'rgba(34, 197, 94, 0.03)';
        // Se for saída, muda para vermelho
        if (receipt.type === 'saida') {
            gradMain = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
            gradBorder = 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)';
            gradAmount = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
            borderAmount = '#fecaca';
            amountColor = '#b91c1c';
            labelColor = '#991b1b';
            badgeGrad = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
            titleColor = '#ef4444';
            watermarkColor = 'rgba(239, 68, 68, 0.04)';
        }
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recibo - ${receipt.name}</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    /* Forçar A4 retrato na impressão e ajustar o conteúdo à área imprimível */
                    @page { size: A4 portrait; margin: 10mm; }
                    @media print {
                        html, body {
                            width: 210mm;
                            height: 297mm;
                            margin: 0;
                            padding: 0;
                            background: white !important;
                            -webkit-print-color-adjust: exact;
                            overflow: hidden; /* importante para evitar criação de páginas extras */
                        }
                        /* Posiciona o container exatamente dentro da área imprimível
                           (margens definidas em @page: 10mm) e limita sua altura para
                           evitar quebra automática em múltiplas páginas */
                        .receipt-container {
                            position: absolute !important;
                            top: 10mm !important;
                            left: 10mm !important;
                            right: 10mm !important;
                            height: calc(297mm - 20mm) !important; /* área imprimível vertical */
                            width: calc(210mm - 20mm) !important; /* área imprimível horizontal */
                            max-width: calc(210mm - 20mm) !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            border-radius: 0 !important;
                            page-break-inside: avoid;
                            overflow: hidden !important; /* esconde conteúdo que exceder após qualquer rounding */
                            transform-origin: top left;
                        }
                        /* Escala automática: se o conteúdo exceder a altura, o navegador deve ajustar conforme settings da impressora.
                           Aqui garantimos tipografia e espaçamentos adequados para A4 */
                        .receipt-header { padding: 24px 16px 18px !important; }
                        .receipt-body { padding: 18px 12px !important; }
                        .receipt-title { font-size: 22px !important; margin-bottom: 18px !important; }
                        .receipt-content { font-size: 13px !important; margin: 16px 0 !important; }
                        .receipt-amount-container { margin: 18px 0 !important; padding: 14px !important; border-radius: 10px !important; }
                        .receipt-amount { font-size: 22px !important; }
                        .receipt-details { margin: 14px 0 !important; padding: 10px !important; border-radius: 8px !important; }
                        .receipt-detail { margin: 6px 0 !important; padding: 6px 0 !important; }
                        .receipt-footer { margin-top: 8px !important; padding-top: 8px !important; }
                        .receipt-footer-note { padding: 8px !important; margin-top: 8px !important; }
                        .church-logo { max-width: 60px !important; max-height: 60px !important; margin-bottom: 10px !important; padding: 4px !important; }
                        .watermark { font-size: 48px !important; }
                        .receipt-number, .receipt-date { font-size: 10px !important; padding: 4px 8px !important; }
                        img { max-width: 100% !important; height: auto !important; }
                        .footer-print-btn { padding: 10px 18px; background: #1f9d55; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
                        .footer-print-btn[disabled] { opacity: 0.5; cursor: default; }
                        /* Esconder botão apenas na impressão real */
                        .footer-print-btn { display: none !important; }
                    }
                    /* Visualização não impressa */
                    body { margin: 0; padding: 0; background: white !important; min-height: auto; }
                    .receipt-container { box-shadow: none; margin: 0; border-radius: 0; max-width: none; }
                    .receipt-header { border-radius: 0; }
                    .receipt-body { padding: 30px 20px; }
                    /* Evitar quebras indesejadas dentro do recibo */
                    .receipt-container, .receipt-body, .receipt-header { page-break-inside: avoid; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }

                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #1a202c;
                        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                        margin: 0;
                        padding: 20px;
                        min-height: 100vh;
                    }
                    @media print {
                        body {
                            background: white !important;
                            padding: 0;
                            min-height: auto;
                        }
                    }
                    .receipt-container {
                        max-width: 700px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        overflow: hidden;
                        position: relative;
                    }
                    .receipt-header {
                        background: ${gradMain};
                        color: white;
                        padding: 40px 30px 30px;
                        text-align: center;
                        position: relative;
                    }
                    
                    .receipt-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/>'); /* URL codificada para evitar problemas de parsing */
                        opacity: 0.3;
                    }
                    
                    .church-logo {
                        max-width: 120px;
                        max-height: 120px;
                        margin: 0 auto 20px;
                        display: block;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        background: white;
                        padding: 10px;
                    }
                    
                    .church-name {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 8px;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    .church-info {
                        font-size: 14px;
                        opacity: 0.9;
                        margin-bottom: 4px;
                        font-weight: 400;
                    }
                    
                    .receipt-number {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: rgba(255, 255, 255, 0.2);
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        backdrop-filter: blur(10px);
                    }
                    
                    .receipt-body {
                        padding: 40px 30px;
                    }
                    
                    .receipt-title {
                        font-size: 32px;
                        font-weight: 700;
                        text-align: center;
                        margin-bottom: 40px;
                        color: ${titleColor};
                        position: relative;
                    }
                    .receipt-title::after {
                        content: '';
                        position: absolute;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 60px;
                        height: 3px;
                        background: ${gradBorder};
                        border-radius: 2px;
                    }
                    
                    .receipt-content {
                        margin: 30px 0;
                        font-size: 18px;
                        line-height: 1.8;
                        color: #4a5568;
                    }
                    
                    .receipt-amount-container {
                        text-align: center;
                        margin: 40px 0;
                        padding: 30px;
                        background: ${gradAmount};
                        border-radius: 16px;
                        border: 2px solid ${borderAmount};
                        position: relative;
                        overflow: hidden;
                    }
                    .receipt-amount-container::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: ${gradBorder};
                    }
                    .receipt-amount-label {
                        font-size: 16px;
                        color: ${labelColor};
                        font-weight: 600;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .receipt-amount {
                        font-size: 36px;
                        font-weight: 700;
                        color: ${amountColor};
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    .receipt-details {
                        margin: 30px 0;
                        background: #f8fafc;
                        border-radius: 12px;
                        padding: 25px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .receipt-detail {
                        margin: 15px 0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    .receipt-detail:last-child {
                        border-bottom: none;
                    }
                    
                    .receipt-detail strong {
                        min-width: 140px;
                        color: #374151;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .receipt-detail span {
                        color: #1f2937;
                        font-weight: 500;
                        text-align: right;
                        flex: 1;
                    }
                    
                                         .receipt-footer {
                         margin-top: 50px;
                         text-align: center;
                         padding-top: 30px;
                         border-top: 2px solid #e5e7eb;
                         position: relative;
                     }
                     
                     .receipt-footer-note {
                         background: #f8fafc;
                         border-radius: 8px;
                         padding: 20px;
                         border: 1px solid #e2e8f0;
                         margin-top: 20px;
                     }
                     
                     .receipt-footer-note p {
                         margin: 5px 0;
                         font-size: 12px;
                         color: #64748b;
                         font-weight: 400;
                         line-height: 1.4;
                     }
                     
                     .receipt-footer-note p:first-child {
                         font-weight: 600;
                         color: #475569;
                         font-size: 13px;
                     }
                    
                    .receipt-type-badge {
                        display: inline-block;
                        background: ${badgeGrad};
                        color: white;
                        padding: 6px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
                    }
                    
                    .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .print-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
                    }
                    
                    .receipt-date {
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        background: rgba(255, 255, 255, 0.2);
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        backdrop-filter: blur(10px);
                    }
                    
                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 120px;
                        color: ${watermarkColor};
                        font-weight: 900;
                        pointer-events: none;
                        z-index: 0;
                    }
                    
                    .receipt-body {
                        position: relative;
                        z-index: 1;
                    }
                </style>
            </head>
            <body>
                <!-- print button removed from top; printing will be triggered via footer button -->
                
                <div class="receipt-container">
                    <div class="watermark">RECIBO</div>
                    
                    <div class="receipt-header">
                        <div class="receipt-number">#${receipt.id}</div>
                        <div class="receipt-date">${this.formatDate(receipt.date)}</div>
                        
                        ${this.churchLogo ? `<img src="${this.churchLogo}" alt="Logo" class="church-logo">` : ''}
                        <div class="church-name">${churchName}</div>
                        ${churchAddress ? `<div class="church-info"><i class="fas fa-map-marker-alt"></i> ${churchAddress}</div>` : ''}
                        ${churchPhone ? `<div class="church-info"><i class="fas fa-phone"></i> ${churchPhone}</div>` : ''}
                        ${churchEmail ? `<div class="church-info"><i class="fas fa-envelope"></i> ${churchEmail}</div>` : ''}
                        ${churchCnpj ? `<div class="church-info"><i class="fas fa-id-card"></i> CNPJ: ${churchCnpj}</div>` : ''}
                    </div>
                    
                    <div class="receipt-body">
                        <div class="receipt-title">RECIBO</div>
                        
                        <div class="receipt-content">
                            Recebemos de <strong style="color: #15803d;">${receipt.name}</strong> a quantia de:
                        </div>
                        
                        <div class="receipt-amount-container">
                            <div class="receipt-amount-label">Valor Recebido</div>
                            <div class="receipt-amount">${this.formatCurrency(receipt.amount)}</div>
                        </div>
                        
                        <div class="receipt-content">
                            Referente a: <span class="receipt-type-badge">${receipt.notes || receipt.description || '-'}</span>
                        </div>
                        
                        <div class="receipt-details">
                            <div class="receipt-detail">
                                <strong><i class="fas fa-calendar"></i> Data:</strong>
                                <span>${this.formatDate(receipt.date)}</span>
                            </div>
                            <div class="receipt-detail">
                                <strong><i class="fas fa-tag"></i> Tipo:</strong>
                                <span>${this.getReceiptTypeLabel(receipt.type)}</span>
                            </div>
                            ${receipt.notes ? `
                            <div class="receipt-detail">
                                <strong><i class="fas fa-sticky-note"></i> Observações:</strong>
                                <span>${receipt.notes}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                                                 <div class="receipt-footer">
                             <div class="receipt-footer-note">
                                     <p>Este recibo foi emitido eletronicamente pelo Sistema de Controle Financeiro da Igreja</p>
                                     <p>Usuário: ${currentUserName} | Data de emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                                     <div style="margin-top:12px;text-align:center;">
                                         <button id="receiptPrintBtn" class="footer-print-btn" disabled>IMPRIMIR RECIBO</button>
                                     </div>
                                 </div>
                         </div>
                    </div>
                </div>
                <script>
                    (function(){
                        // calcula quantos pixels correspondem a 1mm no dispositivo atual
                        function pxPerMm(){
                            try{
                                var el = document.createElement('div');
                                el.style.width = '1mm';
                                el.style.position = 'absolute';
                                el.style.visibility = 'hidden';
                                document.body.appendChild(el);
                                var px = el.getBoundingClientRect().width || 0;
                                document.body.removeChild(el);
                                return px || (96/25.4); // fallback para 96dpi
                            } catch(e) { return (96/25.4); }
                        }

                        function waitImagesLoaded(){
                            var imgs = Array.from(document.images || []);
                            if(imgs.length === 0) return Promise.resolve();
                            return Promise.all(imgs.map(function(img){
                                if(img.complete) return Promise.resolve();
                                return new Promise(function(res){ img.onload = img.onerror = res; });
                            }));
                        }

                        function waitFontsLoaded(){
                            if(document.fonts && document.fonts.ready) return document.fonts.ready.catch(function(){/*ignore*/});
                            return Promise.resolve();
                        }

                        function scaleToFit(){
                            var container = document.querySelector('.receipt-container');
                            if(!container) return;
                            var pxmm = pxPerMm();
                            var printableHeightMm = 297 - (2 * 10); // A4 height minus 10mm margins top/bottom
                            var printableHeightPx = printableHeightMm * pxmm;
                            var printableWidthMm = 210 - (2 * 10);
                            var printableWidthPx = printableWidthMm * pxmm;

                            // remove transform temporariamente para medir altura real
                            container.style.transform = '';
                            container.style.transformOrigin = 'top left';

                            // força largura imprimível para evitar reflow horizontal
                            container.style.width = printableWidthPx + 'px';
                            container.style.maxWidth = printableWidthPx + 'px';
                            container.style.boxSizing = 'border-box';

                            // usar getBoundingClientRect para altura real renderizada
                            var rect = container.getBoundingClientRect();
                            var contentHeight = rect.height;

                            // pequena tolerância para diferenças de rounding
                            var tolerance = Math.max(4, pxmm * 1); // 1mm ou 4px
                            if(contentHeight > (printableHeightPx - tolerance)){
                                var scale = (printableHeightPx - tolerance) / contentHeight;
                                // aplica escala e mantém origem no topo-esquerda
                                container.style.transform = 'scale(' + scale + ')';
                                container.style.transformOrigin = 'top left';
                                // Ajusta o tamanho do body para a área imprimível para prevenir quebra de página adicional
                                document.body.style.height = printableHeightPx + 'px';
                                document.documentElement.style.height = printableHeightPx + 'px';
                                // centraliza horizontalmente considerando a escala
                                var offsetLeft = (210*pxmm - 20*pxmm - (printableWidthPx * scale)) / 2;
                                if(!isNaN(offsetLeft)) container.style.left = (10*pxmm + Math.max(0, offsetLeft)) + 'px';
                            } else {
                                document.body.style.height = 'auto';
                                document.documentElement.style.height = 'auto';
                                container.style.left = '10mm';
                            }
                        }

                        // espera imagens e fontes carregarem e só habilita o botão de impressão
                        Promise.all([waitImagesLoaded(), waitFontsLoaded()]).then(function(){
                            setTimeout(function(){
                                var btn = document.querySelector('.footer-print-btn');
                                if(btn) btn.disabled = false;
                            }, 120);
                        });

                        // Registra handler não-inline para o botão de impressão do recibo
                        try {
                            var receiptBtn = document.getElementById('receiptPrintBtn');
                            if (receiptBtn) {
                                receiptBtn.addEventListener('click', function(){
                                    try { if (window.scaleToFit) window.scaleToFit(); } catch(e) {}
                                    setTimeout(function(){ if (window.focus) window.focus(); window.print(); }, 250);
                                });
                            }
                        } catch(e) { /* ignore */ }
                    })();
                </script>
            </body>
            </html>
        `;
    }
}

// ============ GERENCIAMENTO DE USUÁRIOS ============

class UserManager {
    constructor() {
        this.currentEditingUser = null;
        this.initEventListeners();
    }

    initEventListeners() {
        // Botões da seção de usuários
        document.getElementById('newUserBtn')?.addEventListener('click', () => this.openNewUserModal());
        document.getElementById('refreshUsersBtn')?.addEventListener('click', () => this.loadUsers());
        
        // Modal de usuário
        document.getElementById('cancelUser')?.addEventListener('click', () => this.closeUserModal());
        document.getElementById('userForm')?.addEventListener('submit', (e) => this.handleUserSubmit(e));
        
        // Fechar modal ao clicar no X
        document.querySelector('#userModal .modal-close')?.addEventListener('click', () => this.closeUserModal());
        
        // Fechar modal ao clicar fora
        document.getElementById('userModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'userModal') this.closeUserModal();
        });
    }

    async loadUsers() {
        try {
            const tableBody = document.getElementById('usersTableBody');
            if (!tableBody) return;

            // Mostrar loading
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="users-loading">
                        <i class="fas fa-spinner fa-spin"></i> Carregando usuários...
                    </td>
                </tr>
            `;

            const response = await fetch(`${API_BASE_URL}/api/users`);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const users = await response.json();

            if (users.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="users-empty">
                            <i class="fas fa-users"></i><br>
                            Nenhum usuário encontrado
                        </td>
                    </tr>
                `;
                return;
            }

            // Renderizar usuários
            tableBody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.name}</td>
                    <td><span class="role-badge ${user.role}">${this.getRoleLabel(user.role)}</span></td>
                    <td>
                        <div class="user-actions">
                            <button class="btn btn-edit" onclick="userManager.editUser(${user.id})" title="Editar usuário">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-delete" onclick="userManager.deleteUser(${user.id}, '${user.username}')" title="Excluir usuário">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            document.getElementById('usersTableBody').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #dc2626; padding: 20px;">
                        <i class="fas fa-exclamation-triangle"></i> Erro ao carregar usuários: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    getRoleLabel(role) {
        const labels = {
            'admin': 'Administrador',
            'tesoureiro': 'Tesoureiro',
            'secretario': 'Secretário'
        };
        return labels[role] || role;
    }

    openNewUserModal() {
        this.currentEditingUser = null;
        document.getElementById('userModalTitle').textContent = 'Novo Usuário';
        document.getElementById('saveUserBtn').textContent = 'Salvar';
        document.getElementById('passwordHint').classList.add('hidden');
        document.getElementById('userPassword').required = true;
        
        // Limpar formulário
        const form = document.getElementById('userForm');
        form.reset();
        
        // Mostrar modal
        document.getElementById('userModal').style.display = 'flex';
    }

    async editUser(userId) {
        try {
            // Buscar dados do usuário
            const response = await fetch(`${API_BASE_URL}/api/users`);
            const users = await response.json();
            const user = users.find(u => u.id === userId);
            
            if (!user) {
                alert('Usuário não encontrado');
                return;
            }

            this.currentEditingUser = user;
            document.getElementById('userModalTitle').textContent = 'Editar Usuário';
            document.getElementById('saveUserBtn').textContent = 'Atualizar';
            document.getElementById('passwordHint').classList.remove('hidden');
            document.getElementById('userPassword').required = false;

            // Preencher formulário
            document.getElementById('userUsername').value = user.username;
            document.getElementById('userName').value = user.name;
            document.getElementById('userPassword').value = '';
            document.getElementById('userRole').value = user.role;

            // Mostrar modal
            document.getElementById('userModal').style.display = 'flex';

        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            alert('Erro ao carregar dados do usuário: ' + error.message);
        }
    }

    async deleteUser(userId, username) {
        if (!confirm(`Tem certeza que deseja excluir o usuário "${username}"?\n\nEsta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Erro ${response.status}`);
            }

            alert('Usuário excluído com sucesso!');
            this.loadUsers(); // Recarregar lista

        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário: ' + error.message);
        }
    }

    async handleUserSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            name: formData.get('name'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        // Validações frontend
        if (!userData.username || userData.username.length < 3) {
            alert('Username deve ter pelo menos 3 caracteres');
            return;
        }

        if (!userData.name) {
            alert('Nome é obrigatório');
            return;
        }

        if (!userData.role) {
            alert('Role é obrigatório');
            return;
        }

        if (!this.currentEditingUser && (!userData.password || userData.password.length < 6)) {
            alert('Senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (this.currentEditingUser && userData.password && userData.password.length < 6) {
            alert('Se informada, a senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            let response;
            
            if (this.currentEditingUser) {
                // Editar usuário existente
                const updateData = { ...userData };
                if (!updateData.password) {
                    delete updateData.password; // Não enviar senha vazia
                }
                
                response = await fetch(`${API_BASE_URL}/api/users/${this.currentEditingUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
            } else {
                // Criar novo usuário
                response = await fetch(`${API_BASE_URL}/api/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Erro ${response.status}`);
            }

            const action = this.currentEditingUser ? 'atualizado' : 'criado';
            alert(`Usuário ${action} com sucesso!`);
            
            this.closeUserModal();
            this.loadUsers(); // Recarregar lista

        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert('Erro ao salvar usuário: ' + error.message);
        }
    }

    closeUserModal() {
        document.getElementById('userModal').style.display = 'none';
        this.currentEditingUser = null;
    }
}

// Instância global do gerenciador de usuários
let userManager;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    userManager = new UserManager();
});

