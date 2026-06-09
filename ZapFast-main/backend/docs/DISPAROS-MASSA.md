# 📤 Sistema de Disparos em Massa - ZapFast

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Características](#características)
3. [Como Usar](#como-usar)
4. [Regras do WhatsApp](#regras-do-whatsapp)
5. [API Endpoints](#api-endpoints)
6. [Arquitetura](#arquitetura)
7. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

O sistema de **Disparos em Massa** permite enviar mensagens personalizadas para múltiplos contatos simultaneamente, com controle total sobre o processo de envio.

### Principais Funcionalidades

✅ **Envio em Lote**: Envie mensagens para centenas ou milhares de contatos de uma vez  
✅ **Personalização**: Use variáveis para personalizar cada mensagem  
✅ **Controle de Velocidade**: Configure delays entre mensagens para evitar bloqueios  
✅ **Retry Automático**: Tentativas automáticas para mensagens que falharam  
✅ **Agendamento**: Agende campanhas para envio futuro  
✅ **Progresso em Tempo Real**: Acompanhe o status de cada envio  
✅ **Pausa/Retomada**: Pause e retome campanhas a qualquer momento  
✅ **Suporte a Mídia**: Envie textos, imagens, vídeos, áudios e documentos  

---

## 🚀 Características

### 1. **Seleção de Destinatários**

Três formas de selecionar contatos:

- **Individual**: Marque contatos específicos na lista
- **Busca**: Filtre por nome ou telefone
- **Selecionar Todos**: Marque todos os contatos de uma vez

### 2. **Personalização de Mensagens**

Use variáveis para criar mensagens únicas:

```
Olá {{nome}}, 

Temos uma oferta especial para você!

Entre em contato pelo {{telefone}} ou {{email}}.

Equipe ZapFast
```

**Variáveis disponíveis:**
- `{{nome}}` - Nome do contato
- `{{email}}` - E-mail do contato  
- `{{telefone}}` - Telefone do contato

### 3. **Tipos de Mídia Suportados**

| Tipo | Extensões | Exemplo |
|------|-----------|---------|
| **Imagem** | .jpg, .jpeg, .png, .gif | `https://exemplo.com/imagem.jpg` |
| **Vídeo** | .mp4, .avi, .mov | `https://exemplo.com/video.mp4` |
| **Áudio** | .mp3, .wav, .ogg | `https://exemplo.com/audio.mp3` |
| **Documento** | .pdf, .doc, .xlsx, etc | `https://exemplo.com/documento.pdf` |

### 4. **Configurações Avançadas**

#### Delay entre Mensagens
- **Recomendado**: 3-5 segundos
- **Mínimo**: 1 segundo
- **Máximo**: 60 segundos

> ⚠️ **IMPORTANTE**: Delays muito curtos podem resultar em bloqueio pelo WhatsApp!

#### Tentativas Máximas
- **Padrão**: 3 tentativas
- **Faixa**: 1-5 tentativas

### 5. **Agendamento**

Agende campanhas para datas e horários específicos:

```
Data: 25/12/2024
Hora: 09:00
```

---

## 📖 Como Usar

### Passo 1: Criar Nova Campanha

1. Acesse **Disparos em Massa** no menu lateral
2. Clique em **Nova Campanha**
3. Preencha os dados:
   - **Nome**: Nome identificador da campanha
   - **Mensagem**: Texto com variáveis personalizadas
   - **URL da Mídia** (opcional): Link para imagem, vídeo, etc
   - **Delay**: Tempo entre mensagens (segundos)
   - **Tentativas**: Número de tentativas em caso de falha
   - **Agendar** (opcional): Data e hora futura

### Passo 2: Selecionar Destinatários

1. Use a busca para filtrar contatos
2. Marque os contatos desejados individualmente
3. Ou clique em **Selecionar Todos**

### Passo 3: Iniciar Campanha

1. Clique em **Criar Campanha**
2. A campanha aparecerá na lista com status **Rascunho**
3. Clique em **Iniciar** para começar o envio
4. Acompanhe o progresso em tempo real

### Passo 4: Gerenciar Campanha

Durante o envio, você pode:

- **⏸️ Pausar**: Interrompe temporariamente
- **▶️ Retomar**: Continua de onde parou
- **❌ Cancelar**: Cancela definitivamente

---

## ⚠️ Regras do WhatsApp

### Políticas do WhatsApp

O WhatsApp possui regras rígidas para prevenir SPAM:

1. **Janela de 24 horas**: Só envie mensagens para quem interagiu recentemente
2. **Opt-in Obrigatório**: Contatos devem ter consentido receber mensagens
3. **Conteúdo Relevante**: Evite spam e conteúdo não solicitado
4. **Limites de Volume**: Não envie volumes excessivos em curto período

### Como Evitar Bloqueios

✅ **Use delays adequados** (3-5 segundos recomendado)  
✅ **Não envie para números inválidos**  
✅ **Tenha opt-in dos contatos**  
✅ **Evite horários inadequados** (madrugada, finais de semana)  
✅ **Varie o conteúdo** (não envie mensagens idênticas em massa)  
✅ **Monitore taxas de bloqueio**  

❌ **NÃO envie spam**  
❌ **NÃO compre listas de contatos**  
❌ **NÃO envie sem consentimento**  
❌ **NÃO abuse da frequência**  

---

## 🔌 API Endpoints

### Criar Campanha

```http
POST /api/bulk-messages/campaigns
Authorization: Required

{
  "name": "Black Friday 2024",
  "message": "Olá {{nome}}, aproveite nossa oferta!",
  "recipientIds": ["contact-id-1", "contact-id-2"],
  "mediaUrl": "https://exemplo.com/imagem.jpg",
  "delayBetweenMessages": 5,
  "maxRetries": 3,
  "scheduledAt": "2024-12-25T09:00:00"
}
```

**Resposta:**
```json
{
  "id": "bulk_1234567890_abc123",
  "userId": "user-123",
  "name": "Black Friday 2024",
  "status": "draft",
  "progress": {
    "total": 100,
    "sent": 0,
    "failed": 0,
    "pending": 100
  },
  "createdAt": "2024-12-01T10:00:00"
}
```

### Iniciar Campanha

```http
POST /api/bulk-messages/campaigns/:id/start
Authorization: Required
```

### Pausar Campanha

```http
POST /api/bulk-messages/campaigns/:id/pause
Authorization: Required
```

### Retomar Campanha

```http
POST /api/bulk-messages/campaigns/:id/resume
Authorization: Required
```

### Cancelar Campanha

```http
POST /api/bulk-messages/campaigns/:id/cancel
Authorization: Required
```

### Buscar Status

```http
GET /api/bulk-messages/campaigns/:id/status
Authorization: Required
```

### Listar Campanhas

```http
GET /api/bulk-messages/campaigns
Authorization: Required
```

### Histórico

```http
GET /api/bulk-messages/history
Authorization: Required
```

---

## 🏗️ Arquitetura

### Componentes

```
┌─────────────────────────────────────────────┐
│          Frontend (React)                   │
│  - Criação de campanhas                     │
│  - Seleção de contatos                      │
│  - Monitoramento em tempo real              │
└─────────────────┬───────────────────────────┘
                  │
                  │ API REST
                  │
┌─────────────────▼───────────────────────────┐
│          Backend (Express)                  │
│  - routes-bulk-messages.ts                  │
│  - Validação e autenticação                 │
└─────────────────┬───────────────────────────┘
                  │
                  │
┌─────────────────▼───────────────────────────┐
│      BulkMessageService                     │
│  - Gerenciamento de filas                   │
│  - Controle de progresso                    │
│  - Retry logic                              │
└─────────────────┬───────────────────────────┘
                  │
                  │
┌─────────────────▼───────────────────────────┐
│      WhatsAppService                        │
│  - Envio via Whapi.cloud                    │
│  - Tratamento de erros                      │
└─────────────────────────────────────────────┘
```

### Fluxo de Envio

```
1. Usuário cria campanha
   ↓
2. Sistema cria fila de mensagens
   ↓
3. Substitui variáveis para cada contato
   ↓
4. Processa fila sequencialmente
   ↓
5. Delay entre cada mensagem
   ↓
6. Retry automático em caso de falha
   ↓
7. Atualiza progresso em tempo real
   ↓
8. Campanha concluída
```

### Estados da Campanha

| Estado | Descrição |
|--------|-----------|
| **draft** | Criada mas não iniciada |
| **scheduled** | Agendada para envio futuro |
| **sending** | Enviando mensagens |
| **paused** | Pausada temporariamente |
| **completed** | Concluída com sucesso |
| **failed** | Falhou ou foi cancelada |

---

## ✨ Boas Práticas

### 1. **Segmentação de Público**

```javascript
// Exemplo: Filtrar contatos por tags
const contatosVIP = contacts.filter(c => c.tags?.includes('VIP'));
const contatosInativos = contacts.filter(c => !c.isActive);
```

### 2. **Teste Primeiro**

Sempre teste com um grupo pequeno antes de enviar para todos:

```
1. Crie campanha teste com 5-10 contatos
2. Verifique se as mensagens estão corretas
3. Ajuste conforme necessário
4. Envie para o público completo
```

### 3. **Horários Ideais**

| Segmento | Melhor Horário |
|----------|----------------|
| B2B | 9h-12h, 14h-17h (dias úteis) |
| B2C | 10h-22h (todos os dias) |
| E-commerce | 19h-22h (maior engajamento) |

### 4. **Frequência Recomendada**

- **Diária**: Apenas para serviços de notícias/updates
- **Semanal**: Promoções e novidades
- **Mensal**: Newsletters e relatórios
- **Trimestral**: Pesquisas e feedback

### 5. **Métricas de Sucesso**

Monitore estas métricas:

- **Taxa de Entrega**: % de mensagens enviadas com sucesso
- **Taxa de Falha**: % de mensagens que falharam
- **Taxa de Resposta**: % de contatos que responderam
- **Taxa de Bloqueio**: % de contatos que bloquearam

---

## 🔧 Solução de Problemas

### Problema: Mensagens não estão sendo enviadas

**Solução:**
1. Verifique se o WhatsApp está conectado
2. Confirme se o `WHAPI_TOKEN` está configurado
3. Verifique os logs do servidor

### Problema: Muitas falhas no envio

**Solução:**
1. Aumente o delay entre mensagens
2. Verifique se os números são válidos
3. Reduza o volume de envios por dia

### Problema: Conta foi bloqueada

**Solução:**
1. Aguarde 24-48 horas
2. Revise suas práticas de envio
3. Reduza volume e aumente delays
4. Solicite opt-in dos contatos

---

## 📝 Exemplo Completo

```javascript
// 1. Criar campanha de promoção
const campanha = {
  name: "Promoção Natal 2024",
  message: `Olá {{nome}}! 🎄

Feliz Natal da equipe ZapFast!

Aproveite 50% OFF em todos os nossos planos até 31/12.

Use o cupom: NATAL2024

Clique aqui: https://zapfast.com/promo

Atenciosamente,
Equipe ZapFast`,
  
  recipientIds: contatosVIP.map(c => c.id),
  
  mediaUrl: "https://zapfast.com/assets/banner-natal.jpg",
  
  delayBetweenMessages: 5,  // 5 segundos
  maxRetries: 3,
  
  // Agendar para 20/12 às 10h
  scheduledAt: "2024-12-20T10:00:00"
};

// 2. Criar via API
const response = await fetch('/api/bulk-messages/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(campanha)
});

const campanhaCreated = await response.json();

// 3. Iniciar envio
await fetch(`/api/bulk-messages/campaigns/${campanhaCreated.id}/start`, {
  method: 'POST'
});

// 4. Monitorar progresso
const status = await fetch(`/api/bulk-messages/campaigns/${campanhaCreated.id}/status`);
const progress = await status.json();

console.log(`Enviadas: ${progress.progress.sent}/${progress.progress.total}`);
```

---

## 🎓 Recursos Adicionais

- [Políticas do WhatsApp Business](https://www.whatsapp.com/legal/business-policy)
- [Documentação Whapi.cloud](https://whapi.cloud/docs)
- [Guia de Webhooks](./WEBHOOKS-COMPLETO.md)
- [Limites de Planos](./PLANOS.md)

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- **WhatsApp**: (11) 99999-9999
- **E-mail**: suporte@zapfast.com
- **Documentação**: https://docs.zapfast.com

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Desenvolvido por**: Equipe ZapFast
