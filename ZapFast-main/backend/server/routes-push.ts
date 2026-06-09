import type { Express } from "express";
import { pushNotificationService } from "./services/pushNotificationService";
import { z } from "zod";

// Middleware para verificar autenticação
function requireAuth(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      error: "Não autenticado",
    });
    return;
  }
  
  req.userId = userId;
  next();
}

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

const sendNotificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  url: z.string().optional(),
  tag: z.string().optional(),
});

export function registerPushRoutes(app: Express) {
  // Obter VAPID public key
  app.get("/api/push/vapid-public-key", (req, res) => {
    try {
      const publicKey = pushNotificationService.getVapidPublicKey();
      res.json({ success: true, publicKey });
    } catch (error) {
      console.error("Erro ao obter VAPID key:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao obter chave pública",
      });
    }
  });

  // Registrar nova subscrição
  app.post("/api/push/subscribe", requireAuth, async (req, res) => {
    try {
      const validation = subscribeSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: validation.error.errors,
        });
        return;
      }

      const subscription = validation.data;
      const userId = (req as any).userId;
      const userAgent = req.headers['user-agent'];

      await pushNotificationService.saveSubscription(
        userId,
        subscription,
        userAgent
      );

      res.json({
        success: true,
        message: "Subscrição registrada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao registrar subscrição:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao registrar subscrição",
      });
    }
  });

  // Remover subscrição
  app.post("/api/push/unsubscribe", requireAuth, async (req, res) => {
    try {
      const { endpoint } = req.body;
      
      if (!endpoint) {
        res.status(400).json({
          success: false,
          error: "Endpoint é obrigatório",
        });
        return;
      }

      const userId = (req as any).userId;

      await pushNotificationService.removeSubscription(userId, endpoint);

      res.json({
        success: true,
        message: "Subscrição removida com sucesso",
      });
    } catch (error) {
      console.error("Erro ao remover subscrição:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao remover subscrição",
      });
    }
  });

  // Enviar notificação (admin/testing)
  app.post("/api/push/send", requireAuth, async (req, res) => {
    try {
      const validation = sendNotificationSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: validation.error.errors,
        });
        return;
      }

      const { userId, title, body, icon, url, tag } = validation.data;
      const currentUserId = (req as any).userId;

      const payload = {
        title,
        body,
        icon: icon || '/attached_assets/favicon.png',
        url: url || '/dashboard',
        tag: tag || 'manual-notification',
      };

      // Se userId não fornecido, enviar para o próprio usuário
      const targetUserId = userId || currentUserId;

      const result = await pushNotificationService.sendToUser(
        targetUserId,
        payload
      );

      res.json({
        success: true,
        message: "Notificação enviada",
        result,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao enviar notificação",
      });
    }
  });

  // Testar notificação de desconexão
  app.post("/api/push/test/disconnection", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { phoneNumber } = req.body;

      const result = await pushNotificationService.sendDisconnectionAlert(
        userId,
        phoneNumber
      );

      res.json({
        success: true,
        message: "Notificação de desconexão enviada",
        result,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação de desconexão:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao enviar notificação",
      });
    }
  });

  // Testar notificação de renovação
  app.post("/api/push/test/renewal", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { daysLeft, planType } = req.body;

      const result = await pushNotificationService.sendRenewalWarning(
        userId,
        daysLeft || 7,
        planType || 'Pro'
      );

      res.json({
        success: true,
        message: "Notificação de renovação enviada",
        result,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação de renovação:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao enviar notificação",
      });
    }
  });

  // Testar notificação de novidades
  app.post("/api/push/test/news", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { title, description, url } = req.body;

      const result = await pushNotificationService.sendPlatformNews(
        userId,
        title || 'Nova Funcionalidade',
        description || 'Confira as novidades da plataforma!',
        url
      );

      res.json({
        success: true,
        message: "Notificação de novidades enviada",
        result,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação de novidades:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao enviar notificação",
      });
    }
  });
}
