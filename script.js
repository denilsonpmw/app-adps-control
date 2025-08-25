// Configurações e dados iniciais
const CAIXAS = {
    escola: 'Escola Bíblica',
    missoes: 'Missões',
    campo: 'Missões do Campo',
    geral: 'Geral'
};

const USUARIOS = {
    admin: 'Administrador',
    tesoureiro: 'Tesoureiro',
    secretario: 'Secretário'
};

// Classe principal do aplicativo
class ChurchFinanceApp {
    constructor() {
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
            name: '',
            address: '',
            phone: '',
            email: '',
            cnpj: ''
        };
        this.churchLogo = null;
        
        this.init();
    }

    init() {
        // Limpar localStorage para forçar recarregamento dos dados de exemplo
        localStorage.removeItem('churchTransactions');
        localStorage.removeItem('churchReceipts');
        
        this.loadData();
        this.loadTheme();
        this.setupEventListeners();
        this.updateBalances();
        this.renderDashboard();
    }

    // Gerenciamento de dados com localStorage
    loadData() {
        const savedTransactions = localStorage.getItem('churchTransactions');
        const savedReceipts = localStorage.getItem('churchReceipts');
        const savedBalances = localStorage.getItem('churchBalances');
        const savedChurchData = localStorage.getItem('churchData');
        const savedChurchLogo = localStorage.getItem('churchLogo');

        if (savedTransactions) {
            this.transactions = JSON.parse(savedTransactions);
        } else {
            // Dados de exemplo para demonstração
            this.transactions = [
                // Janeiro 2024
                {
                    id: 1,
                    type: 'entrada',
                    caixa: 'escola',
                    description: 'Oferta Escola Bíblica',
                    amount: 150.00,
                    date: '2024-01-15',
                    timestamp: Date.now() - 86400000
                },
                {
                    id: 2,
                    type: 'entrada',
                    caixa: 'missoes',
                    description: 'Carnê de Missões - João Silva',
                    amount: 50.00,
                    date: '2024-01-14',
                    timestamp: Date.now() - 172800000
                },
                {
                    id: 3,
                    type: 'saida',
                    caixa: 'geral',
                    description: 'Material de expediente',
                    amount: 25.50,
                    date: '2024-01-13',
                    timestamp: Date.now() - 259200000
                },
                {
                    id: 4,
                    type: 'entrada',
                    caixa: 'geral',
                    description: 'Oferta de Culto',
                    amount: 320.00,
                    date: '2024-01-12',
                    timestamp: Date.now() - 345600000
                },
                {
                    id: 5,
                    type: 'entrada',
                    caixa: 'campo',
                    description: 'Doação para Missões do Campo',
                    amount: 200.00,
                    date: '2024-01-11',
                    timestamp: Date.now() - 432000000
                },
                {
                    id: 6,
                    type: 'transferencia',
                    caixa: 'geral',
                    description: 'Transferência para Escola Bíblica',
                    amount: 100.00,
                    transferTo: 'escola',
                    date: '2024-01-10',
                    timestamp: Date.now() - 518400000
                },
                {
                    id: 7,
                    type: 'saida',
                    caixa: 'missoes',
                    description: 'Envio para Missionário',
                    amount: 150.00,
                    date: '2024-01-09',
                    timestamp: Date.now() - 604800000
                },
                {
                    id: 8,
                    type: 'entrada',
                    caixa: 'escola',
                    description: 'Oferta Especial - Escola Bíblica',
                    amount: 75.00,
                    date: '2024-01-08',
                    timestamp: Date.now() - 691200000
                },
                {
                    id: 9,
                    type: 'saida',
                    caixa: 'geral',
                    description: 'Manutenção do Prédio',
                    amount: 180.00,
                    date: '2024-01-07',
                    timestamp: Date.now() - 777600000
                },
                {
                    id: 10,
                    type: 'entrada',
                    caixa: 'missoes',
                    description: 'Carnê de Missões - Maria Santos',
                    amount: 80.00,
                    date: '2024-01-06',
                    timestamp: Date.now() - 864000000
                },
                {
                    id: 11,
                    type: 'transferencia',
                    caixa: 'geral',
                    description: 'Transferência para Missões',
                    amount: 120.00,
                    transferTo: 'missoes',
                    date: '2024-01-05',
                    timestamp: Date.now() - 950400000
                },
                {
                    id: 12,
                    type: 'entrada',
                    caixa: 'campo',
                    description: 'Oferta para Missões do Campo',
                    amount: 95.00,
                    date: '2024-01-04',
                    timestamp: Date.now() - 1036800000
                },
                {
                    id: 13,
                    type: 'saida',
                    caixa: 'escola',
                    description: 'Material Didático',
                    amount: 45.00,
                    date: '2024-01-03',
                    timestamp: Date.now() - 1123200000
                },
                {
                    id: 14,
                    type: 'entrada',
                    caixa: 'geral',
                    description: 'Oferta de Culto',
                    amount: 280.00,
                    date: '2024-01-02',
                    timestamp: Date.now() - 1209600000
                },
                {
                    id: 15,
                    type: 'saida',
                    caixa: 'campo',
                    description: 'Apoio Missionário',
                    amount: 90.00,
                    date: '2024-01-01',
                    timestamp: Date.now() - 1296000000
                },
                // Dezembro 2023
                {
                    id: 26,
                    type: 'entrada',
                    caixa: 'geral',
                    description: 'Oferta de Natal',
                    amount: 450.00,
                    date: '2023-12-31',
                    timestamp: Date.now() - 1382400000
                },
                {
                    id: 27,
                    type: 'entrada',
                    caixa: 'missoes',
                    description: 'Carnê de Missões - Pedro Costa',
                    amount: 60.00,
                    date: '2023-12-30',
                    timestamp: Date.now() - 1468800000
                },
                {
                    id: 28,
                    type: 'transferencia',
                    caixa: 'geral',
                    description: 'Transferência para Campo',
                    amount: 80.00,
                    transferTo: 'campo',
                    date: '2023-12-29',
                    timestamp: Date.now() - 1555200000
                },
                {
                    id: 29,
                    type: 'saida',
                    caixa: 'geral',
                    description: 'Decoração de Natal',
                    amount: 120.00,
                    date: '2023-12-28',
                    timestamp: Date.now() - 1641600000
                },
                {
                    id: 30,
                    type: 'entrada',
                    caixa: 'escola',
                    description: 'Oferta Escola Bíblica',
                    amount: 110.00,
                    date: '2023-12-27',
                    timestamp: Date.now() - 1728000000
                },
                {
                    id: 31,
                    type: 'entrada',
                    caixa: 'campo',
                    description: 'Doação Especial - Missões',
                    amount: 300.00,
                    date: '2023-12-26',
                    timestamp: Date.now() - 1814400000
                },
                {
                    id: 32,
                    type: 'saida',
                    caixa: 'missoes',
                    description: 'Envio para Missionário',
                    amount: 200.00,
                    date: '2023-12-25',
                    timestamp: Date.now() - 1900800000
                },
                {
                    id: 33,
                    type: 'entrada',
                    caixa: 'geral',
                    description: 'Oferta de Culto',
                    amount: 350.00,
                    date: '2023-12-24',
                    timestamp: Date.now() - 1987200000
                },
                {
                    id: 34,
                    type: 'transferencia',
                    caixa: 'escola',
                    description: 'Transferência para Missões',
                    amount: 70.00,
                    transferTo: 'missoes',
                    date: '2023-12-23',
                    timestamp: Date.now() - 2073600000
                },
                {
                    id: 35,
                    type: 'saida',
                    caixa: 'geral',
                    description: 'Material de Limpeza',
                    amount: 35.00,
                    date: '2023-12-22',
                    timestamp: Date.now() - 2160000000
                }
            ];
        }

        if (savedReceipts) {
            this.receipts = JSON.parse(savedReceipts);
        } else {
            // Dados de exemplo para demonstração
            this.receipts = [
                {
                    id: 1,
                    name: 'João Silva',
                    type: 'carnê',
                    amount: 50.00,
                    date: '2024-01-14',
                    notes: 'Carnê de Missões - Janeiro 2024',
                    timestamp: Date.now() - 172800000
                },
                {
                    id: 2,
                    name: 'Maria Santos',
                    type: 'oferta',
                    amount: 100.00,
                    date: '2024-01-12',
                    notes: 'Oferta de Culto',
                    timestamp: Date.now() - 345600000
                },
                {
                    id: 3,
                    name: 'Pedro Costa',
                    type: 'carnê',
                    amount: 60.00,
                    date: '2023-12-30',
                    notes: 'Carnê de Missões - Dezembro 2023',
                    timestamp: Date.now() - 1468800000
                },
                {
                    id: 4,
                    name: 'Ana Oliveira',
                    type: 'oferta',
                    amount: 150.00,
                    date: '2023-12-31',
                    notes: 'Oferta de Natal',
                    timestamp: Date.now() - 1382400000
                },
                {
                    id: 5,
                    name: 'Carlos Ferreira',
                    type: 'escola',
                    amount: 75.00,
                    date: '2024-01-08',
                    notes: 'Oferta Especial - Escola Bíblica',
                    timestamp: Date.now() - 691200000
                },
                {
                    id: 6,
                    name: 'Lucia Mendes',
                    type: 'carnê',
                    amount: 80.00,
                    date: '2024-01-06',
                    notes: 'Carnê de Missões - Janeiro 2024',
                    timestamp: Date.now() - 864000000
                },
                {
                    id: 7,
                    name: 'Roberto Alves',
                    type: 'oferta',
                    amount: 200.00,
                    date: '2023-12-26',
                    notes: 'Doação Especial - Missões',
                    timestamp: Date.now() - 1814400000
                },
                {
                    id: 8,
                    name: 'Fernanda Lima',
                    type: 'escola',
                    amount: 110.00,
                    date: '2023-12-27',
                    notes: 'Oferta Escola Bíblica',
                    timestamp: Date.now() - 1728000000
                }
            ];
        }

        if (savedBalances) {
            this.balances = JSON.parse(savedBalances);
        }

        if (savedChurchData) {
            this.churchData = JSON.parse(savedChurchData);
        }

        if (savedChurchLogo) {
            this.churchLogo = savedChurchLogo;
        }
    }

    saveData() {
        localStorage.setItem('churchTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('churchReceipts', JSON.stringify(this.receipts));
        localStorage.setItem('churchBalances', JSON.stringify(this.balances));
        localStorage.setItem('churchData', JSON.stringify(this.churchData));
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

        // Modais
        document.getElementById('newTransactionBtn').addEventListener('click', () => {
            this.openModal('transactionModal');
        });

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
        document.getElementById('filterDate').addEventListener('change', () => this.filterTransactions());

        // Relatórios
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportToCSV());
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

        // Transferência entre caixas
        document.getElementById('transactionType').addEventListener('change', (e) => {
            const transferGroup = document.getElementById('transferToGroup');
            if (e.target.value === 'transferencia') {
                transferGroup.style.display = 'block';
                document.getElementById('transferToCaixa').required = true;
            } else {
                transferGroup.style.display = 'none';
                document.getElementById('transferToCaixa').required = false;
            }
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
        const password = document.getElementById('password');

        if (!userSelect.value) {
            this.showNotification('Selecione um usuário', 'error');
            return;
        }

        if (!password.value) {
            this.showNotification('Digite uma senha', 'error');
            return;
        }

        // Login simulado - qualquer senha funciona
        this.currentUser = userSelect.value;
        document.getElementById('currentUser').textContent = USUARIOS[this.currentUser];
        
        this.switchScreen('mainApp');
        this.showNotification(`Bem-vindo, ${USUARIOS[this.currentUser]}!`, 'success');
    }

    handleLogout() {
        this.currentUser = null;
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
                this.renderDashboard();
                break;
            case 'transactions':
                this.renderTransactions();
                break;
            case 'receipts':
                this.renderReceipts();
                break;
            case 'reports':
                this.renderReports();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    // Modais
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        
        // Definir data atual nos formulários
        const today = new Date().toISOString().split('T')[0];
        if (modalId === 'transactionModal') {
            document.getElementById('transactionDate').value = today;
        } else if (modalId === 'receiptModal') {
            document.getElementById('receiptDate').value = today;
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        
        // Limpar formulários
        if (modalId === 'transactionModal') {
            document.getElementById('transactionForm').reset();
            document.getElementById('transferToGroup').style.display = 'none';
        } else if (modalId === 'receiptModal') {
            document.getElementById('receiptForm').reset();
        }
    }

    // Transações
    handleTransactionSubmit() {
        const form = document.getElementById('transactionForm');
        const formData = new FormData(form);
        
        const transaction = {
            id: Date.now(),
            type: formData.get('transactionType'),
            caixa: formData.get('transactionCaixa'),
            description: formData.get('transactionDescription'),
            amount: parseFloat(formData.get('transactionAmount')),
            date: formData.get('transactionDate'),
            timestamp: Date.now()
        };

        if (transaction.type === 'transferencia') {
            const transferTo = formData.get('transferToCaixa');
            if (!transferTo || transferTo === transaction.caixa) {
                this.showNotification('Selecione um caixa destino diferente', 'error');
                return;
            }
            transaction.transferTo = transferTo;
        }

        this.addTransaction(transaction);
        this.closeModal('transactionModal');
        this.showNotification('Transação registrada com sucesso!', 'success');
    }

    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        
        // Atualizar saldos
        if (transaction.type === 'entrada') {
            this.balances[transaction.caixa] += transaction.amount;
        } else if (transaction.type === 'saida') {
            this.balances[transaction.caixa] -= transaction.amount;
        } else if (transaction.type === 'transferencia') {
            this.balances[transaction.caixa] -= transaction.amount;
            this.balances[transaction.transferTo] += transaction.amount;
        }

        this.saveData();
        this.updateBalances();
        this.renderDashboard();
        this.renderTransactions();
    }

    // Recibos
    handleReceiptSubmit() {
        const form = document.getElementById('receiptForm');
        const formData = new FormData(form);
        
        const receipt = {
            id: Date.now(),
            name: formData.get('receiptName'),
            type: formData.get('receiptType'),
            amount: parseFloat(formData.get('receiptAmount')),
            date: formData.get('receiptDate'),
            notes: formData.get('receiptNotes'),
            timestamp: Date.now()
        };

        this.addReceipt(receipt);
        this.closeModal('receiptModal');
        this.showNotification('Recibo gerado com sucesso!', 'success');
    }

    addReceipt(receipt) {
        this.receipts.unshift(receipt);
        this.saveData();
        this.renderReceipts();
        
        // Imprimir recibo automaticamente após gerar
        setTimeout(() => {
            this.printReceipt(receipt.id);
        }, 500);
    }

    // Renderização
    renderDashboard() {
        this.updateBalances();
        this.renderRecentTransactions();
    }

    updateBalances() {
        // Calcular saldos baseado nas transações
        this.balances = {
            escola: 0,
            missoes: 0,
            campo: 0,
            geral: 0
        };

        this.transactions.forEach(transaction => {
            if (transaction.type === 'entrada') {
                this.balances[transaction.caixa] += transaction.amount;
            } else if (transaction.type === 'saida') {
                this.balances[transaction.caixa] -= transaction.amount;
            } else if (transaction.type === 'transferencia') {
                this.balances[transaction.caixa] -= transaction.amount;
                if (transaction.transferTo) {
                    this.balances[transaction.transferTo] += transaction.amount;
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
        const dateFilter = document.getElementById('filterDate').value;

        let filteredTransactions = this.transactions;

        if (typeFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }
        if (caixaFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.caixa === caixaFilter);
        }
        if (dateFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.date === dateFilter);
        }

        this.renderTransactionsList(filteredTransactions);
    }

    renderTransactionsList(transactions) {
        const container = document.getElementById('transactionsList');
        
        container.innerHTML = transactions.length > 0 
            ? transactions.map(transaction => this.createTransactionHTML(transaction)).join('')
            : '<p class="no-data">Nenhuma transação encontrada</p>';
    }

    createTransactionHTML(transaction) {
        const typeIcon = {
            entrada: 'fas fa-arrow-down',
            saida: 'fas fa-arrow-up',
            transferencia: 'fas fa-exchange-alt'
        };

        const typeLabel = {
            entrada: 'Entrada',
            saida: 'Saída',
            transferencia: 'Transferência'
        };

        const amountClass = transaction.type === 'entrada' ? 'positive' : 'negative';
        const amountPrefix = transaction.type === 'entrada' ? '+' : '-';

        let transferInfo = '';
        if (transaction.type === 'transferencia' && transaction.transferTo) {
            transferInfo = `<div class="transaction-transfer">→ ${CAIXAS[transaction.transferTo]}</div>`;
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
                    <span class="transaction-caixa">${CAIXAS[transaction.caixa]}</span>
                    <span>${this.formatDate(transaction.date)}</span>
                </div>
                ${transferInfo}
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
        return `
            <div class="receipt-item">
                <div class="receipt-header">
                    <div class="receipt-name">${receipt.name}</div>
                    <div class="receipt-amount">${this.formatCurrency(receipt.amount)}</div>
                </div>
                <div class="receipt-details">
                    <span class="receipt-type">${receipt.type}</span>
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
            const transactionDate = new Date(transaction.date + 'T00:00:00');
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        if (caixaFilter && caixaFilter !== 'todos') {
            filteredTransactions = filteredTransactions.filter(t => t.caixa === caixaFilter);
        }
        if (typeFilter && typeFilter !== 'todos') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }

        const totalEntradas = filteredTransactions
            .filter(t => t.type === 'entrada')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalSaidas = filteredTransactions
            .filter(t => t.type === 'saida')
            .reduce((sum, t) => sum + t.amount, 0);

        const saldo = totalEntradas - totalSaidas;

        document.getElementById('totalEntradas').textContent = this.formatCurrency(totalEntradas);
        document.getElementById('totalSaidas').textContent = this.formatCurrency(totalSaidas);
        document.getElementById('saldoTotal').textContent = this.formatCurrency(saldo);

        this.renderReportsChart(filteredTransactions);
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

        // Criar gráfico simples
        let chartHTML = '<div style="width: 100%; height: 250px; display: flex; align-items: end; gap: 20px; padding: 20px;">';
        
        Object.keys(caixaData).forEach(caixa => {
            const data = caixaData[caixa];
            const total = data.entradas - data.saidas;
            const maxValue = Math.max(...Object.values(caixaData).map(d => Math.abs(d.entradas - d.saidas)));
            const height = maxValue > 0 ? (Math.abs(total) / maxValue) * 200 : 0;
            
            chartHTML += `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="
                        width: 40px; 
                        height: ${height}px; 
                        background: ${total >= 0 ? '#22c55e' : '#ef4444'}; 
                        border-radius: 4px;
                        margin-bottom: 10px;
                    "></div>
                    <div style="font-size: 12px; text-align: center; color: #718096;">
                        <div style="font-weight: 600;">${CAIXAS[caixa]}</div>
                        <div>${this.formatCurrency(total)}</div>
                    </div>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        container.innerHTML = chartHTML;
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

        const filteredTransactions = this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date + 'T00:00:00');
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        if (filteredTransactions.length === 0) {
            this.showNotification('Nenhum dado para exportar no período selecionado', 'error');
            return;
        }

        const headers = ['Data', 'Tipo', 'Caixa', 'Descrição', 'Valor', 'Transferência Para'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(transaction => [
                transaction.date,
                transaction.type,
                CAIXAS[transaction.caixa],
                `"${transaction.description}"`,
                transaction.amount,
                transaction.transferTo ? CAIXAS[transaction.transferTo] : ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    showNotification(message, type = 'info') {
        // Criar notificação simples
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
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
        this.churchData = {
            name: document.getElementById('churchName').value,
            address: document.getElementById('churchAddress').value,
            phone: document.getElementById('churchPhone').value,
            email: document.getElementById('churchEmail').value,
            cnpj: document.getElementById('churchCnpj').value
        };

        this.saveData();
        this.showNotification('Dados da igreja salvos com sucesso!', 'success');
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
            this.saveData();
            this.showNotification('Logo carregada com sucesso!', 'success');
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
        localStorage.removeItem('churchLogo');
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
        
        // Aguardar o carregamento das imagens antes de imprimir
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    }

    generateReceiptHTML(receipt) {
        const churchName = this.churchData.name || 'Igreja';
        const churchAddress = this.churchData.address || '';
        const churchPhone = this.churchData.phone || '';
        const churchEmail = this.churchData.email || '';
        const churchCnpj = this.churchData.cnpj || '';

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
                    
                                         @media print {
                         body { 
                             margin: 0; 
                             padding: 0; 
                             background: white !important;
                             min-height: auto;
                         }
                         .no-print { display: none !important; }
                         .receipt-container { 
                             box-shadow: none; 
                             margin: 0;
                             border-radius: 0;
                             max-width: none;
                         }
                         .receipt-header {
                             border-radius: 0;
                         }
                         .receipt-body {
                             padding: 30px 20px;
                         }
                     }
                    
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
                        background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
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
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
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
                        color: #22c55e;
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
                        background: linear-gradient(90deg, #22c55e 0%, #15803d 100%);
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
                        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                        border-radius: 16px;
                        border: 2px solid #bbf7d0;
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
                        background: linear-gradient(90deg, #22c55e 0%, #15803d 100%);
                    }
                    
                    .receipt-amount-label {
                        font-size: 16px;
                        color: #166534;
                        font-weight: 600;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    .receipt-amount {
                        font-size: 36px;
                        font-weight: 700;
                        color: #15803d;
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
                        background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
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
                        color: rgba(34, 197, 94, 0.03);
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
                <button class="print-button no-print" onclick="window.print()">
                    <i class="fas fa-print"></i> Imprimir Recibo
                </button>
                
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
                            Referente a: <span class="receipt-type-badge">${this.getReceiptTypeLabel(receipt.type)}</span>
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
                                 <p>Usuário: ${USUARIOS[this.currentUser] || 'Sistema'} | Data de emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                             </div>
                         </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    getReceiptTypeLabel(type) {
        const typeLabels = {
            'carnê': 'Carnê de Missões',
            'oferta': 'Oferta de Culto',
            'escola': 'Oferta Escola Bíblica',
            'outro': 'Outro'
        };
        return typeLabels[type] || type;
    }
}

// Adicionar estilos CSS para animações de notificação
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .no-data {
        text-align: center;
        color: #a0aec0;
        font-style: italic;
        padding: 40px 20px;
    }
`;
document.head.appendChild(notificationStyles);

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChurchFinanceApp();
});
