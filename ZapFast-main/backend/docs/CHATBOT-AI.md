# 🤖 Chatbot AI - Assistente Virtual Inteligente

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Características](#características)
3. [Como Configurar](#como-configurar)
4. [Modelos de IA](#modelos-de-ia)
5. [Prompt Engineering](#prompt-engineering)
6. [Integração com WhatsApp](#integração-com-whatsapp)
7. [API Endpoints](#api-endpoints)
8. [Melhores Práticas](#melhores-práticas)

---

## 🎯 Visão Geral

O **Chatbot AI** transforma seu WhatsApp em um assistente virtual inteligente, capaz de:

✅ Responder perguntas automaticamente 24/7  
✅ Manter conversas contextualizadas e naturais  
✅ Personalizar respostas para cada cliente  
✅ Aprender com interações anteriores  
✅ Escalar atendimento sem contratar mais pessoas  

### Como Funciona

```
1. Cliente envia mensagem no WhatsApp
   ↓
2. Webhook recebe a mensagem
   ↓
3. Se não houver funil acionado, chatbot processa
   ↓
4. IA (OpenAI GPT) gera resposta inteligente
   ↓
5. Resposta é enviada automaticamente
```

---

## 🚀 Características

### 1. **Múltiplos Modelos de IA**

| Modelo | Descrição | Melhor Para |
|--------|-----------|-------------|
| **GPT-4o** | Mais inteligente e preciso | Tarefas complexas, análises |
| **GPT-4o Mini** | Equilíbrio perfeito (Recomendado) | Uso geral, custo-benefício |
| **GPT-4 Turbo** | Rápido e eficiente | Alto volume de mensagens |
| **GPT-3.5 Turbo** | Mais rápido e econômico | Respostas simples |

### 2. **Memória de Conversação**

- Lembra mensagens anteriores (até 20 mensagens)
- Mantém contexto por 30 minutos
- Conversas mais naturais e coerentes

### 3. **Personalização Avançada**

```
Variáveis disponíveis:
- {{nome}} - Nome do cliente
- {{data}} - Data atual
```

### 4. **Controle de Comportamento**

- **Temperature**: Controla criatividade (0-1)
  - 0 = Respostas consistentes e previsíveis
  - 0.7 = Equilíbrio (Recomendado)
  - 1 = Máxima criatividade

- **Max Tokens**: Tamanho da resposta (100-2000)
  - 500 tokens ≈ 375 palavras (Recomendado)

### 5. **Gatilhos Inteligentes**

- Responde apenas mensagens com palavras-chave específicas
- Ou responde todas as mensagens (se gatilhos vazios)
- Prioriza funis de vendas sobre chatbot

---

## 📖 Como Configurar

### Passo 1: Configurar API Key

#### Opção A: Usar API Key do Sistema

Adicione no `.env`:
```env
OPENAI_API_KEY=sk-proj-...
```

#### Opção B: Usar API Key Personalizada

Configure diretamente na interface do chatbot.

### Passo 2: Configurar Chatbot

1. Acesse **Chatbot AI** no menu
2. Preencha as informações:

```yaml
Nome: Assistente Virtual da Empresa X
Status: Ativo

IA:
  Modelo: GPT-4o Mini
  Temperature: 0.7
  Max Tokens: 500

Prompt do Sistema: |
  Você é um assistente virtual da Empresa X.
  
  Diretrizes:
  - Seja educado e profissional
  - Use o nome do cliente ({{nome}})
  - Responda de forma clara
  - Ofereça ajuda proativa
  
  Informações da Empresa:
  - Horário: Seg-Sex 9h-18h
  - E-mail: contato@empresa.com
  - Telefone: (11) 99999-9999

Mensagens:
  Saudação: "Olá {{nome}}! 👋 Sou o assistente da Empresa X. Como posso ajudá-lo?"
  Fallback: "Desculpe, não entendi. Pode reformular sua pergunta?"

Gatilhos: ajuda, suporte, dúvida, informação
(deixe vazio para responder todas as mensagens)

Memória:
  Ativo: Sim
  Máximo de Mensagens: 10
```

3. Clique em **Salvar**

### Passo 3: Testar

1. Vá para aba **Testar**
2. Digite uma mensagem de teste
3. Clique em **Testar Chatbot**
4. Verifique a resposta gerada

### Passo 4: Ativar

1. Ative o switch "Chatbot Ativo"
2. Salve as configurações
3. Pronto! Chatbot está funcionando

---

## 🧠 Modelos de IA

### GPT-4o (Omni)

**Características:**
- Mais inteligente disponível
- Suporta texto, imagem, áudio, vídeo
- Melhor compreensão de contexto
- Respostas mais precisas

**Quando Usar:**
- Análises complexas
- Consultas técnicas
- Atendimento premium
- Tarefas que exigem raciocínio

**Custo:**
- Input: $5/1M tokens
- Output: $15/1M tokens

### GPT-4o Mini (Recomendado) ⭐

**Características:**
- Equilíbrio perfeito preço/performance
- 82% mais barato que GPT-4o
- Rápido e eficiente
- Ótima qualidade de resposta

**Quando Usar:**
- Uso geral (RECOMENDADO)
- Atendimento ao cliente
- Suporte técnico básico
- Alto volume de mensagens

**Custo:**
- Input: $0.15/1M tokens
- Output: $0.60/1M tokens

### GPT-4 Turbo

**Características:**
- Contexto estendido (128k tokens)
- Dados até Abril 2023
- Bom custo-benefício
- Performance otimizada

**Quando Usar:**
- Conversas longas
- Análise de documentos
- Contexto extenso necessário

### GPT-3.5 Turbo

**Características:**
- Mais rápido
- Mais econômico
- Respostas adequadas

**Quando Usar:**
- Orçamento limitado
- Perguntas simples
- FAQ automatizado
- Alto volume/baixo custo

---

## 💡 Prompt Engineering

### Template Básico

```
Você é um [PAPEL/FUNÇÃO].

Diretrizes:
- [DIRETRIZ 1]
- [DIRETRIZ 2]
- [DIRETRIZ 3]

Informações Relevantes:
- [INFO 1]
- [INFO 2]

Seu objetivo é [OBJETIVO].
```

### Exemplos de Prompts

#### 1. Atendimento ao Cliente

```
Você é um assistente de atendimento ao cliente da Loja ABC.

Diretrizes:
- Seja extremamente educado e empático
- Use o nome do cliente sempre que possível ({{nome}})
- Responda de forma clara e objetiva
- Ofereça soluções práticas
- Se não souber, encaminhe para atendimento humano

Informações da Loja:
- Horário: Segunda a Sábado, 9h às 18h
- E-mail: sac@lojaabc.com
- Telefone: (11) 3333-4444
- Endereço: Rua Exemplo, 123 - São Paulo/SP

Políticas:
- Troca: até 7 dias após recebimento
- Frete grátis: compras acima de R$ 100
- Pagamento: cartão, PIX, boleto

Seu objetivo é ajudar os clientes, tirar dúvidas e proporcionar excelente experiência.
```

#### 2. Agendamento de Consultas

```
Você é a assistente virtual da Clínica Saúde Total.

Diretrizes:
- Seja cordial e profissional
- Colete informações necessárias para agendamento
- Confirme horários disponíveis
- Explique procedimentos quando perguntado

Informações da Clínica:
- Especialidades: Clínica Geral, Pediatria, Dermatologia
- Horários: Segunda a Sexta, 8h às 18h
- Endereço: Av. Saúde, 456 - Centro
- Telefone: (11) 5555-6666

Processo de Agendamento:
1. Pergunte nome completo
2. Especialidade desejada
3. Data/horário preferido
4. Telefone de contato

Seu objetivo é facilitar o agendamento de consultas de forma rápida e eficiente.
```

#### 3. Suporte Técnico

```
Você é o assistente de suporte técnico da TechSoft.

Diretrizes:
- Seja paciente e didático
- Faça diagnóstico passo a passo
- Ofereça soluções claras
- Use linguagem simples (evite jargões)
- Escale para técnico humano se necessário

Produtos Suportados:
- Software XYZ versão 2.0
- Aplicativo Mobile ABC
- Plataforma Web 123

Problemas Comuns:
- Login: verificar e-mail/senha, recuperar senha
- Lentidão: limpar cache, atualizar navegador
- Erro de conexão: verificar internet, firewall

Seu objetivo é resolver problemas técnicos rapidamente e com clareza.
```

#### 4. Vendas e Qualificação de Leads

```
Você é o assistente de vendas da Imobiliária TopCasa.

Diretrizes:
- Seja consultivo, não insistente
- Faça perguntas qualificadoras
- Apresente opções relevantes
- Crie senso de urgência (mas sem pressão)
- Colete dados para follow-up

Processo de Qualificação:
1. Tipo de imóvel procurado (casa/apartamento)
2. Região/bairro de interesse
3. Faixa de preço
4. Número de quartos/vagas
5. Disponibilidade para visita

Imóveis em Destaque:
- Apartamento 3 quartos - Jardins - R$ 850k
- Casa 4 quartos - Morumbi - R$ 1.2M
- Cobertura 2 quartos - Vila Madalena - R$ 950k

Seu objetivo é qualificar leads e agendar visitas.
```

---

## 🔌 Integração com WhatsApp

### Fluxo de Integração

```
WhatsApp → Webhook → Sistema ZapFast
                           ↓
                     Verifica Funis
                           ↓
                   Funil Acionado?
                     ↙         ↘
                 Sim           Não
                  ↓             ↓
           Executa Funil   Processa Chatbot
                               ↓
                         Gera Resposta IA
                               ↓
                         Envia Resposta
```

### Prioridade de Processamento

1. **Funis de Vendas** (Prioridade Alta)
   - Se mensagem contém gatilho de funil → Executa funil

2. **Chatbot AI** (Prioridade Baixa)
   - Se nenhum funil acionado → Processa com chatbot
   - Se chatbot tem gatilhos → Verifica palavras-chave
   - Se não tem gatilhos → Responde todas mensagens

### Código de Integração

```typescript
// No webhook handler (server/routes.ts)

// 1. Verificar funis
const triggeredFunnels = await findTriggeredFunnels(message);

if (triggeredFunnels.length > 0) {
  // Executar funil (prioridade)
  await executeFunnel(triggeredFunnels[0]);
} else {
  // Processar com chatbot
  const response = await chatbotService.processMessage(
    userId,
    contactId,
    contactName,
    message
  );
  
  if (response) {
    await whatsappService.sendMessage(phone, response, userId);
  }
}
```

---

## 🔌 API Endpoints

### Salvar Configuração

```http
POST /api/chatbot/config
Authorization: Required

{
  "name": "Assistente Virtual",
  "isActive": true,
  "aiProvider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4o-mini",
  "systemPrompt": "Você é...",
  "temperature": 0.7,
  "maxTokens": 500,
  "fallbackMessage": "Desculpe...",
  "greetingMessage": "Olá {{nome}}!",
  "triggerKeywords": ["ajuda", "suporte"],
  "conversationMemory": true,
  "maxMemoryMessages": 10
}
```

### Obter Configuração

```http
GET /api/chatbot/config
Authorization: Required
```

### Atualizar Configuração

```http
PUT /api/chatbot/config/:id
Authorization: Required

{
  "isActive": false,
  "temperature": 0.5
}
```

### Testar Chatbot

```http
POST /api/chatbot/test
Authorization: Required

{
  "message": "Olá, preciso de ajuda",
  "contactName": "João Silva"
}
```

**Resposta:**
```json
{
  "response": "Olá João! Claro, estou aqui para ajudar. O que você precisa?"
}
```

### Obter Estatísticas

```http
GET /api/chatbot/stats
Authorization: Required
```

**Resposta:**
```json
{
  "totalConversations": 150,
  "activeConversations": 12,
  "totalMessages": 542
}
```

### Limpar Conversação

```http
POST /api/chatbot/clear/:contactId
Authorization: Required
```

### Ativar/Desativar

```http
POST /api/chatbot/toggle/:id
Authorization: Required
```

---

## ✨ Melhores Práticas

### 1. **Defina Personalidade Clara**

```
❌ Ruim:
"Você é um assistente."

✅ Bom:
"Você é Maria, assistente virtual da Loja X. Você é educada, 
prestativa e sempre usa emojis sutis para deixar a conversa 
mais amigável. Seu tom é profissional mas acolhedor."
```

### 2. **Seja Específico sobre Limitações**

```
Diretrizes:
- Se não souber a resposta, seja honesto: "Não tenho essa informação"
- Não invente dados ou preços
- Para questões complexas, encaminhe para humano
- Evite promessas que não pode cumprir
```

### 3. **Use Exemplos no Prompt**

```
Exemplos de boas respostas:

Usuário: "Qual o horário de funcionamento?"
Você: "Funcionamos de segunda a sexta, das 9h às 18h! 😊"

Usuário: "Vocês entregam em todo Brasil?"
Você: "Sim! Entregamos em todo o território nacional via Correios ou transportadora. O prazo varia de 5 a 15 dias úteis conforme a região."
```

### 4. **Configure Temperature Corretamente**

| Caso de Uso | Temperature Recomendada |
|-------------|------------------------|
| FAQ / Suporte | 0.3 - 0.5 (consistente) |
| Atendimento Geral | 0.6 - 0.7 (equilibrado) |
| Vendas Criativas | 0.7 - 0.9 (criativo) |

### 5. **Gerencie Contexto**

```
✅ Com Memória:
Cliente: "Quero comprar um celular"
Bot: "Ótimo! Qual marca prefere?"
Cliente: "Samsung"
Bot: "Perfeito! Temos vários modelos Samsung..."

❌ Sem Memória:
Cliente: "Quero comprar um celular"
Bot: "Ótimo! Qual marca prefere?"
Cliente: "Samsung"
Bot: "Como posso ajudá-lo?" (perdeu contexto)
```

### 6. **Teste Extensivamente**

Teste cenários:
- Perguntas comuns
- Perguntas ambíguas
- Mensagens curtas ("oi", "ok")
- Perguntas fora do escopo
- Solicitações impossíveis
- Linguagem informal/gírias

### 7. **Monitore e Ajuste**

```
Métricas a acompanhar:
- Taxa de resolução (mensagens resolvidas sem humano)
- Satisfação do cliente
- Tempo médio de resposta
- Uso do fallback (indica problemas)
```

### 8. **Segurança e Privacidade**

```
Diretrizes de Segurança:
- Nunca peça senha ou dados bancários
- Não compartilhe informações de outros clientes
- Não faça transações financeiras
- Para dados sensíveis, encaminhe para canal seguro
```

---

## 📊 Casos de Uso

### 1. E-commerce

- Tirar dúvidas sobre produtos
- Rastrear pedidos
- Informar política de troca
- Sugerir produtos
- Processar reclamações

### 2. Saúde

- Agendar consultas
- Lembrar exames
- Fornecer orientações gerais
- Confirmar presença
- Enviar resultados

### 3. Educação

- Informar sobre cursos
- Responder FAQ acadêmica
- Auxiliar matrículas
- Enviar materiais
- Suporte técnico

### 4. Imobiliária

- Qualificar leads
- Agendar visitas
- Informar disponibilidade
- Enviar fotos/vídeos
- Calcular financiamento

### 5. Restaurante

- Reservar mesas
- Informar cardápio
- Fazer pedidos
- Tracking de delivery
- Coletar feedback

---

## 🆘 Solução de Problemas

### Problema: Chatbot não responde

**Soluções:**
1. Verifique se está ativo (switch ligado)
2. Confirme OpenAI API Key configurada
3. Veja se tem gatilhos muito restritivos
4. Verifique logs do servidor

### Problema: Respostas genéricas

**Soluções:**
1. Melhore o prompt do sistema (seja mais específico)
2. Adicione exemplos de respostas
3. Aumente temperature (0.7-0.8)
4. Use modelo mais avançado (GPT-4o)

### Problema: Chatbot "esquece" contexto

**Soluções:**
1. Ative memória de conversação
2. Aumente maxMemoryMessages (15-20)
3. Verifique timeout (30 min padrão)

### Problema: Respostas muito longas

**Soluções:**
1. Reduza maxTokens (300-400)
2. Adicione no prompt: "Responda de forma concisa"
3. Use modelo mais rápido (GPT-3.5)

### Problema: Custo alto

**Soluções:**
1. Use GPT-4o Mini ou GPT-3.5 Turbo
2. Reduza maxTokens
3. Reduza maxMemoryMessages
4. Use gatilhos para reduzir volume
5. Implemente cache de respostas comuns

---

## 💰 Estimativa de Custos

### Cálculo Simplificado

```
Custo por Mensagem = (Input Tokens + Output Tokens) × Preço por Token

Exemplo (GPT-4o Mini):
- Input: 100 tokens × $0.15/1M = $0.000015
- Output: 200 tokens × $0.60/1M = $0.000120
- Total: $0.000135 por mensagem

1.000 mensagens/mês ≈ $0.14
10.000 mensagens/mês ≈ $1.35
100.000 mensagens/mês ≈ $13.50
```

### Comparativo de Modelos (1000 mensagens)

| Modelo | Custo Estimado | Velocidade | Qualidade |
|--------|----------------|------------|-----------|
| GPT-4o | $2.00 | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| GPT-4o Mini | $0.14 | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| GPT-4 Turbo | $0.90 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| GPT-3.5 Turbo | $0.04 | ⚡⚡⚡⚡ | ⭐⭐⭐ |

---

## 📚 Recursos Adicionais

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [GPT Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Token Calculator](https://platform.openai.com/tokenizer)

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- **WhatsApp**: (11) 99999-9999
- **E-mail**: suporte@zapfast.com
- **Documentação**: https://docs.zapfast.com

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Desenvolvido por**: Equipe ZapFast 🚀
