# Controle Financeiro - Igreja

Um aplicativo web mobile moderno e minimalista para controle financeiro de igrejas, desenvolvido com HTML, CSS e JavaScript vanilla.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral dos saldos de todos os caixas
- Transações recentes
- Indicadores de tendência

### 💰 Transações
- **Entradas**: Ofertas, dízimos, doações
- **Saídas**: Compras, despesas, pagamentos
- **Transferências**: Entre diferentes caixas
- Filtros por tipo, caixa e data

### 🧾 Recibos
- Geração de recibos para ofertantes
- Tipos: Carnê de Missões, Oferta de Culto, Escola Bíblica
- Histórico completo de recibos emitidos

### 📈 Relatórios
- Filtros por período, caixa e tipo de transação
- Resumo de entradas, saídas e saldo
- Gráficos visuais
- Exportação para CSV

### 🏦 Caixas Disponíveis
- **Escola Bíblica**: Para ofertas e despesas da EBD
- **Missões**: Para ofertas missionárias
- **Missões do Campo**: Para missões locais
- **Geral**: Para despesas gerais da igreja

## 🎨 Design

- **Interface moderna** com gradientes e animações
- **Design responsivo** para mobile e desktop
- **Tema minimalista** com cores suaves
- **Animações fluidas** para melhor UX
- **Ícones intuitivos** do Font Awesome

## 🔐 Sistema de Login

### Usuários Demo (Qualquer senha funciona)
- **Administrador**: Acesso completo ao sistema
- **Tesoureiro**: Gerenciamento financeiro
- **Secretário**: Visualização e relatórios

## 💾 Armazenamento

- **localStorage**: Dados persistidos no navegador
- **Dados de exemplo**: Incluídos para demonstração
- **Backup automático**: Salvamento em tempo real

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com CSS Grid e Flexbox
- **JavaScript ES6+**: Lógica da aplicação
- **Font Awesome**: Ícones
- **localStorage**: Persistência de dados

## 📱 Responsividade

- **Mobile First**: Otimizado para dispositivos móveis
- **Tablet**: Interface adaptada para tablets
- **Desktop**: Layout completo para computadores
- **Touch Friendly**: Botões e interações otimizadas para toque

## 🚀 Como Usar

1. **Abra o arquivo `index.html`** no seu navegador
2. **Faça login** selecionando um usuário e digitando qualquer senha
3. **Navegue** pelas diferentes seções usando as abas
4. **Adicione transações** clicando em "Nova Transação"
5. **Gere recibos** na seção de Recibos
6. **Visualize relatórios** e exporte dados em CSV

## 📋 Funcionalidades Principais

### Adicionar Transação
1. Clique em "Nova Transação"
2. Selecione o tipo (Entrada/Saída/Transferência)
3. Escolha o caixa
4. Preencha descrição, valor e data
5. Salve a transação

### Gerar Recibo
1. Vá para a seção "Recibos"
2. Clique em "Novo Recibo"
3. Preencha os dados do ofertante
4. Selecione o tipo de oferta
5. Adicione observações se necessário
6. Gere o recibo

### Visualizar Relatórios
1. Acesse a seção "Relatórios"
2. Configure os filtros desejados
3. Visualize os resumos e gráficos
4. Exporte para CSV se necessário

## 🎯 Características Técnicas

- **PWA Ready**: Pode ser instalado como aplicativo
- **Offline**: Funciona sem internet após carregado
- **Performance**: Carregamento rápido e responsivo
- **Acessibilidade**: Navegação por teclado e leitores de tela
- **Cross-browser**: Compatível com todos os navegadores modernos

## 🔧 Personalização

### Cores
As cores podem ser alteradas editando as variáveis CSS no arquivo `styles.css`:

```css
:root {
    --primary-color: #22c55e;
    --secondary-color: #15803d;
    --success-color: #22c55e;
    --danger-color: #ef4444;
    /* ... outras cores */
}
```

### Caixas
Para adicionar ou modificar caixas, edite o objeto `CAIXAS` no arquivo `script.js`:

```javascript
const CAIXAS = {
    escola: 'Escola Bíblica',
    missoes: 'Missões',
    campo: 'Missões do Campo',
    geral: 'Geral',
    // Adicione novos caixas aqui
};
```

## 📄 Licença

Este projeto é de uso livre para igrejas e organizações religiosas.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Entre em contato para contribuir com o projeto.

---

**Desenvolvido com ❤️ para igrejas**
