# PilotZap Backend

Backend Node.js + Express para a plataforma PilotZap.

## 🛠 Tecnologias

- **Node.js** + TypeScript
- **Express** - Framework web
- **Drizzle ORM** - Database ORM
- **SQLite/PostgreSQL** - Banco de dados
- **WhatsApp Web.js** - Integração WhatsApp
- **OpenAI API** - Chatbot inteligente
- **Web Push** - Notificações push
- **WebSocket** - Comunicação tempo real

## 📁 Estrutura

```
backend/
├── server/
│   ├── index.ts          # Servidor principal
│   ├── routes/           # Rotas da API
│   ├── services/         # Lógica de negócio
│   ├── db/              # Configuração banco
│   └── middleware/       # Middlewares
├── shared/              # Tipos e schemas compartilhados
├── auth_info/           # Sessões WhatsApp
├── attached_assets/     # Uploads e mídias
├── migrations/          # Migrações banco
├── scripts/             # Scripts de migração
├── tools/               # Ferramentas utilitárias
├── .env                 # Variáveis ambiente
├── package.json         # Dependências
├── drizzle.config.ts    # Config banco
└── tsconfig.json        # Config TypeScript
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Verificação tipos
npm run type-check

# Banco de dados
npm run db:push      # Aplicar schema
npm run db:migrate   # Executar migrações
npm run db:studio    # Interface visual
```

## 🗄️ Banco de Dados

### Schema Principal
- **users** - Usuários do sistema
- **contacts** - Contatos WhatsApp
- **messages** - Histórico de mensagens
- **funnels** - Funis de conversação
- **campaigns** - Campanhas de massa
- **push_subscriptions** - Assinantes push

### Configuração
```typescript
// drizzle.config.ts
export default {
  schema: "./server/db/schema.ts",
  out: "./migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
};
```

## 🤖 Serviços Principais

### WhatsAppService
- Conexão e autenticação WhatsApp
- Envio de mensagens (texto, mídia)
- Recebimento de webhooks
- Gestão de sessões

### ChatbotService
- Integração OpenAI GPT
- Memória de conversação (30 min)
- Sistema de gatilhos por palavra-chave
- Fallback automático

### BulkMessageService
- Sistema de filas para disparos
- Retry automático
- Delay configurável
- Progresso em tempo real
- Suporte a agendamento

### FunnelService
- Processamento de funis
- Condicionais e ramificações
- Integração com WhatsApp
- Analytics e métricas

### NotificationService
- Web Push notifications
- Service Worker integration
- VAPID keys management
- Multi-device support

## 🔌 API Endpoints

### Autenticação
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Contatos
```
GET    /api/contacts
POST   /api/contacts
PUT    /api/contacts/:id
DELETE /api/contacts/:id
POST   /api/contacts/import
```

### Mensagens
```
GET  /api/messages
POST /api/messages
GET  /api/messages/:contactId
```

### Funis
```
GET    /api/funnels
POST   /api/funnels
PUT    /api/funnels/:id
DELETE /api/funnels/:id
POST   /api/funnels/:id/trigger
```

### Campanhas
```
GET    /api/bulk-messages/campaigns
POST   /api/bulk-messages/campaigns
POST   /api/bulk-messages/campaigns/:id/start
POST   /api/bulk-messages/campaigns/:id/pause
POST   /api/bulk-messages/campaigns/:id/resume
```

### Chatbot
```
GET /api/chatbot/config
PUT /api/chatbot/config/:id
POST /api/chatbot/config
```

## 🔐 Variáveis de Ambiente

```bash
# Banco de dados
DATABASE_URL=postgresql://user:pass@host/db

# Sessão
SESSION_SECRET=sua-chave-secreta

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Push Notifications
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your-email@domain.com

# WhatsApp
WHATSAPP_SESSION_PATH=./auth_info

# Environment
NODE_ENV=development
PORT=5000
```

## 🌐 WebSocket Events

### Eventos do Cliente
```typescript
// Conectar à sala do usuário
socket.emit('join', { userId });

// Enviar mensagem
socket.emit('sendMessage', { contactId, message });
```

### Eventos do Servidor
```typescript
// Nova mensagem recebida
socket.emit('newMessage', message);

// Status da campanha
socket.emit('campaignProgress', { campaignId, progress });

// Conexão WhatsApp
socket.emit('whatsappStatus', { status });
```

## 🛡️ Middleware de Segurança

### Autenticação
```typescript
// middleware/auth.ts
export const requireAuth = (req, res, next) => {
  // Verificar sessão válida
};
```

### Rate Limiting
```typescript
// Limitação de requisições por IP
const rateLimit = require('express-rate-limit');
```

### Validação
```typescript
// Validação com Zod schemas
import { z } from 'zod';
```

## 🔧 Configuração de Desenvolvimento

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar ambiente**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Setup banco**
```bash
npm run db:push
```

4. **Iniciar desenvolvimento**
```bash
npm run dev
# Servidor: http://localhost:5000
```

## 📦 Deploy

### Build
```bash
npm run build
# Gera: dist/index.js
```

### Produção
```bash
NODE_ENV=production npm start
```

### Docker (futuro)
```dockerfile
FROM node:18-alpine
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

## 🧪 Testes (futuro)

```bash
# Instalar dependências
npm install -D jest @types/jest

# Executar testes
npm run test

# Testes com coverage
npm run test:coverage
```

## 📊 Monitoramento

### Logs
- Console logs estruturados
- Arquivo de log rotativo
- Error tracking

### Métricas
- Performance de APIs
- Uso de memória
- Conexões WhatsApp ativas

## 🔗 Links Úteis

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [WhatsApp Web.js](https://wwebjs.dev/)
- [OpenAI API](https://platform.openai.com/docs)