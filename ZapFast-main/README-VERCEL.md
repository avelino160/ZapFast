# 🚀 Deploy PilotZap no Vercel

Guia completo para hospedar o PilotZap na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Banco PostgreSQL (recomendado: [Neon](https://neon.tech), [Supabase](https://supabase.com))
- Conta OpenAI para Chatbot AI
- Repositório GitHub/GitLab com o código

## 🔧 Configuração

### 1. Preparar o Repositório

```bash
# Clone o projeto
git clone <seu-repo>
cd pilotzap

# Instalar dependências
npm run install:all

# Testar localmente
npm run dev
```

### 2. Configurar Banco de Dados

**Opção A: Neon (Recomendado)**
1. Acesse [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string PostgreSQL
4. Configure no Vercel como `DATABASE_URL`

**Opção B: Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Vá em Settings → Database
4. Copie a connection string
5. Configure no Vercel como `DATABASE_URL`

### 3. Deploy na Vercel

#### Via GitHub (Recomendado)
1. Push para GitHub:
```bash
git add .
git commit -m "feat: setup for vercel deployment"
git push origin main
```

2. Na Vercel:
   - Clique "New Project"
   - Importe do GitHub
   - Selecione o repositório
   - Configure as variáveis de ambiente

#### Via Vercel CLI
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Deploy em produção
vercel --prod
```

### 4. Variáveis de Ambiente (OBRIGATÓRIO)

Configure no painel da Vercel (`Settings → Environment Variables`):

#### Essenciais
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
SESSION_SECRET=uma-string-super-secreta-e-longa
OPENAI_API_KEY=sk-sua-chave-openai-aqui
NODE_ENV=production
```

#### Notificações Push (Opcional)
```env
VAPID_PUBLIC_KEY=sua-chave-publica-vapid
VAPID_PRIVATE_KEY=sua-chave-privada-vapid
VAPID_SUBJECT=mailto:seu-email@domain.com
```

#### Domain Config
```env
DOMAIN=seu-app.vercel.app
FRONTEND_URL=https://seu-app.vercel.app
BACKEND_URL=https://seu-app.vercel.app/api
```

### 5. Configuração de Build

A configuração já está pronta no `vercel.json`:
- Frontend buildado como site estático
- Backend como serverless functions
- Rotas configuradas automaticamente

## 🔄 Processo de Deploy

### Automático (GitHub)
1. Push para `main` → Deploy automático
2. Pull Requests → Preview deploys
3. Merge → Production deploy

### Manual
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

## 🗄️ Banco de Dados

### Executar Migrações
```bash
# Localmente (apontando para produção)
DATABASE_URL="sua-url-producao" npm run db:push

# Ou via Vercel CLI
vercel env pull .env.local
npm run db:push
```

### Visualizar Dados
```bash
# Drizzle Studio
npm run db:studio
```

## 🔧 Configurações Avançadas

### Custom Domains
1. Vercel Dashboard → seu-projeto → Settings → Domains
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### Analytics
1. Vercel Dashboard → Analytics → Enable
2. Métricas de performance automáticas

### Edge Functions
O backend roda em Edge Functions da Vercel:
- Cold start ~100ms
- Timeout máximo: 30s
- Memory: 1024MB

## 🚨 Limitações Importantes

### WhatsApp Web.js
⚠️ **ATENÇÃO**: WhatsApp Web.js NÃO funciona em serverless!

**Alternativas:**
1. **WhatsApp Business API** (oficial)
2. **Twilio WhatsApp API**
3. **Separar WhatsApp** para servidor dedicado (Railway, Render)

### Sessões
- Use PostgreSQL para session store
- Não use session em memória

### File Uploads
- Use Vercel Blob ou Cloudinary
- Não salve files no filesystem

## 📊 Monitoramento

### Logs
```bash
# Ver logs em tempo real
vercel logs --follow

# Logs específicos de função
vercel logs --follow --filter="api/index.ts"
```

### Métricas
- Vercel Dashboard → Analytics
- Performance insights
- Error tracking

## 🔒 Segurança

### Environment Variables
- Nunca commite `.env`
- Use `.env.example` como template
- Configure todas no painel Vercel

### CORS
Já configurado para seu domínio Vercel

### Rate Limiting
Configure conforme necessário para sua aplicação

## ⚡ Otimizações

### Frontend
- Build otimizado com Vite
- Tree shaking automático
- Assets com CDN da Vercel

### Backend
- Serverless functions otimizadas
- Cold start minimizado
- Bundle size reduzido

## 🆘 Troubleshooting

### Build Fails
```bash
# Testar build localmente
npm run build

# Ver logs detalhados
vercel logs --follow
```

### Database Connection
```bash
# Testar conexão
node -e "console.log(process.env.DATABASE_URL)"
```

### 500 Errors
1. Check Vercel logs
2. Verify environment variables
3. Test locally first

## 📞 Suporte

- [Vercel Docs](https://vercel.com/docs)
- [Discord da Vercel](https://discord.gg/vercel)
- Issues neste repositório

---

**Boa sorte com seu deploy! 🚀**