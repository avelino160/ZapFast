# PilotZap Frontend

Frontend React + TypeScript para a plataforma PilotZap.

## 🛠 Tecnologias

- **React 18** + TypeScript
- **Vite** - Build tool e dev server
- **TailwindCSS** - Styling
- **Shadcn/ui** - Componentes UI
- **React Query** - Data fetching e cache
- **React Flow** - Editor visual de funis
- **Wouter** - Roteamento
- **Framer Motion** - Animações

## 📁 Estrutura

```
frontend/
├── client/
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── hooks/        # React hooks customizados
│   │   ├── lib/          # Utilitários e config
│   │   └── assets/       # Assets estáticos
│   └── public/           # Assets públicos
├── package.json          # Dependências
├── vite.config.ts       # Configuração Vite
├── tailwind.config.ts   # Configuração Tailwind
└── tsconfig.json        # Configuração TypeScript
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificação de tipos
npm run type-check
```

## 🎨 Componentes Principais

### Páginas
- **Dashboard** - Visão geral e estatísticas
- **Funis** - Editor visual de funis de conversação
- **Campanhas** - Sistema de disparos em massa
- **Chatbot AI** - Configuração do chatbot inteligente
- **Contatos** - Gestão de contatos e segmentação
- **Conversas** - Histórico e chat em tempo real
- **Referral** - Sistema de indicações
- **Integrações** - Conexões externas

### Componentes UI
- **FlowCanvas** - Editor visual drag-and-drop
- **WhatsAppPreview** - Preview das mensagens
- **ContactManager** - Gestão de contatos
- **MessageComposer** - Composição de mensagens
- **VariableAutocomplete** - Sistema @variável

## 🔌 Integração com Backend

O frontend se comunica com o backend via:
- **REST API** - Endpoints para CRUD
- **WebSocket** - Comunicação em tempo real
- **Push Notifications** - Service Worker

### Configuração da API
```typescript
// lib/queryClient.ts
const API_BASE_URL = 'http://localhost:5000';
```

## 🎯 Funcionalidades

### Sistema de Autocomplete (@variáveis)
- Detecção automática do caractere @
- Popup com variáveis disponíveis
- Navegação por teclado (↑↓, Enter, Esc)
- Conversão automática @ → {{}} no backend

### Editor Visual de Funis
- Drag-and-drop de nós
- Múltiplos tipos: texto, imagem, vídeo, áudio
- Condicionais e botões interativos
- Preview em tempo real

### Sistema de Notificações
- Service Worker integrado
- Push notifications nativas
- Toasts para feedback do usuário

## 🔧 Configuração de Desenvolvimento

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar Tailwind** (já configurado)
```bash
# As configurações estão em tailwind.config.ts
```

3. **Iniciar desenvolvimento**
```bash
npm run dev
# Acesse: http://localhost:5173
```

## 📦 Build para Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview

# Deploy da pasta dist/
```

## 🧪 Estrutura de Testes (futuro)

```bash
# Instalar dependências de teste
npm install -D @testing-library/react vitest

# Executar testes
npm run test
```

## 🎨 Customização de Tema

O tema é configurado via Tailwind + CSS variables:

```css
/* src/index.css */
:root {
  --primary: 220 90% 56%;
  --secondary: 220 14.3% 95.9%;
  /* ... outras variáveis */
}
```

## 🔗 Links Úteis

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)