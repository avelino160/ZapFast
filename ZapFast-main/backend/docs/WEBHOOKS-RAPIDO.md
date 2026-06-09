# 🚀 Guia Rápido - Webhooks em 5 Minutos

## ✅ Status: IMPLEMENTADO E FUNCIONANDO

---

## 📋 Webhooks Disponíveis

```
✅ Stripe          → /api/webhooks/stripe          (Pagamentos)
✅ Mercado Pago    → /api/webhooks/mercadopago     (Pagamentos BR)
✅ Zapier          → /api/webhooks/zapier          (Automações)
✅ Google Sheets   → /api/webhooks/google-sheets   (Planilhas)
✅ OpenAI          → /api/webhooks/openai          (IA)
✅ SendGrid        → /api/webhooks/sendgrid        (E-mail)
✅ Mailgun         → /api/webhooks/mailgun         (E-mail)
✅ Twilio          → /api/webhooks/twilio          (Telefone)
✅ HubSpot         → /api/webhooks/hubspot         (CRM)
✅ Pipedrive       → /api/webhooks/pipedrive       (CRM)
✅ Generic         → /api/webhooks/generic         (Testes)
```

---

## 🔧 Como Usar (3 Passos)

### 1️⃣ Configure o `.env`

```bash
# Adicione seus secrets (já estão no .env)
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_secret_here
MERCADOPAGO_SECRET=your_mercadopago_secret_here
```

### 2️⃣ Reinicie o Servidor

```bash
npm run dev
```

### 3️⃣ Configure na Plataforma Externa

Exemplo **Stripe**:
1. Acesse: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://seudominio.com/api/webhooks/stripe`
3. Selecione eventos: `checkout.session.completed`, `payment_intent.succeeded`

---

## 🧪 Teste Rápido

### Listar Webhooks
```bash
curl http://localhost:5000/api/webhooks/list
```

### Testar Stripe (Simular Pagamento)
```bash
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

**Resultado:**
```json
{ "received": true }
```

**Logs no console:**
```
💳 [STRIPE] Evento recebido: checkout.session.completed
✅ [STRIPE] Plano pro ativado para 110a8de0-308e-4844-be67-22fbb126ab7e
🔔 Notificação push enviada: Pagamento Confirmado
```

---

## 🎯 Casos de Uso Comuns

### 💳 Receber Pagamento e Ativar Plano
**Webhook:** `/api/webhooks/stripe` ou `/api/webhooks/mercadopago`

**Fluxo:**
1. Cliente paga no Stripe/Mercado Pago
2. Webhook é acionado automaticamente
3. Sistema ativa o plano do usuário
4. Envia notificação push de confirmação

---

### 🤝 Criar Lead do Zapier
**Webhook:** `/api/webhooks/zapier` (requer autenticação)

**Exemplo:**
```bash
# 1. Fazer login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}' \
  -c cookies.txt

# 2. Criar lead
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

**Resultado:**
- Contato criado no sistema
- Funil acionado automaticamente
- Mensagem de boas-vindas enviada

---

### 📊 Sincronizar Google Sheets
**Webhook:** `/api/webhooks/google-sheets` (requer autenticação)

**Planilha (formato):**
| A - Telefone | B - Nome | C - Email | D - Tags |
|--------------|----------|-----------|----------|
| 5511999999999 | João | joao@email.com | vip,cliente |

**Enviar:**
```bash
curl -X POST http://localhost:5000/api/webhooks/google-sheets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "action": "row_added",
    "row": ["5511999999999", "João Silva", "joao@email.com", "vip,cliente"]
  }'
```

**Resultado:**
- Novo contato criado com dados da planilha

---

### 🤖 Resposta Automática de IA
**Webhook:** `/api/webhooks/openai` (requer autenticação)

**Fluxo:**
1. Contato envia mensagem
2. Seu sistema envia para OpenAI
3. OpenAI processa e chama o webhook
4. Sistema envia resposta ao contato

**Exemplo:**
```bash
curl -X POST http://localhost:5000/api/webhooks/openai \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "contactId": "contact-id-aqui",
    "answer": "Olá! Obrigado pelo contato. Como posso ajudar?",
    "conversationId": "conv-123"
  }'
```

---

### 📧 Rastrear E-mails (SendGrid)
**Webhook:** `/api/webhooks/sendgrid`

**O que rastreia:**
- ✅ E-mail entregue
- ❌ E-mail rejeitado (bounce)
- 👁️ E-mail aberto
- 🖱️ Link clicado

**Exemplo:**
```bash
curl -X POST http://localhost:5000/api/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '[
    {"event": "delivered", "email": "cliente@email.com"},
    {"event": "bounce", "email": "invalido@email.com"}
  ]'
```

**Resultado:**
- Logs gerados
- E-mails inválidos marcados com tag "email-invalido"

---

### 📞 Registrar Chamadas (Twilio)
**Webhook:** `/api/webhooks/twilio`

**Exemplo:**
```bash
curl -X POST http://localhost:5000/api/webhooks/twilio \
  -d "CallStatus=completed" \
  -d "From=+5511999999999" \
  -d "Direction=inbound" \
  -d "RecordingUrl=https://api.twilio.com/recording.mp3"
```

**Resultado:**
- Contato criado/atualizado
- Registro da chamada salvo
- URL da gravação armazenada

---

### 🎫 Sincronizar CRM (HubSpot/Pipedrive)
**Webhooks:** `/api/webhooks/hubspot` ou `/api/webhooks/pipedrive`

**Exemplo HubSpot:**
```bash
curl -X POST http://localhost:5000/api/webhooks/hubspot \
  -H "Content-Type: application/json" \
  -d '[{
    "subscriptionType": "contact.creation",
    "objectId": 12345
  }]'
```

**Exemplo Pipedrive:**
```bash
curl -X POST http://localhost:5000/api/webhooks/pipedrive \
  -H "Content-Type: application/json" \
  -d '{
    "event": "added.person",
    "current": {
      "name": "João Silva",
      "phone": [{"value": "5511999999999"}],
      "email": [{"value": "joao@email.com"}]
    }
  }'
```

---

## 🔒 Segurança

### Webhooks Públicos (sem autenticação)
- ✅ Stripe
- ✅ Mercado Pago
- ✅ SendGrid
- ✅ Mailgun
- ✅ Twilio
- ✅ HubSpot
- ✅ Pipedrive

### Webhooks Autenticados (requer login)
- 🔐 Zapier
- 🔐 Google Sheets
- 🔐 OpenAI
- 🔐 Generic

---

## 📊 Ver Logs

Todos os webhooks geram logs automáticos no console:

```bash
npm run dev

# Você verá logs como:
💳 [STRIPE] Evento recebido: checkout.session.completed
✅ [STRIPE] Plano pro ativado para user-123

🤝 [ZAPIER] Evento recebido: new_lead
✅ [ZAPIER] Contato criado: contact-456
🚀 [ZAPIER] Funil funnel-789 acionado

📧 [SENDGRID] Eventos recebidos: 2
✅ [SENDGRID] E-mail entregue para cliente@email.com
⚠️ [SENDGRID] E-mail inválido marcado: bounce@email.com
```

---

## 🛠️ Troubleshooting

### Erro 401 (Não autenticado)
**Problema:** Webhook requer autenticação

**Solução:**
```bash
# 1. Fazer login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}' \
  -c cookies.txt

# 2. Usar cookie
curl -X POST http://localhost:5000/api/webhooks/zapier \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Webhook Secret Inválido
**Problema:** STRIPE_WEBHOOK_SECRET não configurado

**Solução:**
```bash
# Editar .env
STRIPE_WEBHOOK_SECRET=whsec_seu_secret_real_aqui

# Reiniciar servidor
npm run dev
```

### Webhook Não Recebe Dados
**Problema:** URL incorreta na plataforma externa

**Solução:**
1. Verifique a URL: `https://seudominio.com/api/webhooks/stripe`
2. Use HTTPS em produção
3. Teste localmente com ngrok:
```bash
ngrok http 5000
# Use: https://abc123.ngrok.io/api/webhooks/stripe
```

---

## 📝 Checklist de Implementação

### Para Cada Webhook:

- [ ] Adicionar secret no `.env`
- [ ] Configurar na plataforma externa
- [ ] Testar com curl
- [ ] Verificar logs no console
- [ ] Testar em produção

### Exemplo: Configurar Stripe

1. ✅ `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`
2. ✅ Stripe Dashboard: Adicionar endpoint
3. ✅ Teste: `curl -X POST ...`
4. ✅ Ver log: `💳 [STRIPE] Evento recebido`
5. ✅ Produção: Atualizar URL para HTTPS

---

## 🚀 Pronto para Usar!

```bash
# 1. Servidor rodando?
npm run dev

# 2. Listar webhooks
curl http://localhost:5000/api/webhooks/list

# 3. Testar um webhook
curl -X POST http://localhost:5000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{}}'
```

---

## 📚 Documentação Completa

Para mais detalhes, exemplos e casos de uso:
👉 **Ver `WEBHOOKS-COMPLETO.md`**

---

**✅ Sistema de Webhooks Pronto!**
**✅ 11 Integrações Disponíveis!**
**✅ Testado e Funcionando!**
