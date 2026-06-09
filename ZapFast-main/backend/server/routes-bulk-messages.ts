import type { Express } from "express";
import { bulkMessageService } from "./services/bulkMessageService";
import { storage } from "./storage";

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

export function registerBulkMessageRoutes(app: Express) {
  console.log('📤 Registrando rotas de disparos em massa');

  /**
   * Create a new bulk messaging campaign
   * POST /api/bulk-messages/campaigns
   */
  app.post('/api/bulk-messages/campaigns', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { 
        name, 
        message, 
        recipientIds, 
        mediaUrl,
        delayBetweenMessages,
        maxRetries,
        scheduledAt 
      } = req.body;

      // Validation
      if (!name || !message || !recipientIds || recipientIds.length === 0) {
        return res.status(400).json({ 
          message: "Nome, mensagem e destinatários são obrigatórios" 
        });
      }

      // Check message limit
      const limitCheck = await storage.checkMessageLimit(userId);
      if (!limitCheck.allowed) {
        const check = limitCheck as { allowed: false; reason: string; limit: number; current: number };
        return res.status(403).json({ 
          message: check.reason,
          error: "limit_exceeded",
          limit: check.limit,
          current: check.current
        });
      }

      const campaign = await bulkMessageService.createCampaign(
        userId,
        name,
        message,
        recipientIds,
        {
          delayBetweenMessages: delayBetweenMessages || 3,
          maxRetries: maxRetries || 3,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        },
        mediaUrl
      );

      res.status(201).json(campaign);
    } catch (error: any) {
      console.error("❌ Erro ao criar campanha:", error);
      res.status(500).json({ message: error.message || "Failed to create campaign" });
    }
  });

  /**
   * Start a bulk messaging campaign
   * POST /api/bulk-messages/campaigns/:id/start
   */
  app.post('/api/bulk-messages/campaigns/:id/start', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      const campaign = bulkMessageService.getCampaignStatus(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      const success = await bulkMessageService.startCampaign(id);
      
      if (success) {
        res.json({ success: true, campaign: bulkMessageService.getCampaignStatus(id) });
      } else {
        res.status(400).json({ message: "Não foi possível iniciar a campanha" });
      }
    } catch (error: any) {
      console.error("❌ Erro ao iniciar campanha:", error);
      res.status(500).json({ message: error.message || "Failed to start campaign" });
    }
  });

  /**
   * Pause a running campaign
   * POST /api/bulk-messages/campaigns/:id/pause
   */
  app.post('/api/bulk-messages/campaigns/:id/pause', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      const campaign = bulkMessageService.getCampaignStatus(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      const success = bulkMessageService.pauseCampaign(id);
      
      if (success) {
        res.json({ success: true, campaign: bulkMessageService.getCampaignStatus(id) });
      } else {
        res.status(400).json({ message: "Não foi possível pausar a campanha" });
      }
    } catch (error: any) {
      console.error("❌ Erro ao pausar campanha:", error);
      res.status(500).json({ message: error.message || "Failed to pause campaign" });
    }
  });

  /**
   * Resume a paused campaign
   * POST /api/bulk-messages/campaigns/:id/resume
   */
  app.post('/api/bulk-messages/campaigns/:id/resume', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      const campaign = bulkMessageService.getCampaignStatus(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      const success = bulkMessageService.resumeCampaign(id);
      
      if (success) {
        res.json({ success: true, campaign: bulkMessageService.getCampaignStatus(id) });
      } else {
        res.status(400).json({ message: "Não foi possível retomar a campanha" });
      }
    } catch (error: any) {
      console.error("❌ Erro ao retomar campanha:", error);
      res.status(500).json({ message: error.message || "Failed to resume campaign" });
    }
  });

  /**
   * Cancel a campaign
   * POST /api/bulk-messages/campaigns/:id/cancel
   */
  app.post('/api/bulk-messages/campaigns/:id/cancel', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      const campaign = bulkMessageService.getCampaignStatus(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      const success = bulkMessageService.cancelCampaign(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Não foi possível cancelar a campanha" });
      }
    } catch (error: any) {
      console.error("❌ Erro ao cancelar campanha:", error);
      res.status(500).json({ message: error.message || "Failed to cancel campaign" });
    }
  });

  /**
   * Get campaign status and progress
   * GET /api/bulk-messages/campaigns/:id/status
   */
  app.get('/api/bulk-messages/campaigns/:id/status', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);

      const campaign = bulkMessageService.getCampaignStatus(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }

      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      res.json(campaign);
    } catch (error: any) {
      console.error("❌ Erro ao buscar status:", error);
      res.status(500).json({ message: error.message || "Failed to get campaign status" });
    }
  });

  /**
   * Get all campaigns for the authenticated user
   * GET /api/bulk-messages/campaigns
   */
  app.get('/api/bulk-messages/campaigns', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const campaigns = bulkMessageService.getUserCampaigns(userId);
      
      res.json(campaigns);
    } catch (error: any) {
      console.error("❌ Erro ao buscar campanhas:", error);
      res.status(500).json({ message: error.message || "Failed to get campaigns" });
    }
  });

  /**
   * Get campaign history (past 30 days)
   * GET /api/bulk-messages/history
   */
  app.get('/api/bulk-messages/history', requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const campaigns = bulkMessageService.getUserCampaigns(userId);
      
      // Filter completed or failed campaigns
      const history = campaigns.filter(c => 
        c.status === 'completed' || c.status === 'failed'
      );
      
      res.json(history);
    } catch (error: any) {
      console.error("❌ Erro ao buscar histórico:", error);
      res.status(500).json({ message: error.message || "Failed to get history" });
    }
  });

  console.log('✅ Rotas de disparos em massa registradas');
}
