# 🎯 Sistema de Eventos - ZapFast

## ✅ Eventos que o App JÁ RECEBE

### 1. **📨 Webhook do WhatsApp** - ✅ IMPLEMENTADO

**Rota:** `POST /api/whatsapp/webhook`

**O que recebe:**
- Mensagens recebidas no WhatsApp
- Status de entrega de mensagens
- Notificações de conexão/desconexão

**Formato:**
```json
{
  "messages": [
    {
      "from": "5511999999999@s.whatsapp.net",
      "body": "oi",
      "chat_id": "5511999999999@s.whatsapp.net",
      "from_me": false,
      "timestamp": 1686172800
    }
  ]
}
```

**Como funciona:**
1. Whapi.cloud envia webhook quando recebe mensagem
2. Sistema processa a mensagem
3. Verifica se algum funil deve ser acionado
4. Cria/atualiza contato
5. Executa automação se necessário

**Código:**
```typescript
// server/routes.ts - linha ~420
app.post('/api/whatsapp/webhook', async (req, res) => {
  const messages = req.body.messages;
  
  for (const msg of messages) {
    const phoneNumber = msg.from.split('@')[0];
    const messageBody = msg.body;
    
    // Procurar funis que correspondem
    const triggeredFunnels = activeFunnels.filter(f => 
      f.triggerPhrases.some(phrase => 
        messageBody.toLowerCase().includes(phrase.toLowerCase())
      )
    );
    
    // Executar funis
    for (const funnel of triggeredFunnels) {
      await funnelService.executeFunnel(funnel.id, contact.id, messageBody);
    }
  }
});
```

**Teste:**
```bash
curl -X POST http://localhost:5000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "from": "5511999999999@s.whatsapp.net",
      "body": "oi",
      "from_me": false
    }]
  }'
```

---

### 2. **⏰ Eventos de Agendamento** - ✅ IMPLEMENTADO

**Serviço:** `schedulerService`

**O que recebe:**
- Timer de mensagens agendadas
- Timer de delays nos funis
- Timer de execuções futuras

**Como funciona:**
1. Usuário agenda mensagem para 14:00
2. Sistema salva no banco com `scheduled_at`
3. Scheduler verifica a cada minuto
4. Quando chegar a hora, envia a mensagem

**Código:**
```typescript
// Agendar mensagem
await schedulerService.scheduleMessage(
  userId,
  contactId,
  content,
  type,
  new Date('2026-06-09T14:00:00Z'),
  mediaUrl
);
```

---

### 3. **🔔 Eventos de Notificação Push** - ✅ IMPLEMENTADO

**Tipo:** Service Worker Events

**O que recebe:**
- Push notifications do servidor
- Cliques nas notificações
- Eventos de sincronização

**Como funciona:**
```javascript
// Service Worker (sw.js)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  // Exibe notificação
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    data: { url: data.url }
  });
});

self.addEventListener('notificationclick', (event) => {
  // Abre a URL quando clicar
  clients.openWindow(event.notification.data.url);
});
```

---

### 4. **📅 Eventos de Verificação de Planos** - ✅ IMPLEMENTADO

**Serviço:** `planExpirationService`

**O que recebe:**
- Timer periódico (a cada 24h)
- Verifica planos expirando

**Como funciona:**
```typescript
// Inicia ao startar o servidor
planExpirationService.start(24); // A cada 24h

// Evento dispara automaticamente
setInterval(() => {
  checkExpiringPlans(); // Verifica todos os usuários
}, 24 * 60 * 60 * 1000);
```

---

## 🆕 Eventos que PODEM SER ADICIONADOS

### 5. **💳 Webhooks de Pagamento** - ⚠️ NÃO IMPLEMENTADO

**Plataformas suportadas:**
- Stripe
- Mercado Pago
- PagSeguro
- PayPal

**Exemplo com Stripe:**
```typescript
// Nova rota
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Ativar plano do usuário
      const userId = event.data.object.metadata.userId;
      const planType = event.data.object.metadata.planType;
      await activatePlan(userId, planType);
      break;
      
    case 'customer.subscription.deleted':
      // Plano cancelado
      await blockUser(userId);
      break;
  }
  
  res.json({ received: true });
});
```

---

### 6. **📊 Webhooks de Integrações** - ⚠️ NÃO IMPLEMENTADO

**Integrações possíveis:**

#### A) **Zapier**
Receber eventos de outras plataformas via Zapier:

```typescript
app.post('/api/webhooks/zapier', requireAuth, async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'new_lead':
      // Criar novo contato
      await storage.createContact({
        userId: req.userId,
        phoneNumber: data.phone,
        name: data.name,
        email: data.email,
        tags: ['zapier']
      });
      break;
      
    case 'form_submitted':
      // Acionar funil específico
      const contact = await storage.getContactByPhone(data.phone, req.userId);
      await funnelService.executeFunnel(data.funnelId, contact.id, '');
      break;
  }
  
  res.json({ success: true });
});
```

#### B) **Google Sheets**
Sincronizar contatos com planilha:

```typescript
app.post('/api/webhooks/google-sheets', requireAuth, async (req, res) => {
  const { action, row } = req.body;
  
  if (action === 'row_added') {
    await storage.createContact({
      userId: req.userId,
      phoneNumber: row[0], // Coluna A
      name: row[1],         // Coluna B
      email: row[2]         // Coluna C
    });
  }
  
  res.json({ success: true });
});
```

---

### 7. **🤖 Webhooks de IA/ChatGPT** - ⚠️ NÃO IMPLEMENTADO

Receber respostas de IA para conversas:

```typescript
app.post('/api/webhooks/openai', requireAuth, async (req, res) => {
  const { contactId, question, answer } = req.body;
  
  // Enviar resposta da IA para o contato
  const contact = await storage.getContact(contactId, req.userId);
  await whatsappService.sendMessage(
    contact.phoneNumber,
    answer,
    req.userId
  );
  
  res.json({ success: true });
});
```

---

### 8. **📧 Webhooks de E-mail** - ⚠️ NÃO IMPLEMENTADO

Receber eventos de e-mails (SendGrid, Mailgun):

```typescript
app.post('/api/webhooks/sendgrid', async (req, res) => {
  const events = req.body;
  
  for (const event of events) {
    switch (event.event) {
      case 'delivered':
        // E-mail entregue
        await updateEmailStatus(event.email, 'delivered');
        break;
        
      case 'bounce':
        // E-mail retornou
        await markContactInvalid(event.email);
        break;
    }
  }
  
  res.json({ success: true });
});
```

---

### 9. **📞 Webhooks de Telefonia** - ⚠️ NÃO IMPLEMENTADO

Receber eventos de chamadas (Twilio, Vonage):

```typescript
app.post('/api/webhooks/twilio', async (req, res) => {
  const { CallStatus, From, To, RecordingUrl } = req.body;
  
  if (CallStatus === 'completed') {
    // Chamada completada, registrar
    await storage.createMessage({
      userId: 'user-id',
      contactId: 'contact-id',
      type: 'audio',
      content: 'Chamada telefônica',
      mediaUrl: RecordingUrl,
      status: 'delivered'
    });
  }
  
  res.json({ success: true });
});
```

---

### 10. **🎫 Webhooks de CRM** - ⚠️ NÃO IMPLEMENTADO

Integrar com HubSpot, Pipedrive, RD Station:

```typescript
app.post('/api/webhooks/hubspot', async (req, res) => {
  const { objectId, propertyName, propertyValue } = req.body;
  
  // Sincronizar contato do CRM
  const contact = await hubspot.contacts.get(objectId);
  
  await storage.updateContact(localContactId, {
    name: contact.properties.firstname,
    email: contact.properties.email,
    tags: contact.properties.lifecycle_stage
  });
  
  res.json({ success: true });
});
```

---

## 🔧 Como Adicionar Novos Webhooks

### Passo 1: Criar a Rota

```typescript
// server/routes.ts
app.post('/api/webhooks/nome-servico', async (req, res) => {
  try {
    // 1. Validar assinatura (segurança)
    const isValid = validateWebhookSignature(req);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 2. Processar evento
    const { event, data } = req.body;
    
    switch (event) {
      case 'event_type_1':
        await handleEvent1(data);
        break;
      case 'event_type_2':
        await handleEvent2(data);
        break;
    }
    
    // 3. Responder rapidamente (importante!)
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

### Passo 2: Configurar no Serviço Externo

1. Acesse o painel do serviço (Stripe, Zapier, etc)
2. Vá em Webhooks/Integrações
3. Adicione a URL: `https://seudominio.com/api/webhooks/nome-servico`
4. Copie o webhook secret
5. Adicione no `.env`: `WEBHOOK_SECRET_SERVICO=abc123`

### Passo 3: Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/nome-servico \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: signature" \
  -d '{"event": "test", "data": {}}'
```

---

## 🔒 Segurança de Webhooks

### 1. **Validar Assinatura**

Sempre valide que o webhook veio do serviço correto:

```typescript
function validateStripeSignature(req: Request): boolean {
  const signature = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    stripe.webhooks.constructEvent(req.body, signature, secret);
    return true;
  } catch (err) {
    return false;
  }
}
```

### 2. **Usar HTTPS**

Em produção, **sempre** use HTTPS para webhooks.

### 3. **Rate Limiting**

Proteja contra spam:

```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requisições
});

app.post('/api/webhooks/*', webhookLimiter);
```

### 4. **Logs**

Sempre registre eventos:

```typescript
app.post('/api/webhooks/stripe', async (req, res) => {
  console.log('📥 Webhook recebido:', {
    type: req.body.type,
    id: req.body.id,
    timestamp: new Date().toISOString()
  });
  
  // ... processar ...
});
```

---

## 📊 Webhooks Disponíveis Agora

| Webhook | Status | Rota | Descrição |
|---------|--------|------|-----------|
| WhatsApp | ✅ Ativo | `/api/whatsapp/webhook` | Recebe mensagens |
| Pagamentos | ❌ Não | - | Stripe, Mercado Pago |
| Zapier | ❌ Não | - | Integrações externas |
| E-mail | ❌ Não | - | SendGrid, Mailgun |
| CRM | ❌ Não | - | HubSpot, Pipedrive |
| Telefonia | ❌ Não | - | Twilio, Vonage |

---

## 🧪 Testar Webhooks Localmente

### Usar ngrok

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 5000
ngrok http 5000

# Copiar URL
# https://abc123.ngrok.io

# Configurar no serviço externo
# URL: https://abc123.ngrok.io/api/whatsapp/webhook
```

### Usar localtunnel

```bash
npm install -g localtunnel
lt --port 5000
```

---

## 📝 Exemplo Completo: Webhook de Pagamento

```typescript
// 1. Instalar Stripe
npm install stripe

// 2. Configurar
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 3. Criar rota
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    // Validar evento
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    
    console.log('✅ Webhook Stripe válido:', event.type);
    
    // Processar evento
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata.userId;
        const planType = session.metadata.planType;
        const durationDays = parseInt(session.metadata.durationDays);
        
        // Ativar plano
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
        
        await storage.updateUserPlan(userId, planType, expiresAt);
        
        // Enviar notificação
        await pushNotificationService.sendToUser(userId, {
          title: '✅ Pagamento Confirmado',
          body: `Seu plano ${planType} foi ativado!`,
          url: '/dashboard'
        });
        
        console.log(`✅ Plano ${planType} ativado para ${userId}`);
        break;
        
      case 'invoice.payment_failed':
        const invoice = event.data.object;
        const customerId = invoice.customer;
        
        // Notificar falha no pagamento
        console.log('❌ Pagamento falhou:', customerId);
        break;
    }
    
    res.json({ received: true });
    
  } catch (err) {
    console.error('❌ Erro no webhook Stripe:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

---

## ✅ Conclusão

**Sim, o app recebe eventos!**

### Implementados:
- ✅ Webhooks do WhatsApp
- ✅ Eventos de agendamento
- ✅ Notificações push
- ✅ Verificação de planos

### Podem ser adicionados:
- ⚠️ Webhooks de pagamento
- ⚠️ Integrações (Zapier, Google Sheets)
- ⚠️ IA/ChatGPT
- ⚠️ E-mail
- ⚠️ Telefonia
- ⚠️ CRM

**Quer que eu implemente algum webhook específico?** 🚀
