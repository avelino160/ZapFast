# ⚡ Guia Rápido: Disparos em Massa

## 🚀 Em 5 Minutos

### 1️⃣ Acesse a Página

```
Menu Lateral → Disparos Massa
```

### 2️⃣ Crie uma Campanha

Clique em **Nova Campanha** e preencha:

| Campo | Exemplo | Obrigatório |
|-------|---------|-------------|
| **Nome** | "Promoção Black Friday" | ✅ Sim |
| **Mensagem** | "Olá {{nome}}, aproveite 50% OFF!" | ✅ Sim |
| **Destinatários** | Selecione na lista | ✅ Sim |
| **Mídia** | https://exemplo.com/banner.jpg | ⚪ Opcional |
| **Delay** | 5 segundos | ⚪ Opcional (padrão: 3s) |
| **Tentativas** | 3 | ⚪ Opcional (padrão: 3) |
| **Agendar** | 25/12/2024 09:00 | ⚪ Opcional |

### 3️⃣ Selecione Contatos

✅ Marque contatos individuais  
✅ Use a busca para filtrar  
✅ Ou clique em "Selecionar Todos"  

### 4️⃣ Configure (Recomendado)

```
Delay: 5 segundos (evita bloqueio)
Tentativas: 3 (retry automático)
```

### 5️⃣ Envie!

1. Clique em **Criar Campanha**
2. Clique em **Iniciar**
3. Acompanhe o progresso em tempo real

---

## 💡 Dicas Rápidas

### ✅ FAÇA

- Use delays de 3-5 segundos
- Personalize com `{{nome}}`, `{{email}}`, `{{telefone}}`
- Teste com poucos contatos primeiro
- Envie apenas para quem autorizou
- Monitore taxas de falha

### ❌ NÃO FAÇA

- Enviar spam
- Usar delays < 2 segundos
- Enviar sem opt-in
- Comprar listas de contatos
- Enviar volumes excessivos

---

## 🎯 Variáveis de Personalização

```
Olá {{nome}},

Sua compra foi confirmada!
Qualquer dúvida, entre em contato:

📧 E-mail: {{email}}
📱 WhatsApp: {{telefone}}

Equipe ZapFast
```

**Resultado para João (joao@email.com):**
```
Olá João,

Sua compra foi confirmada!
Qualquer dúvida, entre em contato:

📧 E-mail: joao@email.com
📱 WhatsApp: 11999998888

Equipe ZapFast
```

---

## 📊 Estados da Campanha

| Ícone | Estado | Descrição | Ações Disponíveis |
|-------|--------|-----------|-------------------|
| 📝 | **Rascunho** | Criada mas não iniciada | Iniciar |
| ⏰ | **Agendada** | Aguardando horário | - |
| 📤 | **Enviando** | Disparando mensagens | Pausar |
| ⏸️ | **Pausada** | Temporariamente parada | Retomar, Cancelar |
| ✅ | **Concluída** | Finalizada com sucesso | - |
| ❌ | **Falhou** | Erro ou cancelada | - |

---

## 🔧 Controles Durante Envio

### ⏸️ Pausar
Interrompe temporariamente o envio. Pode ser retomado depois.

### ▶️ Retomar
Continua o envio de onde parou.

### ❌ Cancelar
Cancela definitivamente a campanha.

---

## 📈 Progresso em Tempo Real

```
┌─────────────────────────────────────────┐
│ Promoção Black Friday                   │
│ [████████░░] 80%                        │
│                                         │
│ Total: 100                              │
│ ✅ Enviadas: 80                         │
│ ⏳ Pendentes: 15                        │
│ ❌ Falharam: 5                          │
└─────────────────────────────────────────┘
```

---

## ⚠️ Limites Importantes

| Plano | Mensagens/Dia | Campanhas Simultâneas |
|-------|---------------|-----------------------|
| **Free** | 100 | 1 |
| **Basic** | 500 | 3 |
| **Pro** | 2.000 | 10 |
| **Enterprise** | Ilimitado | Ilimitado |

---

## 🆘 Problemas Comuns

### ❓ Mensagens não estão sendo enviadas

**Solução:**
1. Verifique conexão do WhatsApp
2. Confirme que `WHAPI_TOKEN` está configurado
3. Veja os logs do servidor

### ❓ Muitas falhas

**Solução:**
1. Aumente o delay (5-10 segundos)
2. Verifique números inválidos
3. Reduza o volume diário

### ❓ Conta bloqueada

**Solução:**
1. Aguarde 24-48 horas
2. Reduza volume e aumente delays
3. Revise práticas de envio
4. Use apenas contatos com opt-in

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [Documentação Completa de Disparos](./DISPAROS-MASSA.md)
- [Guia de Webhooks](./WEBHOOKS-COMPLETO.md)
- [Políticas do WhatsApp](https://www.whatsapp.com/legal/business-policy)

---

## 💬 Suporte

**WhatsApp**: (11) 99999-9999  
**E-mail**: suporte@zapfast.com

---

**ZapFast** - Automatize seu WhatsApp 🚀
