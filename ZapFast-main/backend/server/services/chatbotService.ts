import axios from 'axios';
import { storage } from '../storage';

interface ChatbotConfig {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  aiProvider: 'openai' | 'custom';
  apiKey?: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  fallbackMessage: string;
  greetingMessage?: string;
  triggerKeywords: string[];
  conversationMemory: boolean;
  maxMemoryMessages: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationContext {
  contactId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  lastInteraction: Date;
}

/**
 * ChatbotService - Serviço de Chatbot com IA
 * 
 * Funcionalidades:
 * - Integração com OpenAI GPT
 * - Respostas inteligentes baseadas em contexto
 * - Memória de conversação
 * - Personalização de prompt do sistema
 * - Múltiplos modelos de IA
 * - Fallback para mensagens automáticas
 * - Gatilhos por palavras-chave
 */
export class ChatbotService {
  private chatbots: Map<string, ChatbotConfig> = new Map();
  private conversations: Map<string, ConversationContext> = new Map();
  private readonly CONTEXT_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  constructor() {
    console.log('🤖 ChatbotService inicializado');
  }

  /**
   * Criar ou atualizar configuração de chatbot
   */
  async saveChatbotConfig(config: Omit<ChatbotConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatbotConfig> {
    const chatbotId = `chatbot_${config.userId}_${Date.now()}`;
    
    const chatbot: ChatbotConfig = {
      ...config,
      id: chatbotId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.chatbots.set(chatbotId, chatbot);
    console.log(`🤖 Chatbot configurado: ${chatbot.name} (ID: ${chatbotId})`);
    
    return chatbot;
  }

  /**
   * Obter configuração de chatbot do usuário
   */
  getChatbotByUserId(userId: string): ChatbotConfig | null {
    for (const [_, chatbot] of this.chatbots) {
      if (chatbot.userId === userId && chatbot.isActive) {
        return chatbot;
      }
    }
    return null;
  }

  /**
   * Atualizar configuração de chatbot
   */
  async updateChatbotConfig(
    chatbotId: string, 
    updates: Partial<ChatbotConfig>
  ): Promise<ChatbotConfig | null> {
    const chatbot = this.chatbots.get(chatbotId);
    if (!chatbot) return null;

    const updated = {
      ...chatbot,
      ...updates,
      updatedAt: new Date(),
    };

    this.chatbots.set(chatbotId, updated);
    console.log(`🔄 Chatbot atualizado: ${chatbotId}`);
    
    return updated;
  }

  /**
   * Processar mensagem recebida e gerar resposta com IA
   */
  async processMessage(
    userId: string,
    contactId: string,
    contactName: string,
    message: string
  ): Promise<string | null> {
    const chatbot = this.getChatbotByUserId(userId);
    
    if (!chatbot || !chatbot.isActive) {
      console.log('⚠️ Chatbot não encontrado ou inativo');
      return null;
    }

    // Verificar gatilhos de palavras-chave
    if (chatbot.triggerKeywords.length > 0) {
      const hasKeyword = chatbot.triggerKeywords.some(keyword =>
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (!hasKeyword) {
        console.log('⏭️ Mensagem não contém palavras-chave de gatilho');
        return null;
      }
    }

    try {
      // Obter ou criar contexto de conversação
      let context = this.conversations.get(contactId);
      
      if (!context || (Date.now() - context.lastInteraction.getTime()) > this.CONTEXT_TIMEOUT) {
        // Nova conversação ou expirada
        context = {
          contactId,
          messages: [],
          lastInteraction: new Date(),
        };
        
        // Adicionar mensagem de saudação se configurada
        if (chatbot.greetingMessage) {
          const greetingWithBraces = this.replaceAtVariables(chatbot.greetingMessage);
          const greeting = greetingWithBraces.replace(/\{\{nome\}\}/g, contactName);
          context.messages.push({
            role: 'assistant',
            content: greeting,
            timestamp: new Date(),
          });
        }
      }

      // Adicionar mensagem do usuário
      context.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      // Limitar histórico de mensagens
      if (chatbot.conversationMemory) {
        const maxMessages = chatbot.maxMemoryMessages * 2; // user + assistant
        if (context.messages.length > maxMessages) {
          context.messages = context.messages.slice(-maxMessages);
        }
      } else {
        // Sem memória: manter apenas última mensagem
        context.messages = [context.messages[context.messages.length - 1]];
      }

      // Gerar resposta com IA
      const response = await this.generateAIResponse(chatbot, context, contactName);

      // Adicionar resposta ao contexto
      context.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      context.lastInteraction = new Date();
      this.conversations.set(contactId, context);

      return response;
    } catch (error: any) {
      console.error('❌ Erro ao processar mensagem:', error);
      return chatbot.fallbackMessage || 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
    }
  }

  /**
   * Gerar resposta usando IA (OpenAI ou Custom)
   */
  private async generateAIResponse(
    chatbot: ChatbotConfig,
    context: ConversationContext,
    contactName: string
  ): Promise<string> {
    if (chatbot.aiProvider === 'openai') {
      return this.generateOpenAIResponse(chatbot, context, contactName);
    } else {
      // Custom AI provider (pode ser implementado depois)
      return chatbot.fallbackMessage || 'Como posso ajudá-lo?';
    }
  }

  /**
   * Substituir variáveis no formato @ por {{ }}
   */
  private replaceAtVariables(text: string): string {
    return text
      .replace(/@nome/g, '{{nome}}')
      .replace(/@email/g, '{{email}}')
      .replace(/@telefone/g, '{{telefone}}')
      .replace(/@data/g, '{{data}}');
  }

  /**
   * Gerar resposta usando OpenAI
   */
  private async generateOpenAIResponse(
    chatbot: ChatbotConfig,
    context: ConversationContext,
    contactName: string
  ): Promise<string> {
    const apiKey = chatbot.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OpenAI API Key não configurada');
      return chatbot.fallbackMessage;
    }

    try {
      // Preparar prompt do sistema com personalização
      // Converter @ para {{ }} antes de substituir variáveis
      const systemPromptWithBraces = this.replaceAtVariables(chatbot.systemPrompt);
      const systemPrompt = systemPromptWithBraces
        .replace(/\{\{nome\}\}/g, contactName)
        .replace(/\{\{data\}\}/g, new Date().toLocaleDateString('pt-BR'));

      // Preparar mensagens para API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...context.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ];

      // Chamar API da OpenAI
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: chatbot.model,
          messages,
          temperature: chatbot.temperature,
          max_tokens: chatbot.maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 30000,
        }
      );

      const aiResponse = response.data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Resposta vazia da API');
      }

      console.log(`🤖 Resposta gerada: ${aiResponse.substring(0, 50)}...`);
      return aiResponse;
    } catch (error: any) {
      console.error('❌ Erro ao chamar OpenAI:', error.response?.data || error.message);
      return chatbot.fallbackMessage;
    }
  }

  /**
   * Limpar contexto de conversação
   */
  clearConversation(contactId: string): void {
    this.conversations.delete(contactId);
    console.log(`🧹 Contexto limpo para contato: ${contactId}`);
  }

  /**
   * Obter estatísticas de conversações
   */
  getConversationStats(userId: string): {
    totalConversations: number;
    activeConversations: number;
    totalMessages: number;
  } {
    const chatbot = this.getChatbotByUserId(userId);
    if (!chatbot) {
      return { totalConversations: 0, activeConversations: 0, totalMessages: 0 };
    }

    let totalMessages = 0;
    let activeConversations = 0;
    const now = Date.now();

    for (const [_, context] of this.conversations) {
      totalMessages += context.messages.length;
      
      if ((now - context.lastInteraction.getTime()) < this.CONTEXT_TIMEOUT) {
        activeConversations++;
      }
    }

    return {
      totalConversations: this.conversations.size,
      activeConversations,
      totalMessages,
    };
  }

  /**
   * Limpar conversações expiradas
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [contactId, context] of this.conversations) {
      if ((now - context.lastInteraction.getTime()) > this.CONTEXT_TIMEOUT) {
        this.conversations.delete(contactId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} conversações expiradas removidas`);
    }
  }

  /**
   * Listar todos os chatbots
   */
  getAllChatbots(): ChatbotConfig[] {
    return Array.from(this.chatbots.values());
  }

  /**
   * Deletar chatbot
   */
  deleteChatbot(chatbotId: string): boolean {
    return this.chatbots.delete(chatbotId);
  }
}

export const chatbotService = new ChatbotService();

// Limpar conversações expiradas a cada 10 minutos
setInterval(() => {
  chatbotService.cleanup();
}, 10 * 60 * 1000);
