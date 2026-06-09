# 🔗 Sistema de Webhooks - Guia Completo

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Webhooks Disponíveis](#webhooks-disponíveis)
3. [Configuração](#configuração)
4. [Como Usar Cada Webhook](#como-usar-cada-webhook)
5. [Testes](#testes)
6. [Segurança](#segurança)

---

## 🎯 Visão Geral

O sistema agora suporta **11 webhooks** de integrações diferentes:

### ✅ Implementados e Funcionais

| Categoria | Serviço | Status | URL |
|-----------|---------|--------|-----|
| 💳 **Pagamentos** | Stripe | ✅ Ativo | `/api/webhooks/stripe` |
| 💰 **Pagamentos** | Mercado Pago | ✅ Ativo | `/api/webhooks/mercadopago` |
| 🤝 **Automação** | Zapier | ✅ Ativo | `/api/webhooks/zapier` |
| 📊 **Planilhas** | Google Sheets | ✅ Ativo | `/api/webhooks/google-sheets` |
| 🤖 **IA** | OpenAI/ChatGPT | ✅ Ativo | `/api/webhooks/openai` |
| 📧 **E-mail** | SendGrid | ✅ Ativo | `/api/webhooks/sendgrid` |
| 📨 **E-mail** | Mailgun | ✅ Ativo | `/api/webhooks/mailgun` |
| 📞 **Telefonia** | Twilio | ✅ Ativo | `/api/webhooks/twilio` |
| 🎫 **CRM** | HubSpot | ✅ Ativo | `/api/webhooks/hubspot` |
| 💼 **CRM** | Pipedrive | ✅ Ativo | `/api/webhooks/pipedrive` |
| 🔧 **Testes** | Generic | ✅ Ativo | `/api/webhooks/generic` |

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# Webhook Secrets
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_secret_here
MERCADOPAGO_SECRET=your_mercadopago_secret_here
SENDGRID_WEBHOOK_SECRET=your_sendgrid_secret_here
MAILGUN_WEBHOOK_SECRET=your_mailgun_secret_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
HUBSPOT_SECRET=your_hubspot_secret_here
PIPEDRIVE_SECRET=your_pipedrive_secret_here
ADMIN_SECRET=pilotzap-admin-2024
```

### 2. Rotas Registradas

As rotas foram automaticamente registradas em `server/routes.ts`:

```typescript
import { registerWebhookRoutes } from "./routes-webhooks";

// No registerRoutes()
registerWebhookRoutes(app);
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

---

## 📡 Webhooks Disponíveis

### 🔍 Listar Todos os Webhooks

**Endpoint:** `GET /api/webhooks/list`

**Exemplo:**
```bash
curl http://localhost:5000/api/webhooks/list
```

**Resposta:**
```json
{
  "total": 11,
  "baseUrl": "http://localhost:5000",
  "webhooks": [
    {
      "name": "Stripe",
      "url": "/api/webhooks/stripe",
      "method": "POST",
      "auth": false,
      "description": "Pagamentos com Stripe"
    },
    ...
  ]
}
```

---

## 💳 1. Stripe - Pagamentos

### Configuração no Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. URL: `https://seudominio.com/api/webhooks/stripe`
4. Eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

### Eventos Suportados

```javascript
// Pagamento bem-sucedido
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "metadata": {
        "userId": "user-123",
        "planType": "pro",
        "durationDays": "30"
      }
    }
  }
}
```

### O que Acontece?

✅ Ativa o plano automaticamente  
✅ Envia notificação push de confirmação  
✅ Atualiza banco de dados  
❌ Bloqueia usuário se assinatura cancelada

### Testar

```bash
# Simular pagamento aprovado
curl -X POST http://localhost:5000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "metadata": {
          "userId": "110a8de0-308e-4844-be67-22fbb126ab7e",
          "planType": "pro",
          "durationDays": "30"
        }
      }
    }
  }'
```

---

## 💰 2. Mercado Pago - Pagamentos

### Configuração no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Configure Webhooks em **"Notificações"**
3. URL: `https://seudominio.com/api/webhooks/mercadopago`
4. Eventos: `payment`

### Exemplo de Payload

```json
{
  "type": "payment",
  "data": {
    "id": "1234567890"
  }
}
```

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": { "id": "1234567890" }
  }'
```

---

## 🤝 3. Zapier - Automações

### Configuração no Zapier

1. Crie um Zap
2. Trigger: Qualquer evento (formulário, CRM, etc.)
3. Action: **Webhooks by Zapier** > POST
4. URL: `https://seudominio.com/api/webhooks/zapier`
5. Headers: `Cookie: zapfast.sid=your_session_cookie`

### Casos de Uso

#### A) Novo Lead de Formulário
```json
{
  "event": "new_lead",
  "data": {
    "phone": "5511999999999",
    "name": "João Silva",
    "email": "joao@email.com",
    "tags": ["formulario-site"],
    "funnelId": "funnel-id-aqui",
    "message": "Quero saber mais"
  }
}
```

#### B) Enviar Mensagem Direta
```json
{
  "event": "send_message",
  "data": {
    "phone": "5511999999999",
    "message": "Olá! Recebemos sua solicitação."
  }
}
```

### ⚠️ Requer Autenticação

Use o cookie de sessão ou token JWT.

### Testar

```bash
# 1. Fazer login primeiro
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "suasenha"
  }' \
  -c cookies.txt

# 2. Testar webhook
curl -X POST http://localhost:5000/api/webhooks/zapier \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "event": "new_lead",
    "data": {
      "phone": "5511999999999",
      "name": "João Silva",
      "email": "joao@email.com",
      "funnelId": "seu-funnel-id"
    }
  }'
```

---

## 📊 4. Google Sheets - Sincronização

### Configuração no Google Sheets

Use **Google Apps Script** ou **Zapier**:

```javascript
// Google Apps Script
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var row = e.range.getRow();
  var rowData = sheet.getRange(row, 1, 1, 4).getValues()[0];
  
  var payload = {
    action: 'row_updated',
    row: rowData,
    rowIndex: row
  };
  
  UrlFetchApp.fetch('https://seudominio.com/api/webhooks/google-sheets', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Cookie': 'zapfast.sid=YOUR_SESSION' },
    payload: JSON.stringify(payload)
  });
}
```

### Formato da Planilha

| Coluna A | Coluna B | Coluna C | Coluna D |
|----------|----------|----------|----------|
| Telefone | Nome | Email | Tags |
| 5511999999999 | João Silva | joao@email.com | cliente,vip |

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/google-sheets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "action": "row_added",
    "row": ["5511999999999", "João Silva", "joao@email.com", "cliente,vip"]
  }'
```

---

## 🤖 5. OpenAI / ChatGPT - IA

### Caso de Uso

Usar IA para responder automaticamente mensagens dos contatos.

### Como Funciona

1. Contato envia mensagem → Seu sistema processa
2. Envia para OpenAI → Recebe resposta
3. OpenAI envia resposta via webhook → Sistema envia ao contato

### Exemplo de Payload

```json
{
  "contactId": "contact-123",
  "question": "Qual o horário de funcionamento?",
  "answer": "Funcionamos de segunda a sexta, das 9h às 18h.",
  "conversationId": "conv-456"
}
```

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/openai \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "contactId": "contact-id-aqui",
    "answer": "Olá! Seu pedido foi processado com sucesso.",
    "conversationId": "conv-123"
  }'
```

---

## 📧 6. SendGrid - E-mail

### Configuração no SendGrid

1. Acesse: https://app.sendgrid.com/settings/mail_settings
2. Event Webhook Settings
3. URL: `https://seudominio.com/api/webhooks/sendgrid`
4. Eventos: `delivered`, `bounce`, `dropped`, `open`, `click`

### Eventos Suportados

```json
[
  {
    "event": "delivered",
    "email": "cliente@email.com",
    "timestamp": 1234567890
  },
  {
    "event": "bounce",
    "email": "invalido@email.com",
    "reason": "550 Invalid email address"
  }
]
```

### O que Acontece?

✅ E-mail entregue → Log  
❌ Bounce/Drop → Marca contato como "email-invalido"  
👁️ Aberto → Log  
🖱️ Clique → Log

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '[
    {
      "event": "delivered",
      "email": "teste@email.com",
      "timestamp": 1234567890
    }
  ]'
```

---

## 📨 7. Mailgun - E-mail

### Configuração no Mailgun

1. Acesse: https://app.mailgun.com/app/webhooks
2. Add Webhook
3. URL: `https://seudominio.com/api/webhooks/mailgun`
4. Eventos: `delivered`, `failed`, `opened`, `clicked`

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/mailgun \
  -H "Content-Type: application/json" \
  -d '{
    "event": "delivered",
    "recipient": "teste@email.com",
    "message": { "headers": { "message-id": "msg-123" } }
  }'
```

---

## 📞 8. Twilio - Telefonia

### Configuração no Twilio

1. Acesse: https://console.twilio.com/
2. Phone Numbers → Configure
3. Voice & Fax: `https://seudominio.com/api/webhooks/twilio`

### Exemplo de Payload

```json
{
  "CallStatus": "completed",
  "From": "+5511999999999",
  "To": "+5511888888888",
  "Direction": "inbound",
  "RecordingUrl": "https://api.twilio.com/recording.mp3",
  "CallSid": "CA123abc"
}
```

### O que Acontece?

✅ Cria/atualiza contato  
✅ Salva registro da chamada  
✅ Armazena URL da gravação

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/twilio \
  -d "CallStatus=completed" \
  -d "From=+5511999999999" \
  -d "To=+5511888888888" \
  -d "Direction=inbound" \
  -d "CallSid=CA123abc"
```

---

## 🎫 9. HubSpot - CRM

### Configuração no HubSpot

1. Acesse: https://app.hubspot.com/
2. Settings → Integrations → Webhooks
3. Webhook URL: `https://seudominio.com/api/webhooks/hubspot`
4. Subscription: `contact.creation`, `contact.propertyChange`

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/hubspot \
  -H "Content-Type: application/json" \
  -d '[
    {
      "subscriptionType": "contact.creation",
      "objectId": 12345,
      "propertyName": "email",
      "propertyValue": "novo@contato.com"
    }
  ]'
```

---

## 💼 10. Pipedrive - CRM

### Configuração no Pipedrive

1. Acesse: https://app.pipedrive.com/
2. Settings → Webhooks
3. URL: `https://seudominio.com/api/webhooks/pipedrive`
4. Eventos: `added.person`, `updated.person`, `won.deal`

### Exemplo de Payload

```json
{
  "event": "added.person",
  "current": {
    "id": 123,
    "name": "João Silva",
    "phone": [{ "value": "5511999999999", "primary": true }],
    "email": [{ "value": "joao@email.com", "primary": true }]
  }
}
```

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/pipedrive \
  -H "Content-Type: application/json" \
  -d '{
    "event": "added.person",
    "current": {
      "name": "João Silva",
      "phone": [{ "value": "5511999999999" }],
      "email": [{ "value": "joao@email.com" }]
    }
  }'
```

---

## 🔧 11. Generic - Testes

### Webhook Genérico para Qualquer Teste

**⚠️ Requer autenticação**

### Testar

```bash
curl -X POST http://localhost:5000/api/webhooks/generic \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "teste": "funcionando",
    "dados": { "qualquer": "coisa" }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "received": {
    "teste": "funcionando",
    "dados": { "qualquer": "coisa" }
  },
  "timestamp": "2026-06-08T12:00:00.000Z"
}
```

---

## 🔒 Segurança

### 1. Validação de Assinaturas

Alguns webhooks validam assinaturas:

- **Stripe**: Valida com `stripe-signature` header
- **Twilio**: Valida com `X-Twilio-Signature`
- **Outros**: Implementar conforme documentação

### 2. HTTPS Obrigatório

Em produção, **sempre use HTTPS**:

```bash
# ❌ NÃO USE
http://seudominio.com/api/webhooks/stripe

# ✅ USE
https://seudominio.com/api/webhooks/stripe
```

### 3. Secrets

Nunca compartilhe seus secrets:

```bash
# .env (NÃO COMMITAR)
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz
```

### 4. Rate Limiting

Considere implementar rate limiting:

```typescript
// Exemplo com express-rate-limit
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições
});

app.post('/api/webhooks/:service', webhookLimiter, ...);
```

---

## 🧪 Testar Todos os Webhooks

### Script de Teste Completo

Crie `test-all-webhooks.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "🧪 Testando todos os webhooks..."

# 1. Stripe
echo "\n💳 1. Stripe"
curl -X POST $BASE_URL/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed","data":{"object":{"metadata":{"userId":"test-user","planType":"pro","durationDays":"30"}}}}'

# 2. Mercado Pago
echo "\n\n💰 2. Mercado Pago"
curl -X POST $BASE_URL/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123"}}'

# 3. SendGrid
echo "\n\n📧 3. SendGrid"
curl -X POST $BASE_URL/api/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '[{"event":"delivered","email":"test@email.com"}]'

# 4. Mailgun
echo "\n\n📨 4. Mailgun"
curl -X POST $BASE_URL/api/webhooks/mailgun \
  -H "Content-Type: application/json" \
  -d '{"event":"delivered","recipient":"test@email.com"}'

# 5. Twilio
echo "\n\n📞 5. Twilio"
curl -X POST $BASE_URL/api/webhooks/twilio \
  -d "CallStatus=completed&From=+5511999999999&Direction=inbound"

# 6. HubSpot
echo "\n\n🎫 6. HubSpot"
curl -X POST $BASE_URL/api/webhooks/hubspot \
  -H "Content-Type: application/json" \
  -d '[{"subscriptionType":"contact.creation","objectId":123}]'

# 7. Pipedrive
echo "\n\n💼 7. Pipedrive"
curl -X POST $BASE_URL/api/webhooks/pipedrive \
  -H "Content-Type: application/json" \
  -d '{"event":"added.person","current":{"name":"Test","phone":[{"value":"5511999999999"}]}}'

echo "\n\n✅ Testes concluídos!"
```

Execute:
```bash
chmod +x test-all-webhooks.sh
./test-all-webhooks.sh
```

---

## 📊 Monitoramento

### Logs no Console

Todos os webhooks geram logs:

```
💳 [STRIPE] Evento recebido: checkout.session.completed
✅ [STRIPE] Plano pro ativado para user-123

💰 [MERCADO PAGO] Evento recebido: payment
✅ [MERCADO PAGO] Plano ativado para user-123

🤝 [ZAPIER] Evento recebido: new_lead
✅ [ZAPIER] Contato criado: contact-456
```

### Dashboard de Webhooks

Considere adicionar um dashboard:

```typescript
// GET /api/webhooks/stats
app.get('/api/webhooks/stats', async (req, res) => {
  // Retornar estatísticas de webhooks recebidos
  // Implementar conforme necessidade
});
```

---

## 🚀 Próximos Passos

### Melhorias Sugeridas

1. **Retry Logic**: Reenviar webhooks falhados
2. **Queue System**: Redis/Bull para processar assincronamente
3. **Dashboard**: Visualizar webhooks em tempo real
4. **Logs**: Salvar no banco para auditoria
5. **Alertas**: Notificar em caso de falhas

### Exemplo de Queue com Bull

```typescript
import Bull from 'bull';

const webhookQueue = new Bull('webhooks', {
  redis: process.env.REDIS_URL
});

webhookQueue.process(async (job) => {
  const { service, data } = job.data;
  // Processar webhook
});

// Adicionar à fila
app.post('/api/webhooks/:service', async (req, res) => {
  await webhookQueue.add({ service: req.params.service, data: req.body });
  res.json({ queued: true });
});
```

---

## 📝 Resumo

✅ **11 webhooks implementados**  
✅ **Rotas registradas em `server/routes.ts`**  
✅ **Variáveis de ambiente configuradas**  
✅ **Documentação completa**  
✅ **Exemplos de teste para cada webhook**  
✅ **Sistema pronto para uso**

### Comandos Rápidos

```bash
# Listar webhooks
curl http://localhost:5000/api/webhooks/list

# Testar webhook genérico (com autenticação)
curl -X POST http://localhost:5000/api/webhooks/generic \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teste":"ok"}'

# Ver logs
# Os webhooks geram logs automáticos no console
```

---

**🎉 Sistema de Webhooks Completo e Funcional!**
