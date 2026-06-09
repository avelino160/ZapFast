# 📱 Guia Visual - Sistema de Notificações Push

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USUÁRIO ACESSA CONFIGURAÇÕES                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INTERFACE DE NOTIFICAÇÕES                                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  📱 Notificações Push                           [Inativas]     │ │
│  │  ⚠️ Desativadas - Ative para receber alertas                  │ │
│  │                                                                 │ │
│  │  [Ativar Notificações Push]                                    │ │
│  │  🌍 Funciona em iOS, Android e PC                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ CLIQUE
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR SOLICITA PERMISSÃO                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  🔔 zapfast.com deseja enviar notificações                     │ │
│  │                                                                 │ │
│  │     [Bloquear]           [Permitir]                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ USUÁRIO PERMITE
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  REGISTRO DO SERVICE WORKER                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  1. Registra /sw.js                                            │ │
│  │  2. Obtém VAPID public key do servidor                         │ │
│  │  3. Cria subscrição push no navegador                          │ │
│  │  4. Envia subscrição para /api/push/subscribe                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SERVIDOR SALVA SUBSCRIÇÃO                                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  pushNotificationService.saveSubscription()                    │ │
│  │    ↓                                                            │ │
│  │  storage.savePushSubscription()                                │ │
│  │    ↓                                                            │ │
│  │  INSERT INTO push_subscriptions                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INTERFACE ATUALIZADA                                               │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  📱 Notificações Push                           [Ativas] ✅    │ │
│  │  ✅ Ativas - Você receberá alertas em tempo real              │ │
│  │                                                                 │ │
│  │  [Desativar Notificações Push]                                 │ │
│  │  🌍 Funciona em iOS, Android e PC                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔔 Tipos de Notificações

### 1️⃣ Alerta de Desconexão do WhatsApp

```
┌─────────────────────────────────────────────────────────────────────┐
│  WhatsApp Service detecta desconexão                                │
│  ↓                                                                   │
│  whatsappService.disconnect(userId)                                 │
│  ↓                                                                   │
│  pushNotificationService.sendDisconnectionAlert(userId, phoneNumber)│
│  ↓                                                                   │
│  webpush.sendNotification()                                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DISPOSITIVO DO USUÁRIO                                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  ⚠️ WhatsApp Desconectado                                      │ │
│  │  Seu WhatsApp +5511999999999 foi desconectado                  │ │
│  │                                                        [Abrir]   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 2️⃣ Aviso de Renovação de Plano

```
┌─────────────────────────────────────────────────────────────────────┐
│  Cron Job verifica expiração (diariamente)                          │
│  ↓                                                                   │
│  checkPlanExpirations()                                             │
│  ↓                                                                   │
│  pushNotificationService.sendRenewalWarning(userId, 7, "Pro")       │
│  ↓                                                                   │
│  webpush.sendNotification()                                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DISPOSITIVO DO USUÁRIO                                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  🔔 Renovação Próxima                                          │ │
│  │  Seu plano Pro expira em 7 dias. Renove agora!                 │ │
│  │                                                        [Abrir]   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 3️⃣ Novidades da Plataforma

```
┌─────────────────────────────────────────────────────────────────────┐
│  Admin envia via API ou Interface                                   │
│  ↓                                                                   │
│  POST /api/push/test/news                                           │
│  ↓                                                                   │
│  pushNotificationService.sendPlatformNews(...)                      │
│  ↓                                                                   │
│  webpush.sendNotification()                                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DISPOSITIVO DO USUÁRIO                                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  🎉 Nova Funcionalidade                                         │ │
│  │  Agora você pode agendar mensagens para envio automático!       │ │
│  │                                                        [Abrir]   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🌍 Compatibilidade por Plataforma

### 💻 Desktop

```
┌──────────────┬───────────────────────────────────────┐
│   Windows    │  ✅ Chrome, Firefox, Edge, Opera       │
├──────────────┼───────────────────────────────────────┤
│    macOS     │  ✅ Chrome, Firefox, Edge, Opera       │
│              │  ❌ Safari (não suporta push)          │
├──────────────┼───────────────────────────────────────┤
│    Linux     │  ✅ Chrome, Firefox, Opera             │
└──────────────┴───────────────────────────────────────┘
```

### 📱 Mobile

```
┌──────────────┬───────────────────────────────────────┐
│   Android    │  ✅ Chrome 51+                         │
│              │  ✅ Firefox 44+                        │
│              │  ✅ Samsung Internet 5+                │
├──────────────┼───────────────────────────────────────┤
│     iOS      │  ✅ Safari 16.4+                       │
│              │  ⚠️ Apenas com app na Home Screen     │
│              │  ⚠️ Notificações só em background     │
└──────────────┴───────────────────────────────────────┘
```

---

## 🔄 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  usePushNotifications Hook                                     │ │
│  │  ├─ isSupported: boolean                                       │ │
│  │  ├─ permission: NotificationPermission                         │ │
│  │  ├─ isSubscribed: boolean                                      │ │
│  │  ├─ requestPermission()                                        │ │
│  │  ├─ subscribe()                                                │ │
│  │  └─ unsubscribe()                                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                ↓                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Settings Page                                                 │ │
│  │  └─ Seção de Notificações com UI integrada                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                            BACKEND                                  │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  API Routes (/api/push/*)                                      │ │
│  │  ├─ GET  /vapid-public-key                                     │ │
│  │  ├─ POST /subscribe                                            │ │
│  │  ├─ POST /unsubscribe                                          │ │
│  │  ├─ POST /send                                                 │ │
│  │  ├─ POST /test/disconnection                                   │ │
│  │  ├─ POST /test/renewal                                         │ │
│  │  └─ POST /test/news                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                ↓                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  pushNotificationService                                       │ │
│  │  ├─ saveSubscription()                                         │ │
│  │  ├─ removeSubscription()                                       │ │
│  │  ├─ sendToUser()                                               │ │
│  │  ├─ sendDisconnectionAlert()                                   │ │
│  │  ├─ sendRenewalWarning()                                       │ │
│  │  ├─ sendPlatformNews()                                         │ │
│  │  └─ sendToAll() (broadcast)                                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                ↓                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Storage Layer                                                 │ │
│  │  ├─ savePushSubscription()                                     │ │
│  │  ├─ removePushSubscription()                                   │ │
│  │  ├─ getUserPushSubscriptions()                                 │ │
│  │  └─ getAllUsers()                                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                ↓                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                           │ │
│  │  └─ push_subscriptions table                                   │ │
│  │     ├─ id                                                       │ │
│  │     ├─ user_id                                                 │ │
│  │     ├─ endpoint                                                │ │
│  │     ├─ p256dh                                                  │ │
│  │     ├─ auth                                                    │ │
│  │     └─ user_agent                                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Web Push Protocol
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                      PUSH NOTIFICATION SERVICE                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Service Worker (sw.js)                                        │ │
│  │  ├─ Recebe push events                                         │ │
│  │  ├─ Exibe notificações                                         │ │
│  │  ├─ Trata cliques                                              │ │
│  │  └─ Background sync                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                       DISPOSITIVO DO USUÁRIO                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  🔔 Notificação exibida                                        │ │
│  │  ├─ Desktop: Canto da tela                                     │ │
│  │  ├─ Android: Barra de notificação                              │ │
│  │  └─ iOS: Centro de notificações                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Dados

### Database Schema

```sql
CREATE TABLE push_subscriptions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

### Payload de Notificação

```typescript
{
  title: string,           // "⚠️ WhatsApp Desconectado"
  body: string,            // "Seu WhatsApp foi desconectado"
  icon: string,            // "/attached_assets/favicon.png"
  badge: string,           // "/attached_assets/favicon.png"
  url: string,             // "/whatsapp-connection"
  tag: string,             // "whatsapp-disconnect"
  requireInteraction: boolean,  // true para alertas importantes
  data: {                  // Dados extras
    type: string,
    phoneNumber: string,
    // ... outros dados
  }
}
```

---

## 🎨 Estados da Interface

### Estado Inicial (Desativado)
```
┌───────────────────────────────────────────────────────────────┐
│  📱 Notificações Push                           [Inativas]     │
│  ⚠️ Desativadas - Ative para receber alertas                  │
│                                                                 │
│  [Ativar Notificações Push]                                    │
│  🌍 Funciona em iOS, Android e PC                             │
└───────────────────────────────────────────────────────────────┘
```

### Estado de Loading
```
┌───────────────────────────────────────────────────────────────┐
│  📱 Notificações Push                           [Inativas]     │
│  ⚠️ Desativadas - Ative para receber alertas                  │
│                                                                 │
│  [⟳ Ativando...]                                               │
│  🌍 Funciona em iOS, Android e PC                             │
└───────────────────────────────────────────────────────────────┘
```

### Estado Ativado
```
┌───────────────────────────────────────────────────────────────┐
│  📱 Notificações Push                           [Ativas] ✅    │
│  ✅ Ativas - Você receberá alertas em tempo real              │
│                                                                 │
│  [Desativar Notificações Push]                                 │
│  🌍 Funciona em iOS, Android e PC                             │
└───────────────────────────────────────────────────────────────┘
```

### Estado de Erro
```
┌───────────────────────────────────────────────────────────────┐
│  📱 Notificações Push                           [Inativas]     │
│  ⚠️ Desativadas - Ative para receber alertas                  │
│                                                                 │
│  ❌ Permissão negada para notificações                         │
│                                                                 │
│  [Ativar Notificações Push]                                    │
│  🌍 Funciona em iOS, Android e PC                             │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚦 Código de Teste Rápido

### Console do Navegador (DevTools)

```javascript
// 1. Verificar se está subscrito
navigator.serviceWorker.ready
  .then(reg => reg.pushManager.getSubscription())
  .then(sub => console.log('Subscrito:', sub !== null));

// 2. Testar notificação de desconexão
fetch('/api/push/test/disconnection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ phoneNumber: '+5511999999999' })
}).then(r => r.json()).then(console.log);

// 3. Testar notificação de renovação
fetch('/api/push/test/renewal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ daysLeft: 3, planType: 'Pro' })
}).then(r => r.json()).then(console.log);

// 4. Testar notificação personalizada
fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    title: 'Teste',
    body: 'Esta é uma notificação de teste!',
    url: '/dashboard'
  })
}).then(r => r.json()).then(console.log);
```

---

## ✅ Checklist de Verificação

Antes de considerar o sistema completo, verifique:

- [x] Tabela `push_subscriptions` existe no banco
- [x] VAPID keys configuradas no `.env`
- [x] Service Worker `sw.js` acessível em `/sw.js`
- [x] Hook `usePushNotifications` funcionando
- [x] UI de notificações na página de Settings
- [x] Rotas de API respondendo
- [x] WhatsApp service enviando notificações
- [x] Subscrições sendo salvas no banco
- [x] Notificações chegando no dispositivo
- [x] Cliques nas notificações redirecionando corretamente

---

## 🎓 Resumo para Desenvolvedores

### Para ativar notificações (usuário):
1. Settings → Notificações → Ativar

### Para enviar notificação (código):
```typescript
import { pushNotificationService } from './services/pushNotificationService';

// Enviar para um usuário
await pushNotificationService.sendToUser(userId, {
  title: 'Título',
  body: 'Mensagem',
  url: '/dashboard'
});

// Alerta de desconexão
await pushNotificationService.sendDisconnectionAlert(userId, phoneNumber);

// Aviso de renovação
await pushNotificationService.sendRenewalWarning(userId, daysLeft, planType);

// Novidade
await pushNotificationService.sendPlatformNews(userId, title, description, url);

// Broadcast
await pushNotificationService.sendToAll({ title: '...', body: '...' });
```

---

**Sistema completo e documentado!** 🎉
