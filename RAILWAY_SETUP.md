# Configuração do Railway

## Passos para configurar o banco PostgreSQL no Railway:

1. **No painel do Railway**, vá em "Variables" e configure:
   ```
   DATABASE_URL=postgresql://postgres:SENHA@SERVIDOR:5432/railway?sslmode=require
   ```
   (Substitua pela URL real do seu banco PostgreSQL do Railway)

2. **Após configurar a DATABASE_URL**, o Railway executará automaticamente:
   - `npm install`
   - `prisma generate` (via postinstall)
   - `prisma migrate deploy` (se necessário)

3. **Para popular o banco**, execute via Railway CLI ou adicione ao deploy:
   ```bash
   npx prisma db seed
   ```

## Desenvolvimento Local:

Para desenvolvimento local, use SQLite (já configurado no .env):
```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
node server.js
```

## Troubleshooting:

- Se der erro de schema, delete `prisma/migrations` e rode `npx prisma migrate dev --name init`
- Se der erro de conexão, verifique se a DATABASE_URL está correta no Railway
- Para resetar banco: `npx prisma migrate reset` (CUIDADO: apaga todos os dados!)