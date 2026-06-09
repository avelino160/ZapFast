import type { Express } from "express";
import { chatbotService } from "./services/chatbotService";

function requireAuth(req: any, res: any, next: any) {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      error: "Autenticação necessária.",
    });
    return;
  }
  
  req.userId = userId;
  next();
}

function getUserId(req: any): string {
  const sessionUserId = (req.session as any).userId;
  if (sessionUserId) {
    return sessionUserId;
  }
  console.warn("⚠️ Usando usuário demo (default-user)");
  return "default-user";
}

export function registerChatbotRoutes(app: Express) {
  console.log('🤖 Registrando rotas de Chatbot AI');

  /**
   * Salvar/Criar configuração de chatbot
   * POST /api/chatbot/config
   */
  app.post('/api/chatbot/config', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const {
        name,
        isActive,
        aiProvider,
        apiKey,
        model,
        systemPrompt,
        temperature,
        maxTokens,
        fallbackMessage,
        greetingMessage,
        triggerKeywords,
        conversationMemory,
        maxMemoryMessages,
      } = req.body;

      // Validação
      if (!name || !systemPrompt) {
        return res.status(400).json({
          message: "Nome e Prompt do Sistema são obrigatórios",
        });
      }

      const config = await chatbotService.saveChatbotConfig({
        userId,
        name,
        isActive: isActive !== undefined ? isActive : true,
        aiProvider: aiProvider || 'openai',
        apiKey,
        model: model || 'gpt-4o-mini',
        systemPrompt,
        temperature: temperature !== undefined ? temperature : 0.7,
        maxTokens: maxTokens || 500,
        fallbackMessage: fallbackMessage || 'Desculpe, não entendi. Pode reformular?',
        greetingMessage,
        triggerKeywords: triggerKeywords || [],
        conversationMemory: conversationMemory !== undefined ? conversationMemory : true,
        maxMemoryMessages: maxMemoryMessages || 10,
      });

      res.status(201).json(config);
    } catch (error: any) {
      console.error("❌ Erro ao salvar configuração:", error);
      res.status(500).json({ message: error.message || "Failed to save config" });
    }
  });

  /**
   * Obter configuração de chatbot do usuário
   * GET /api/chatbot/config
   */
  app.get('/api/chatbot/config', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const config = chatbotService.getChatbotByUserId(userId);
      
      if (!config) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }

      res.json(config);
    } catch (error: any) {
      console.error("❌ Erro ao buscar configuração:", error);
      res.status(500).json({ message: error.message || "Failed to get config" });
    }
  });

  /**
   * Atualizar configuração de chatbot
   * PUT /api/chatbot/config/:id
   */
  app.put('/api/chatbot/config/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      // Verificar propriedade
      const existing = chatbotService.getAllChatbots().find(c => c.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }

      const updated = await chatbotService.updateChatbotConfig(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar configuração:", error);
      res.status(500).json({ message: error.message || "Failed to update config" });
    }
  });

  /**
   * Deletar configuração de chatbot
   * DELETE /api/chatbot/config/:id
   */
  app.delete('/api/chatbot/config/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      // Verificar propriedade
      const existing = chatbotService.getAllChatbots().find(c => c.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }

      const success = chatbotService.deleteChatbot(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Configuração não encontrada" });
      }
    } catch (error: any) {
      console.error("❌ Erro ao deletar configuração:", error);
      res.status(500).json({ message: error.message || "Failed to delete config" });
    }
  });

  /**
   * Testar chatbot com mensagem
   * POST /api/chatbot/test
   */
  app.post('/api/chatbot/test', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { message, contactName } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Mensagem é obrigatória" });
      }

      const testContactId = `test_${userId}_${Date.now()}`;
      
      const response = await chatbotService.processMessage(
        userId,
        testContactId,
        contactName || 'Usuário Teste',
        message
      );

      if (!response) {
        return res.status(404).json({
          message: "Chatbot não configurado ou inativo",
        });
      }

      res.json({ response });
    } catch (error: any) {
      console.error("❌ Erro ao testar chatbot:", error);
      res.status(500).json({ message: error.message || "Failed to test chatbot" });
    }
  });

  /**
   * Limpar conversação de um contato
   * POST /api/chatbot/clear/:contactId
   */
  app.post('/api/chatbot/clear/:contactId', requireAuth, async (req, res) => {
    try {
      const { contactId } = req.params;
      chatbotService.clearConversation(contactId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("❌ Erro ao limpar conversação:", error);
      res.status(500).json({ message: error.message || "Failed to clear conversation" });
    }
  });

  /**
   * Obter estatísticas de conversações
   * GET /api/chatbot/stats
   */
  app.get('/api/chatbot/stats', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const stats = chatbotService.getConversationStats(userId);
      res.json(stats);
    } catch (error: any) {
      console.error("❌ Erro ao buscar estatísticas:", error);
      res.status(500).json({ message: error.message || "Failed to get stats" });
    }
  });

  /**
   * Ativar/Desativar chatbot
   * POST /api/chatbot/toggle/:id
   */
  app.post('/api/chatbot/toggle/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      // Verificar propriedade
      const existing = chatbotService.getAllChatbots().find(c => c.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }

      const updated = await chatbotService.updateChatbotConfig(id, {
        isActive: !existing.isActive,
      });

      res.json(updated);
    } catch (error: any) {
      console.error("❌ Erro ao alternar chatbot:", error);
      res.status(500).json({ message: error.message || "Failed to toggle chatbot" });
    }
  });

  console.log('✅ Rotas de Chatbot AI registradas');
}
