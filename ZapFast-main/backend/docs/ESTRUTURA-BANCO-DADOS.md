# 🗄️ Estrutura do Banco de Dados

## 📊 Tabelas do Sistema

O sistema usa **PostgreSQL (Neon)** e armazena os seguintes dados:

---

## 1. 👤 **users** - Usuários da Plataforma

Armazena informações dos usuários cadastrados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único do usuário |
| `email` | VARCHAR | E-mail do usuário (único) |
| `password` | VARCHAR | Hash da senha (bcrypt) |
| `first_name` | VARCHAR | Primeiro nome |
| `last_name` | VARCHAR | Sobrenome |
| `nickname` | VARCHAR | Apelido (opcional) |
| `profile_image_url` | VARCHAR | URL da foto de perfil |
| `plan_type` | ENUM | Tipo de plano: `free`, `basic`, `pro`, `enterprise` |
| `plan_expires_at` | TIMESTAMP | Data de expiração do plano |
| `is_blocked` | BOOLEAN | Se o usuário está bloqueado |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

**Exemplo:**
```json
{
  "id": "110a8de0-308e-4844-be67-22fbb126ab7e",
  "email": "avelino@email.com",
  "password": "$2b$10$...", // Hash bcrypt
  "first_name": "Avelino",
  "last_name": "Chissico",
  "nickname": null,
  "plan_type": "basic",
  "plan_expires_at": "2027-01-15T00:00:00Z",
  "is_blocked": false
}
```

---

## 2. 🔐 **sessions** - Sessões de Login

Armazena sessões ativas dos usuários (express-session).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `sid` | VARCHAR | ID da sessão (Primary Key) |
| `sess` | JSONB | Dados da sessão (userId, userEmail, etc) |
| `expire` | TIMESTAMP | Data de expiração da sessão |

**Exemplo:**
```json
{
  "sid": "zapfast.sid_abc123",
  "sess": {
    "userId": "110a8de0-...",
    "userEmail": "avelino@email.com",
    "cookie": { ... }
  },
  "expire": "2026-06-09T12:00:00Z"
}
```

---

## 3. 📱 **push_subscriptions** - Notificações Push

Armazena subscrições de notificações push dos dispositivos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único da subscrição |
| `user_id` | VARCHAR | ID do usuário (FK → users) |
| `endpoint` | TEXT | Endpoint do push service |
| `p256dh` | TEXT | Chave pública para criptografia |
| `auth` | TEXT | Token de autenticação |
| `user_agent` | TEXT | Navegador/dispositivo |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

**Exemplo:**
```json
{
  "id": "sub-abc123",
  "user_id": "110a8de0-...",
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "BPBYlub...",
  "auth": "xQjlwTe...",
  "user_agent": "Mozilla/5.0 Chrome/120.0"
}
```

**Nota:** Cada dispositivo (PC, celular, tablet) tem sua própria subscrição.

---

## 4. 📲 **whatsapp_connections** - Conexões WhatsApp

Armazena informações sobre conexões do WhatsApp.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único da conexão |
| `user_id` | VARCHAR | ID do usuário (FK → users) |
| `phone_number` | VARCHAR | Número do telefone conectado |
| `name` | VARCHAR | Nome da conexão |
| `is_connected` | BOOLEAN | Se está conectado |
| `qr_code` | TEXT | QR Code em base64 |
| `status` | VARCHAR | Status: `disconnected`, `qr_ready`, `connected` |
| `session_data` | JSONB | Dados da sessão WhatsApp |
| `last_connected_at` | TIMESTAMP | Última vez que conectou |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

**Exemplo:**
```json
{
  "id": "conn-abc123",
  "user_id": "110a8de0-...",
  "phone_number": "5511999999999",
  "name": "WhatsApp Principal",
  "is_connected": true,
  "status": "connected",
  "last_connected_at": "2026-06-08T09:00:00Z"
}
```

---

## 5. 🎯 **funnels** - Funis de Automação

Armazena os funis (fluxos) criados pelos usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único do funil |
| `user_id` | VARCHAR | ID do usuário (FK → users) |
| `name` | VARCHAR | Nome do funil |
| `trigger_phrases` | TEXT[] | Palavras-chave que ativam o funil |
| `status` | ENUM | Status: `draft`, `active`, `paused`, `inactive` |
| `flow_data` | JSONB | Dados do fluxo (nodes, edges) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

**Exemplo:**
```json
{
  "id": "funnel-abc123",
  "user_id": "110a8de0-...",
  "name": "Boas-vindas",
  "trigger_phrases": ["oi", "olá", "ola"],
  "status": "active",
  "flow_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

---

## 6. 🔗 **funnel_nodes** - Nós dos Funis

Armazena os nós (etapas) de cada funil.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único do nó |
| `funnel_id` | VARCHAR | ID do funil (FK → funnels) |
| `node_id` | VARCHAR | ID do nó no React Flow |
| `type` | ENUM | Tipo: `trigger`, `message`, `delay`, `condition`, `question`, `tag`, `verify` |
| `data` | JSONB | Dados do nó (conteúdo, config) |
| `position` | JSONB | Posição x,y no canvas |
| `delay_minutes` | INTEGER | Delay em minutos |
| `created_at` | TIMESTAMP | Data de criação |

**Exemplo:**
```json
{
  "id": "node-abc123",
  "funnel_id": "funnel-abc123",
  "node_id": "node-1",
  "type": "message",
  "data": {
    "label": "Mensagem de Boas-vindas",
    "content": "Olá! Bem-vindo!"
  },
  "position": { "x": 100, "y": 200 }
}
```

---

## 7. 👥 **contacts** - Contatos

Armazena os contatos (leads) do usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único do contato |
| `user_id` | VARCHAR | ID do usuário (FK → users) |
| `phone_number` | VARCHAR | Número de telefone |
| `name` | VARCHAR | Nome do contato |
| `email` | VARCHAR | E-mail do contato |
| `tags` | TEXT[] | Tags/etiquetas |
| `is_active` | BOOLEAN | Se está ativo |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

**Exemplo:**
```json
{
  "id": "contact-abc123",
  "user_id": "110a8de0-...",
  "phone_number": "5511988887777",
  "name": "João Silva",
  "email": "joao@email.com",
  "tags": ["cliente", "vip"],
  "is_active": true
}
```

---

## 8. 💬 **messages** - Mensagens

Armazena histórico de mensagens enviadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único da mensagem |
| `campaign_id` | VARCHAR | ID da campanha (FK → campaigns) |
| `contact_id` | VARCHAR | ID do contato (FK → contacts) |
| `user_id` | VARCHAR | ID do usuário (FK → users) |
| `type` | ENUM | Tipo: `text`, `image`, `video`, `audio`, `document`, `location` |
| `content` | TEXT | Conteúdo da mensagem |
| `media_url` | VARCHAR | URL da mídia |
| `status` | VARCHAR | Status: `pending`, `sent`, `delivered`, `failed` |
| `scheduled_at` | TIMESTAMP | Data agendada para envio |
| `sent_at` | TIMESTAMP | Data de envio |
| `delivered_at` | TIMESTAMP | Data de entrega |
| `external_id` | VARCHAR | ID externo (WhatsApp API) |
| `created_at` | TIMESTAMP | Data de criação |

**Exemplo:**
```json
{
  "id": "msg-abc123",
  "contact_id": "contact-abc123",
  "user_id": "110a8de0-...",
  "type": "text",
  "content": "Olá! Como posso ajudar?",
  "status": "delivered",
  "sent_at": "2026-06-08T10:00:00Z",
  "delivered_at": "2026-06-08T10:00:05Z"
}
```

---

## 9. 📝 **message_templates** - Templates de Mensagens

Armazena templates reutilizáveis de mensagens.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único do template |
| `user_id` | VARCHAR | ID do usuário (FK → users) |
| `name` | VARCHAR | Nome do template |
| `type` | ENUM | Tipo: `text`, `image`, `video`, etc |
| `content` | TEXT | Conteúdo do template |
| `media_url` | VARCHAR | URL da mídia |
| `variables` | TEXT[] | Variáveis: `{nome}`, `{empresa}` |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

**Exemplo:**
```json
{
  "id": "template-abc123",
  "user_id": "110a8de0-...",
  "name": "Boas-vindas Padrão",
  "type": "text",
  "content": "Olá {nome}! Bem-vindo à {empresa}!",
  "variables": ["nome", "empresa"]
}
```

---

## 10. 🚀 **funnel_executions** - Execuções de Funis

Registra quando um funil é executado para um contato.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único da execução |
| `funnel_id` | VARCHAR | ID do funil (FK → funnels) |
| `contact_id` | VARCHAR | ID do contato (FK → contacts) |
| `current_node_id` | VARCHAR | Nó atual da execução |
| `status` | VARCHAR | Status: `active`, `completed`, `stopped` |
| `started_at` | TIMESTAMP | Data de início |
| `completed_at` | TIMESTAMP | Data de conclusão |
| `data` | JSONB | Dados do estado da execução |

**Exemplo:**
```json
{
  "id": "exec-abc123",
  "funnel_id": "funnel-abc123",
  "contact_id": "contact-abc123",
  "current_node_id": "node-3",
  "status": "active",
  "started_at": "2026-06-08T10:00:00Z",
  "data": {
    "answers": { "question1": "Sim" }
  }
}
```

---

## 11. 📢 **campaigns** - Campanhas

Armazena campanhas de mensagens em massa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR (UUID) | ID único da campanha |
| `user_id` | VARCHAR | ID do usuário (FK → users) |
| `name` | VARCHAR | Nome da campanha |
| `description` | TEXT | Descrição |
| `status` | ENUM | Status: `draft`, `active`, `paused`, `inactive` |
| `trigger_phrase` | VARCHAR | Frase que ativa a campanha |
| `is_active` | BOOLEAN | Se está ativa |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

**Exemplo:**
```json
{
  "id": "campaign-abc123",
  "user_id": "110a8de0-...",
  "name": "Black Friday 2026",
  "description": "Campanha de ofertas",
  "status": "active",
  "trigger_phrase": "promoção",
  "is_active": true
}
```

---

## 📊 Resumo Total

| # | Tabela | O que Armazena | Qtd. Registros Típica |
|---|--------|----------------|----------------------|
| 1 | `users` | Usuários cadastrados | ~100-1000 |
| 2 | `sessions` | Sessões ativas | ~10-50 |
| 3 | `push_subscriptions` | Dispositivos inscritos | ~100-500 |
| 4 | `whatsapp_connections` | Conexões WhatsApp | ~100-1000 |
| 5 | `funnels` | Funis criados | ~50-500 |
| 6 | `funnel_nodes` | Nós dos funis | ~500-5000 |
| 7 | `contacts` | Contatos/leads | ~1000-100000 |
| 8 | `messages` | Mensagens enviadas | ~10000-1000000 |
| 9 | `message_templates` | Templates salvos | ~10-100 |
| 10 | `funnel_executions` | Execuções ativas | ~100-10000 |
| 11 | `campaigns` | Campanhas criadas | ~10-100 |

---

## 🔒 Dados Sensíveis

### O que é criptografado/protegido:

1. **Senhas** - Armazenadas com bcrypt hash
2. **Tokens de sessão** - Criptografados
3. **Chaves de push** - Apenas o servidor consegue usar

### O que NÃO é criptografado:

- Nomes, e-mails (para busca)
- Mensagens de texto (para histórico/relatórios)
- Números de telefone (para envio)

---

## 💾 Tamanho Estimado do Banco

Para 100 usuários ativos:

```
users:                    ~100 KB
sessions:                 ~50 KB
push_subscriptions:       ~200 KB
whatsapp_connections:     ~100 KB
funnels:                  ~500 KB
funnel_nodes:             ~2 MB
contacts:                 ~10 MB
messages:                 ~100 MB
message_templates:        ~100 KB
funnel_executions:        ~5 MB
campaigns:                ~100 KB

TOTAL: ~118 MB
```

---

## 🗑️ Limpeza Automática

O sistema **automaticamente** limpa:

1. **Sessões expiradas** - Removidas pelo express-session
2. **QR Codes antigos** - Sobrescritos quando gera novo
3. **Execuções completadas** - Mantidas por 30 dias (opcional)

**Nota:** Mensagens e contatos **não são** deletados automaticamente.

---

## 🔍 Ver os Dados

### Opção 1: Via Neon Console
1. Acesse: https://console.neon.tech
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Execute: `SELECT * FROM users;`

### Opção 2: Via código
```typescript
import { storage } from './server/storage';

// Ver todos os usuários
const users = await storage.getAllUsers();
console.log(users);

// Ver contatos
const contacts = await storage.getContacts('userId');
console.log(contacts);
```

### Opção 3: Script de verificação
```bash
npx tsx -e "import('./server/storage.js').then(s => s.storage.getAllUsers().then(console.log))"
```

---

## 📝 Backup

**Recomendado:** Neon faz backup automático diariamente.

**Manual:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## ✅ Conclusão

O banco armazena:
- ✅ Dados dos usuários
- ✅ Sessões de login
- ✅ Subscrições de notificações
- ✅ Conexões WhatsApp
- ✅ Funis e automações
- ✅ Contatos e mensagens
- ✅ Histórico de execuções

**Total:** 11 tabelas principais + índices e relacionamentos.
