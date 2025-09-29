# ⚠️ **AVISO IMPORTANTE**
Sempre que for fazer commit e push no git, garanta que o projeto está configurado para **PostgreSQL** (produção) e não para SQLite (desenvolvimento). Isso evita inconsistências no banco de dados e nas migrations do ambiente compartilhado.

# Instruções para o GitHub Copilot e colaboradores

## 📝 Padrões Gerais
- Sempre me responda no chat, escreva código e documentação em português do Brasil.
- Siga boas práticas de organização, nomenclatura e segurança.
- Comente trechos críticos e explique decisões técnicas.

## ⚡️ Setup Rápido
1. Instale dependências:
   ```bash
   npm install
   ```
2. Configure banco de dados:
   - SQLite (desenvolvimento):
     ```bash
     npx prisma migrate dev --name init
     ```
   - PostgreSQL (produção):
     Configure o Docker e a variável `DATABASE_URL`.
3. Execute seed:
   ```bash
   npx prisma db seed
   ```
4. Inicie o backend:
   ```bash
   node server.js
   ```
5. Acesse o frontend via `index.html` ou pelo servidor.

## 🧪 Testes
- Teste funcionalidades críticas do backend e frontend.
- Mantenha scripts de seed e migração organizados.

## 🚀 Deploy
- Utilize scripts npm para build, dev e lint.
- Configure variáveis de ambiente para produção.

## �️ Configuração do Ambiente de Desenvolvimento

### Banco de Dados
- **Desenvolvimento Local**: SQLite (`file:./prisma/dev.db`)
- **Produção**: PostgreSQL (configurar `DATABASE_URL` apropriada)

### Como rodar o projeto localmente:
1. **Instalar dependências**: `npm install`
2. **Configurar banco**: 
   - Para SQLite (padrão): `npx prisma migrate dev --name init`
   - Para PostgreSQL: Configurar Docker com `docker-compose up -d`
3. **Executar seed**: `npx prisma db seed`
4. **Iniciar servidor**: `node server.js` (roda em `http://localhost:3001`)
5. **Acessar frontend**: Abrir `index.html` ou acessar via servidor

### Mudança PostgreSQL ↔ SQLite:
- **Para SQLite**: Alterar `schema.prisma` para `provider = "sqlite"` e `url = "file:./dev.db"`
- **Para PostgreSQL**: Alterar `schema.prisma` para `provider = "postgresql"` e configurar `DATABASE_URL`
- **Sempre**: Remover `prisma/migrations` e executar `npx prisma migrate dev --name init`

### Docker PostgreSQL (se necessário):
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: adps_db
      POSTGRES_USER: adps_user  
      POSTGRES_PASSWORD: adps_pass
      POSTGRES_HOST_AUTH_METHOD: trust
    ports: ["5432:5432"]
    command: postgres -c listen_addresses='*'
```
