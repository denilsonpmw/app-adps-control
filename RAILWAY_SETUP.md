# Configuração do Railway

## ⚠️ **IMPORTANTE: Configuração do Banco de Dados**

### No painel do Railway, configure a variável:
```
DATABASE_URL=postgresql://postgres:oAkxAqEQrrOfUmBXDsAmLyZqPbwUommG@postgres.railway.internal:5432/railway
```

## Passos para configurar:

1. **No painel do Railway**, vá em "Variables" e adicione:
   - **Nome**: `DATABASE_URL`
   - **Valor**: `postgresql://postgres:oAkxAqEQrrOfUmBXDsAmLyZqPbwUommG@postgres.railway.internal:5432/railway`

2. **Após configurar**, faça redeploy ou aguarde o próximo deploy

3. **Verificação**: Nos logs deve aparecer:
   ```
   📍 DATABASE_URL: Configurada
   👥 Usuários no banco: X
   ```

## Desenvolvimento Local:

Para desenvolvimento local, use SQLite (já configurado no .env):
```bash
npm install
npx prisma db push
npx prisma db seed
node server.js
```

## Troubleshooting:

- **Se não persistir dados**: Verifique se `DATABASE_URL` está configurada no Railway
- **Se der erro de conexão**: Aguarde alguns minutos após configurar a variável
- **Se der erro de schema**: Delete dados do banco e deixe o seed recriar