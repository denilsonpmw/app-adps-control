// Carregamento dinâmico dos caixas do backend
let CAIXAS = {};
async function loadCaixas() {
    const res = await fetch('http://localhost:3001/api/caixas');
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
            transferencia: 'Transferência',
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
            const res = await fetch('http://localhost:3001/api/receipts');
            if (!res.ok) throw new Error('Error loading receipts');
            this.receipts = await res.json();
        } catch (err) {
            this.receipts = [];
            this.showNotification('Erro ao carregar recibos do servidor', 'error');
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
            name: '',
            address: '',
            phone: '',
            email: '',
            cnpj: ''
        };
        this.churchLogo = null;
        
        this.init();
    }

    async init() {
    await loadCaixas();
    this.caixas = { ...CAIXAS };
    this.renderCaixaList();
        await this.loadTransactions();
        await this.loadReceipts();
        this.loadTheme();
        this.setupEventListeners();
        this.updateBalances();
        this.renderDashboard();

        // Dropdown do usuário: toggle ao clicar no avatar
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.addEventListener('click', function (e) {
                // Não fecha ao clicar dentro do dropdown
                if (e.target.closest('.user-dropdown')) return;
                userMenu.classList.toggle('open');
            });
            // Fecha ao clicar fora
            document.addEventListener('click', function (e) {
                if (!userMenu.contains(e.target)) {
                    userMenu.classList.remove('open');
                }
            });
        }
    }

    // Carregar transações do backend
    async loadTransactions() {
        try {
            const res = await fetch('http://localhost:3001/api/transactions');
            if (!res.ok) throw new Error('Error loading transactions');
            this.transactions = await res.json();
        } catch (err) {
            this.transactions = [];
            this.showNotification('Erro ao carregar transações do servidor', 'error');
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

        console.log('Login submit:', { userSelect, password });
        console.log('userSelect.value:', userSelect.value);
        console.log('password.value:', password.value);

        if (!userSelect.value) {
            this.showNotification('Selecione um usuário', 'error');
            console.log('Login falhou: usuário não selecionado');
            return;
        }

        if (!password.value) {
            this.showNotification('Digite uma senha', 'error');
            console.log('Login falhou: senha não digitada');
            return;
        }

        // Login simulado - qualquer senha funciona
        this.currentUser = userSelect.value;
        console.log('Usuário autenticado:', this.currentUser);
        // Atualiza o nome do usuário no dropdown
        const currentUserDiv = document.getElementById('currentUser');
        if (currentUserDiv) {
            currentUserDiv.textContent = USUARIOS[this.currentUser];
            console.log('Nome exibido:', USUARIOS[this.currentUser]);
        }
        this.switchScreen('mainApp');
        this.showNotification(`Bem-vindo, ${USUARIOS[this.currentUser]}!`, 'success');
        console.log('Tela principal exibida');
    }

    handleLogout() {
        this.currentUser = null;
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
        const type = formData.get('transactionType');
        const caixa = formData.get('transactionCaixa');
    const person = formData.get('transactionPerson');
    const description = formData.get('transactionDescription');
        const amount = parseFloat(formData.get('transactionAmount'));
        let date = formData.get('transactionDate');
        // Ajusta para UTC-3 (Brasília) ao enviar para o backend
        if (date) {
            // Adiciona horário 03:00:00 para garantir meia-noite em UTC-3
            date = date + 'T03:00:00.000Z';
        }
        let transferTo = undefined;
        if (type === 'transferencia') {
            transferTo = formData.get('transferToCaixa');
            if (!transferTo || transferTo === caixa) {
                this.showNotification('Selecione um caixa destino diferente', 'error');
                return;
            }
        }
        // Enviar username do usuário logado
        const transaction = {
            type,
            caixa,
            description,
            person,
            amount,
            date,
            user: this.currentUser,
            ...(transferTo ? { transferTo } : {})
        };
        this.addTransaction(transaction);
        this.closeModal('transactionModal');
    }

    async addTransaction(transaction) {
        try {
            const res = await fetch('http://localhost:3001/api/transactions', {
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
            const receiptRes = await fetch('http://localhost:3001/api/receipts', {
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
            const res = await fetch('http://localhost:3001/api/receipts', {
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
    renderDashboard() {
        this.updateBalances();
        this.renderRecentTransactions();
        this.renderDashboardChart();
    }

    renderDashboardChart() {
        const container = document.getElementById('dashboardChart');
        if (!container) return;
        if (!this.transactions || this.transactions.length === 0) {
            container.innerHTML = '<p>Nenhum dado para exibir</p>';
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
        this.transactions.forEach(transaction => {
            const caixaKey = transaction.caixa && typeof transaction.caixa === 'object' ? transaction.caixa.key : transaction.caixa;
            if (transaction.type === 'entrada') {
                if (caixaKey && caixaData[caixaKey]) caixaData[caixaKey].entradas += transaction.amount;
            } else if (transaction.type === 'saida') {
                if (caixaKey && caixaData[caixaKey]) caixaData[caixaKey].saidas += transaction.amount;
            }
        });

        // Calcular totais para pizza
        const totais = Object.keys(caixaData).map(caixa => Math.max(0, caixaData[caixa].entradas - caixaData[caixa].saidas));
        const totalGeral = totais.reduce((a, b) => a + b, 0);
        if (totalGeral === 0) {
            container.innerHTML = '<p>Nenhum dado para exibir</p>';
            return;
        }

        // Tons de verde do mais escuro para o mais claro
        const verdes = [
            '#22c55e',
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
            slices += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${color}" stroke="#fff" stroke-width="2" />`;
            startAngle += angle;
        });

        // Legenda
        let legend = '';
        sorted.forEach((item, i) => {
            if (item.valor === 0) return;
            legend += `<div style="display:flex;align-items:center;margin-bottom:4px;"><span style="display:inline-block;width:16px;height:16px;background:${verdes[i % verdes.length]};margin-right:8px;border-radius:3px;"></span>${item.nome}: <b style="margin-left:4px;">${this.formatCurrency(item.valor)}</b></div>`;
        });

        container.innerHTML = `
            <div style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:32px;">
                <svg width="260" height="260" viewBox="0 0 260 260">${slices}</svg>
                <div style="min-width:120px;">${legend}</div>
            </div>
        `;
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
            // Pega a key do caixa corretamente
            const caixaKey = transaction.caixa && typeof transaction.caixa === 'object' ? transaction.caixa.key : transaction.caixa;
            const transferToKey = transaction.transferTo && typeof transaction.transferTo === 'object' ? transaction.transferTo.key : transaction.transferTo;
            if (transaction.type === 'entrada') {
                if (caixaKey && this.balances.hasOwnProperty(caixaKey)) {
                    this.balances[caixaKey] += transaction.amount;
                }
            } else if (transaction.type === 'saida') {
                if (caixaKey && this.balances.hasOwnProperty(caixaKey)) {
                    this.balances[caixaKey] -= transaction.amount;
                }
            } else if (transaction.type === 'transferencia') {
                if (caixaKey && this.balances.hasOwnProperty(caixaKey)) {
                    this.balances[caixaKey] -= transaction.amount;
                }
                if (transferToKey && this.balances.hasOwnProperty(transferToKey)) {
                    this.balances[transferToKey] += transaction.amount;
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

        // Nome do caixa
        let caixaNome = '';
        if (transaction.caixa && typeof transaction.caixa === 'object') {
            caixaNome = transaction.caixa.name || CAIXAS[transaction.caixa.key] || CAIXAS[transaction.caixa.id] || '';
        } else {
            caixaNome = CAIXAS[transaction.caixa] || '';
        }
        let transferNome = '';
        if (transaction.type === 'transferencia' && transaction.transferTo) {
            if (typeof transaction.transferTo === 'object') {
                transferNome = transaction.transferTo.name || CAIXAS[transaction.transferTo.key] || CAIXAS[transaction.transferTo.id] || '';
            } else {
                transferNome = CAIXAS[transaction.transferTo] || '';
            }
        }
        let transferInfo = '';
        if (transaction.type === 'transferencia' && transaction.transferTo) {
            transferInfo = `<div class="transaction-transfer">→ ${transferNome}</div>`;
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
        var tableHtml = '';
        tableHtml += '<div class="extrato-table-wrapper">';
        tableHtml += '<table class="extrato-table">';
        tableHtml += '<thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>';
        for (var i = 0; i < transactions.length; i++) {
            var t = transactions[i];
            tableHtml += '<tr>';
            tableHtml += '<td>' + this.formatDate(t.date) + '</td>';
            tableHtml += '<td>' + t.description + '</td>';
            tableHtml += '<td class="extrato-valor ' + t.type + '">' + this.formatCurrency(t.amount) + '</td>';
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table></div>';
        container.innerHTML = tableHtml;
    }

printReportsTable() {
        const container = document.getElementById('reportsTableContainer');
        if (!container) return;
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(`
            <html>
            <head>
                <title>Relatório de Transações</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { border: 1px solid #ccc; padding: 6px 8px; }
                    th { background: #14532d; color: #fff; }
                    tr:nth-child(even) { background: #f1f5f9; }
                    tr:nth-child(odd) { background: #fff; }
                    h2 { margin-bottom: 0; }
                </style>
            </head>
            <body>
                ${container.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
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
    renderCaixaList() {
        const caixaList = document.getElementById('caixaList');
        caixaList.innerHTML = '';
        Object.entries(this.caixas).forEach(([key, value]) => {
            const li = document.createElement('li');
            li.className = 'caixa-item';
            li.innerHTML = `
                <span>${value}</span>
                <button class="btn-secondary" onclick="app.editCaixa('${key}')"><i class="fas fa-edit"></i></button>
                <button class="btn-danger" onclick="app.deleteCaixa('${key}')"><i class="fas fa-trash"></i></button>
            `;
            caixaList.appendChild(li);
        });
        this.updateCaixaSelects();
    }

    addCaixa() {
        const caixaNameInput = document.getElementById('caixaName');
        const name = caixaNameInput.value.trim();
        if (!name) return;
        // Gera uma chave única
        const key = name.toLowerCase().replace(/[^a-z0-9]/gi, '');
        if (this.caixas[key]) {
            this.showNotification('Já existe um caixa com esse nome.', 'error');
            return;
        }
        this.caixas[key] = name;
        this.saveCaixas();
        caixaNameInput.value = '';
        this.renderCaixaList();
        this.showNotification('Caixa incluído com sucesso!', 'success');
    }

    editCaixa(key) {
        const caixaNameInput = document.getElementById('caixaName');
        caixaNameInput.value = this.caixas[key];
        this.editingCaixaKey = key;
        document.getElementById('addCaixaBtn').style.display = 'none';
        document.getElementById('updateCaixaBtn').style.display = '';
        document.getElementById('cancelCaixaEditBtn').style.display = '';
    }

    updateCaixa() {
        const caixaNameInput = document.getElementById('caixaName');
        const name = caixaNameInput.value.trim();
        if (!name || !this.editingCaixaKey) return;
        // Atualiza o nome
        this.caixas[this.editingCaixaKey] = name;
        this.saveCaixas();
        this.editingCaixaKey = null;
        caixaNameInput.value = '';
        document.getElementById('addCaixaBtn').style.display = '';
        document.getElementById('updateCaixaBtn').style.display = 'none';
        document.getElementById('cancelCaixaEditBtn').style.display = 'none';
        this.renderCaixaList();
        this.showNotification('Caixa alterado com sucesso!', 'success');
    }

    deleteCaixa(key) {
        if (!confirm('Tem certeza que deseja excluir este caixa?')) return;
        delete this.caixas[key];
        this.saveCaixas();
        this.renderCaixaList();
        this.showNotification('Caixa excluído com sucesso!', 'success');
    }

    cancelCaixaEdit() {
        this.editingCaixaKey = null;
        document.getElementById('caixaName').value = '';
        document.getElementById('addCaixaBtn').style.display = '';
        document.getElementById('updateCaixaBtn').style.display = 'none';
        document.getElementById('cancelCaixaEditBtn').style.display = 'none';
    }

    saveCaixas() {
        localStorage.setItem('churchCaixas', JSON.stringify(this.caixas));
        CAIXAS = { ...this.caixas };
        this.updateCaixaSelects();
    }

    updateCaixaSelects() {
        // Atualiza todos os selects de caixa do sistema
        const selects = [
            document.getElementById('reportCaixa'),
            document.getElementById('filterCaixa'),
            document.getElementById('caixa'),
            document.getElementById('transferTo')
        ].filter(Boolean);
        selects.forEach(select => {
            const current = select.value;
            select.innerHTML = '<option value="todos">Todos</option>';
            Object.entries(this.caixas).forEach(([key, value]) => {
                select.innerHTML += `<option value="${key}">${value}</option>`;
            });
            select.value = current && this.caixas[current] ? current : 'todos';
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
                                 <p>Usuário: ${USUARIOS[this.currentUser] || 'Sistema'} | Data de emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                             </div>
                         </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}