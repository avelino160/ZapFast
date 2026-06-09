# 🔔 Sistema de Notificações Automáticas

## ✅ Status Atual

### 1. **⚠️ Desconexão do WhatsApp** - ✅ AUTOMÁTICA

**Status:** Implementada e funcionando

**Como funciona:**
- Quando o WhatsApp desconecta (método `whatsappService.disconnect()`)
- O sistema **automaticamente** detecta e envia notificação push
- Usuário recebe alerta em tempo real no dispositivo

**Código:**
```typescript
// server/services/whatsappService.ts - linha ~190
async disconnect(userId: string): Promise<void> {
  // ... código de desconexão ...
  
  // 📱 Envio automático da notificação
  await pushNotificationService.sendDisconnectionAlert(
    userId,
    dbConn.phoneNumber
  );
}
```

**Teste:**
Para testar, basta desconectar o WhatsApp no painel de conexão.

---

### 2. **⏰ Renovação de Plano** - ✅ AUTOMÁTICA (AGORA!)

**Status:** Implementada agora! ✨

**Como funciona:**
- Verifica **todos os usuários** a cada 24 horas
- Envia notificação quando faltam: **7, 5, 3, 2 ou 1 dia**
- Se o plano expirou, **bloqueia o usuário automaticamente**

**Quando envia:**
- 7 dias antes da expiração → 🔔 "Seu plano expira em 7 dias"
- 5 dias antes da expiração → 🔔 "Seu plano expira em 5 dias"
- 3 dias antes da expiração → 🔔 "Seu plano expira em 3 dias"
- 2 dias antes da expiração → 🔔 "Seu plano expira em 2 dias"
- 1 dia antes da expiração → 🔔 "Seu plano expira em 1 dia"
- No dia da expiração → ❌ Bloqueia usuário + notificação

**Código:**
```typescript
// server/services/planExpirationService.ts
planExpirationService.start(24); // Verifica a cada 24h
```

**Configuração:**
- Intervalo padrão: 24 horas
- Para mudar: edite o número em `server/index.ts` (linha ~85)
- Exemplo: `start(12)` = verifica a cada 12 horas

---

### 3. **🎉 Novidades da Plataforma** - ⚠️ MANUAL

**Status:** Precisa ser enviada manualmente

**Como enviar:**

#### Opção A: Via API (para admins)
```bash
curl -X POST http://localhost:5000/api/push/send \
  -H "Content-Type: application/json" \
  -H "Cookie: zapfast.sid=ADMIN_SESSION" \
  -d '{
    "title": "Nova Funcionalidade",
    "body": "Agora você pode fazer X!",
    "url": "/dashboard"
  }'
```

#### Opção B: Via Código
```typescript
import { pushNotificationService } from './services/pushNotificationService';

// Para um usuário específico
await pushNotificationService.sendPlatformNews(
  userId,
  'Título da Novidade',
  'Descrição da novidade',
  '/url-destino'
);

// Para todos os usuários (broadcast)
await pushNotificationService.sendToAll({
  title: '🎉 Novidade!',
  body: 'Confira nossa nova funcionalidade!',
  url: '/dashboard'
});
```

#### Opção C: Script de teste
```bash
npx tsx test-notifications.ts
```

---

## 📊 Resumo das Notificações

| Tipo | Status | Quando Envia | Automático? |
|------|--------|-------------|-------------|
| **WhatsApp Desconectado** | ✅ Ativo | Ao desconectar | ✅ Sim |
| **Renovação de Plano** | ✅ Ativo | 7,5,3,2,1 dias antes | ✅ Sim |
| **Plano Expirado** | ✅ Ativo | No dia da expiração | ✅ Sim |
| **Novidades** | ⚠️ Manual | Quando admin enviar | ❌ Não |

---

## 🔧 Configuração

### Inicialização do Serviço

O serviço de verificação de planos inicia automaticamente com o servidor:

```typescript
// server/index.ts
server.listen(listenOptions, () => {
  // ...
  
  // ✅ Inicia automaticamente
  planExpirationService.start(24); // 24 horas
});
```

### Mudar Intervalo de Verificação

Para verificar mais frequentemente (útil para testes):

```typescript
// Verificar a cada 1 hora (teste)
planExpirationService.start(1);

// Verificar a cada 12 horas
planExpirationService.start(12);

// Verificar a cada 6 horas
planExpirationService.start(6);
```

### Verificação Manual

Para forçar uma verificação imediata:

```typescript
import { planExpirationService } from './server/services/planExpirationService';

await planExpirationService.checkExpiringPlans();
```

Ou via script:
```bash
npx tsx -e "import('./server/services/planExpirationService.js').then(s => s.planExpirationService.checkExpiringPlans())"
```

---

## 🧪 Testar o Sistema

### Teste 1: Verificação Imediata

Crie um arquivo `test-plan-check.ts`:
```typescript
import "dotenv/config";

(async () => {
  const { planExpirationService } = await import('./server/services/planExpirationService.js');
  await planExpirationService.checkExpiringPlans();
  process.exit(0);
})();
```

Execute:
```bash
npx tsx test-plan-check.ts
```

### Teste 2: Simular Plano Expirando

Para testar, você pode:
1. Atualizar um usuário no banco para ter `planExpiresAt` daqui a 3 dias
2. Executar a verificação manualmente
3. Verificar se a notificação foi enviada

```typescript
// Atualizar plano de teste
import { storage } from './server/storage';

const userId = 'SEU_USER_ID';
const in3Days = new Date();
in3Days.setDate(in3Days.getDate() + 3);

await storage.updateUserPlan(userId, 'pro', in3Days);
```

### Teste 3: Ver Status do Serviço

```typescript
import { planExpirationService } from './server/services/planExpirationService';

console.log(planExpirationService.getStatus());
// { isRunning: true, intervalId: true }
```

---

## 📋 Logs do Sistema

### Logs Esperados

Quando o servidor inicia:
```
🔔 Iniciando serviço de verificação de planos (a cada 24h)
🔍 Verificando planos expirando...
✅ Verificação concluída. 0 notificações enviadas.
```

Quando encontra plano expirando:
```
📅 Plano de user@email.com expira em 3 dias
📤 Enviando notificação para usuário: [userId]
✅ Notificação enviada para 1/1 dispositivos
✅ Notificação enviada para user@email.com
✅ Verificação concluída. 1 notificações enviadas.
```

Quando plano expira:
```
⚠️ Plano de user@email.com expirou! Bloqueando...
🔒 Usuário user@email.com bloqueado
📤 Enviando notificação de expiração...
✅ Notificação enviada
```

---

## 🎯 Próximos Passos (Opcional)

### 1. Admin Panel para Broadcasts

Criar interface para enviar notificações para todos:

```typescript
// Nova rota admin
app.post('/api/admin/broadcast', requireAdmin, async (req, res) => {
  const { title, body, url } = req.body;
  
  const result = await pushNotificationService.sendToAll({
    title,
    body,
    url: url || '/dashboard'
  });
  
  res.json({ success: true, result });
});
```

### 2. Histórico de Notificações

Salvar registro de todas as notificações enviadas:

```sql
CREATE TABLE notification_history (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  type VARCHAR, -- 'disconnection', 'renewal', 'news'
  title TEXT,
  body TEXT,
  sent_at TIMESTAMP,
  delivered BOOLEAN
);
```

### 3. Preferências Granulares

Permitir usuário escolher quais notificações quer receber:

```typescript
// Tabela user_notification_preferences
{
  userId: string,
  disconnectionAlerts: boolean,
  renewalWarnings: boolean,
  platformNews: boolean,
  broadcastMessages: boolean
}
```

---

## 🔄 Reiniciar o Servidor

Para aplicar as mudanças do serviço de verificação de planos:

```bash
# Parar servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

Você verá nos logs:
```
🔔 Iniciando serviço de verificação de planos (a cada 24h)
```

---

## ✅ Checklist Final

- [x] WhatsApp desconectado → Notificação automática ✅
- [x] Plano expirando → Verificação automática a cada 24h ✅
- [x] Notificações nos dias: 7, 5, 3, 2, 1 antes ✅
- [x] Plano expirado → Bloqueia usuário automaticamente ✅
- [x] Novidades → Envio manual via API ✅

---

## 📝 Resumo

**Sim, ambas são automáticas agora!** ✅

1. **WhatsApp Desconectado** - Já estava automática desde o início
2. **Renovação de Plano** - Acabei de implementar agora! 🎉

O servidor verifica automaticamente a cada 24 horas e envia notificações quando necessário.

**Próximo passo:** Reiniciar o servidor para ativar o serviço de verificação de planos.
