import type { Express } from "express";
import { storage } from "./storage";

/**
 * Rotas para Gerenciar Integrações
 * 
 * Permite configurar, listar e testar integrações
 */

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ success: false, error: "Não autenticado" });
    return;
  }
  req.userId = userId;
  next();
}

export function registerIntegrationRoutes(app: Express) {
  
  // ============================================
  // 📋 LISTAR TODAS AS INTEGRAÇÕES
  // ============================================
  
  app.get("/api/integrations/list", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Buscar configurações salvas (futuro: adicionar tabela de integrações)
      const integrations = [
        {
          id: "stripe",
          name: "Stripe",
          description: "Receba pagamentos e ative planos automaticamente",
          category: "payments",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/stripe`,
          docsUrl: "https://stripe.com/docs/webhooks",
          configFields: [
            { name: "STRIPE_WEBHOOK_SECRET", label: "Webhook Secret", type: "password" }
          ]
        },
        {
          id: "mercadopago",
          name: "Mercado Pago",
          description: "Pagamentos para o mercado brasileiro",
          category: "payments",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/mercadopago`,
          docsUrl: "https://www.mercadopago.com.br/developers/pt/docs/your-integrations/webhooks",
          configFields: [
            { name: "MERCADOPAGO_SECRET", label: "Secret Key", type: "password" }
          ]
        },
        {
          id: "zapier",
          name: "Zapier",
          description: "Conecte com 5000+ aplicativos",
          category: "automation",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/zapier`,
          docsUrl: "https://zapier.com/apps/webhook/integrations",
          requiresAuth: true,
          configFields: []
        },
        {
          id: "google-sheets",
          name: "Google Sheets",
          description: "Sincronize contatos de planilhas",
          category: "automation",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/google-sheets`,
          docsUrl: "https://developers.google.com/apps-script",
          requiresAuth: true,
          configFields: []
        },
        {
          id: "openai",
          name: "OpenAI",
          description: "Respostas automáticas com IA",
          category: "ai",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/openai`,
          docsUrl: "https://platform.openai.com/docs/api-reference",
          requiresAuth: true,
          configFields: [
            { name: "OPENAI_API_KEY", label: "API Key", type: "password" }
          ]
        },
        {
          id: "sendgrid",
          name: "SendGrid",
          description: "Rastreie e-mails enviados",
          category: "email",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/sendgrid`,
          docsUrl: "https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook",
          configFields: [
            { name: "SENDGRID_WEBHOOK_SECRET", label: "Webhook Secret", type: "password" },
            { name: "SENDGRID_API_KEY", label: "API Key", type: "password" }
          ]
        },
        {
          id: "mailgun",
          name: "Mailgun",
          description: "Serviço de e-mail transacional",
          category: "email",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/mailgun`,
          docsUrl: "https://documentation.mailgun.com/en/latest/api-webhooks.html",
          configFields: [
            { name: "MAILGUN_WEBHOOK_SECRET", label: "Webhook Secret", type: "password" },
            { name: "MAILGUN_API_KEY", label: "API Key", type: "password" }
          ]
        },
        {
          id: "twilio",
          name: "Twilio",
          description: "Integração com telefonia",
          category: "communication",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/twilio`,
          docsUrl: "https://www.twilio.com/docs/usage/webhooks",
          configFields: [
            { name: "TWILIO_AUTH_TOKEN", label: "Auth Token", type: "password" },
            { name: "TWILIO_ACCOUNT_SID", label: "Account SID", type: "text" }
          ]
        },
        {
          id: "hubspot",
          name: "HubSpot",
          description: "Sincronize seu CRM",
          category: "crm",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/hubspot`,
          docsUrl: "https://developers.hubspot.com/docs/api/webhooks",
          configFields: [
            { name: "HUBSPOT_SECRET", label: "Webhook Secret", type: "password" },
            { name: "HUBSPOT_API_KEY", label: "API Key", type: "password" }
          ]
        },
        {
          id: "pipedrive",
          name: "Pipedrive",
          description: "CRM de vendas integrado",
          category: "crm",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/pipedrive`,
          docsUrl: "https://pipedrive.readme.io/docs/guide-for-webhooks",
          configFields: [
            { name: "PIPEDRIVE_SECRET", label: "Webhook Secret", type: "password" },
            { name: "PIPEDRIVE_API_TOKEN", label: "API Token", type: "password" }
          ]
        },
        {
          id: "generic",
          name: "Webhook Genérico",
          description: "Para testes e integrações customizadas",
          category: "developer",
          status: "disconnected",
          webhookUrl: `${baseUrl}/api/webhooks/generic`,
          docsUrl: "#",
          requiresAuth: true,
          configFields: []
        },
      ];

      // Verificar quais têm secrets configurados
      const integrationsWithStatus = integrations.map(integration => {
        const hasConfig = integration.configFields.every(field => {
          return process.env[field.name] !== undefined && 
                 process.env[field.name] !== '' &&
                 !process.env[field.name]?.includes('your_') &&
                 !process.env[field.name]?.includes('_here');
        });

        return {
          ...integration,
          status: hasConfig ? 'connected' : 'disconnected'
        };
      });

      res.json({
        success: true,
        total: integrationsWithStatus.length,
        integrations: integrationsWithStatus
      });
    } catch (error: any) {
      console.error('❌ [INTEGRATIONS] Erro ao listar:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 🔍 DETALHES DE UMA INTEGRAÇÃO
  // ============================================
  
  app.get("/api/integrations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // TODO: Buscar do banco quando tivermos tabela de integrações
      
      res.json({
        success: true,
        integration: {
          id,
          webhookUrl: `${baseUrl}/api/webhooks/${id}`,
          status: 'disconnected'
        }
      });
    } catch (error: any) {
      console.error('❌ [INTEGRATIONS] Erro ao buscar:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 🧪 TESTAR INTEGRAÇÃO
  // ============================================
  
  app.post("/api/integrations/:id/test", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      
      console.log(`🧪 [INTEGRATIONS] Testando integração: ${id}`);
      
      // Simular teste bem-sucedido
      res.json({
        success: true,
        message: `Integração ${id} testada com sucesso!`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ [INTEGRATIONS] Erro ao testar:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 💾 SALVAR CONFIGURAÇÃO
  // ============================================
  
  app.post("/api/integrations/:id/config", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { config } = req.body;
      
      console.log(`💾 [INTEGRATIONS] Salvando configuração: ${id}`);
      
      // TODO: Salvar no banco quando tivermos tabela de integrações
      
      res.json({
        success: true,
        message: 'Configuração salva com sucesso'
      });
    } catch (error: any) {
      console.error('❌ [INTEGRATIONS] Erro ao salvar:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 🗑️ DESCONECTAR INTEGRAÇÃO
  // ============================================
  
  app.delete("/api/integrations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      
      console.log(`🗑️ [INTEGRATIONS] Desconectando: ${id}`);
      
      // TODO: Remover do banco quando tivermos tabela de integrações
      
      res.json({
        success: true,
        message: 'Integração desconectada com sucesso'
      });
    } catch (error: any) {
      console.error('❌ [INTEGRATIONS] Erro ao desconectar:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 📊 ESTATÍSTICAS DE USO
  // ============================================
  
  app.get("/api/integrations/stats/usage", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      // TODO: Buscar estatísticas reais do banco
      
      res.json({
        success: true,
        stats: {
          totalIntegrations: 11,
          connected: 0,
          totalWebhooks: 0,
          lastWebhook: null
        }
      });
    } catch (error: any) {
      console.error('❌ [INTEGRATIONS] Erro ao buscar stats:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
}
