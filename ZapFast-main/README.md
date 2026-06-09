# PilotZap - Plataforma de Automação WhatsApp

🚀 **Plataforma completa para automação e gestão de WhatsApp Business**

## ✨ Funcionalidades Principais

### 🤖 **Chatbot AI Inteligente**
- Integração com OpenAI GPT (4 modelos disponíveis)
- Memória de conversação contextual
- Personalização completa de prompts
- Sistema de gatilhos por palavras-chave

### 📢 **Campanhas de Disparos em Massa**
- Sistema de queue com retry automático
- Personalização com variáveis (@nome, @email, @telefone)
- Agendamento de campanhas
- Progresso em tempo real
- Suporte a múltiplas mídias

### 🎯 **Funis de Conversação**
- Editor visual drag-and-drop
- Múltiplos tipos de nós (texto, imagem, vídeo, áudio)
- Condicionais e botões interativos
- Preview em tempo real no WhatsApp

### 👥 **Gestão de Contatos**
- Importação e exportação
- Segmentação avançada
- Tags personalizadas
- Histórico completo de conversas

### 🔗 **Sistema de Referral**
- Códigos únicos permanentes
- Compartilhamento em redes sociais
- Níveis de recompensa progressivos
- Dashboard de acompanhamento

### 🔔 **Notificações Push**
- Notificações em tempo real
- Service Worker integrado
- Suporte offline
- Múltiplas plataformas

## 🛠 Tecnologias

### Frontend
- **React** + TypeScript
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **Shadcn/ui** (components)
- **React Flow** (visual editor)
- **React Query** (data fetching)

### Backend
- **Node.js** + Express
- **TypeScript**
- **SQLite** com Drizzle ORM
- **WhatsApp Web.js**
- **OpenAI API**

## 📁 Estrutura do Projeto

```
pilotzap/
├── 🎨 frontend/              # Frontend React
│   ├── client/               # Código React (src/, components/, pages/)
│   ├── public/              # Assets estáticos
│   ├── docs/                # Documentação específica frontend
│   ├── package.json         # Dependências frontend
│   ├── README.md            # Guia completo frontend
│   └── configs...           # Vite, Tailwind, TypeScript
├── ⚡ backend/               # Backend Node.js
│   ├── server/              # Código servidor (routes/, services/, db/)
│   ├── shared/              # Tipos e schemas compartilhados
│   ├── attached_assets/     # Uploads e mídias processadas
│   ├── auth_info/           # Sessões WhatsApp
│   ├── migrations/          # Migrações banco de dados
│   ├── scripts/             # Scripts de migração e setup
│   ├── tools/               # Ferramentas utilitárias
│   ├── docs/                # Documentação específica backend
│   ├── .env                 # Variáveis de ambiente
│   ├── package.json         # Dependências backend
│   ├── README.md            # Guia completo backend
│   └── configs...           # Drizzle, TypeScript
├── 📄 package.json          # Configuração monorepo
├── 📖 README.md             # Documentação principal
├── 🚫 .gitignore            # Git ignore
├── 🎨 .prettierrc           # Formatação de código
└── ⚙️ tsconfig.json         # TypeScript config global
```

## 🚀 Deploy

### Desenvolvimento Local
```bash
# Instalar todas as dependências
npm run install:all

# Configurar ambiente
cp .env.example backend/.env
# Editar backend/.env com suas configurações

# Iniciar desenvolvimento
npm run dev
```

### Deploy na Vercel
Para deploy em produção na Vercel, veja o guia completo: [README-VERCEL.md](README-VERCEL.md)

```bash
# Quick deploy
vercel

# Deploy em produção
vercel --prod
```

**Variáveis essenciais para Vercel:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session secret key
- `OPENAI_API_KEY` - OpenAI API key para chatbot
- `NODE_ENV=production`

### Variáveis de Ambiente
```env
# WhatsApp
WHATSAPP_SESSION_PATH=./auth_info

# OpenAI
OPENAI_API_KEY=sk-...

# Push Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=...

# Banco de Dados
DATABASE_URL=./database.sqlite

# Porta do servidor
PORT=5000
```

## 📖 Documentação

A documentação completa está disponível na pasta `docs/`:
- [Guia de Início Rápido](docs/INICIO-RAPIDO.md)
- [Sistema de Disparos](docs/DISPAROS-MASSA.md)
- [Chatbot AI](docs/CHATBOT-AI.md)
- [Webhooks](docs/WEBHOOKS-COMPLETO.md)
- [Notificações Push](docs/PUSH-NOTIFICATIONS.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@pilotzap.tech
- 💬 WhatsApp: [Clique aqui](https://wa.me/...)
- 📚 Documentação: [docs.pilotzap.tech](https://docs.pilotzap.tech)

---

**PilotZap** - Automatize seu WhatsApp Business com inteligência! 🚀