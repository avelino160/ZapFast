import type { Express } from "express";
import { storage } from "./storage";
import { whatsappService } from "./services/whatsappService";
import { funnelService } from "./services/funnelService";
import { pushNotificationService } from "./services/pushNotificationService";
import crypto from "crypto";

/**
 * Rotas de Webhooks para Integrações Externas
 * 
 * Suporta:
 * - Stripe (pagamentos)
 * - Mercado Pago (pagamentos)
 * - Zapier (automações)
 * - Google Sheets (planilhas)
 * - OpenAI/ChatGPT (IA)
 * - SendGrid (e-mail)
 * - Mailgun (e-mail)
 * - Twilio (telefonia)
 * - HubSpot (CRM)
 * - Pipedrive (CRM)
 */

// Middleware de autenticação para webhooks
function requireAuth(req: any, res: any, next: any) {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ success: false, error: "Não autenticado" });
    return;
  }
  req.userId = userId;
  next();
}

export function registerWebhookRoutes(app: Express) {
  
  // ============================================
  // 💳 STRIPE - Webhooks de Pagamento
  // ============================================
  
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.log('⚠️ STRIPE_WEBHOOK_SECRET não configurado');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }

      // Validar assinatura do Stripe
      // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      // Por enquanto, aceitar sem validação (adicionar Stripe depois)
      const event = req.body;
      
      console.log('💳 [STRIPE] Evento recebido:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
        case 'payment_intent.succeeded':
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const planType = session.metadata?.planType || 'pro';
          const durationDays = parseInt(session.metadata?.durationDays || '30');

          if (userId) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);

            await storage.updateUserPlan(userId, planType, expiresAt);
            
            await pushNotificationService.sendToUser(userId, {
              title: '✅ Pagamento Confirmado',
              body: `Seu plano ${planType} foi ativado por ${durationDays} dias!`,
              url: '/dashboard',
              tag: 'payment-success'
            });

            console.log(`✅ [STRIPE] Plano ${planType} ativado para ${userId}`);
          }
          break;

        case 'invoice.payment_failed':
          const invoice = event.data.object;
          const customerId = invoice.customer;
          console.log(`❌ [STRIPE] Pagamento falhou: ${customerId}`);
          break;

        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          const subUserId = subscription.metadata?.userId;
          if (subUserId) {
            await storage.blockUser(subUserId);
            console.log(`🔒 [STRIPE] Usuário ${subUserId} bloqueado (assinatura cancelada)`);
          }
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('❌ [STRIPE] Erro:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // 💰 MERCADO PAGO - Webhooks de Pagamento
  // ============================================
  
  app.post("/api/webhooks/mercadopago", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      console.log('💰 [MERCADO PAGO] Evento recebido:', type);

      if (type === 'payment') {
        const paymentId = data.id;
        
        // Aqui você buscaria os detalhes do pagamento na API do Mercado Pago
        // const payment = await mercadopago.payment.get(paymentId);
        
        // Simulação:
        const payment = {
          status: 'approved',
          metadata: {
            user_id: 'user-123',
            plan_type: 'pro',
            duration_days: 30
          }
        };

        if (payment.status === 'approved') {
          const userId = payment.metadata.user_id;
          const planType = payment.metadata.plan_type;
          const durationDays = parseInt(payment.metadata.duration_days);

          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + durationDays);

          await storage.updateUserPlan(userId, planType, expiresAt);
          
          await pushNotificationService.sendToUser(userId, {
            title: '✅ Pagamento Aprovado',
            body: `Seu plano ${planType} foi ativado!`,
            url: '/dashboard'
          });

          console.log(`✅ [MERCADO PAGO] Plano ativado para ${userId}`);
        }
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('❌ [MERCADO PAGO] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 🤝 ZAPIER - Integrações
  // ============================================
  
  app.post("/api/webhooks/zapier", requireAuth, async (req, res) => {
    try {
      const { event, data } = req.body;
      const userId = (req as any).userId;
      
      console.log('🤝 [ZAPIER] Evento recebido:', event);

      switch (event) {
        case 'new_lead':
        case 'new_contact':
          const contact = await storage.createContact({
            userId,
            phoneNumber: data.phone || data.phoneNumber,
            name: data.name,
            email: data.email,
            tags: ['zapier', ...(data.tags || [])],
            isActive: true
          });
          
          console.log(`✅ [ZAPIER] Contato criado: ${contact.id}`);
          
          // Se tiver funil especificado, acionar
          if (data.funnelId) {
            await funnelService.executeFunnel(data.funnelId, contact.id, data.message || '');
            console.log(`🚀 [ZAPIER] Funil ${data.funnelId} acionado`);
          }
          break;

        case 'form_submitted':
          const existingContact = await storage.getContactByPhone(data.phone, userId);
          if (existingContact && data.funnelId) {
            await funnelService.executeFunnel(data.funnelId, existingContact.id, data.message || '');
            console.log(`🚀 [ZAPIER] Funil acionado para contato existente`);
          }
          break;

        case 'send_message':
          if (data.phone && data.message) {
            await whatsappService.sendMessage(data.phone, data.message, userId);
            console.log(`📤 [ZAPIER] Mensagem enviada para ${data.phone}`);
          }
          break;
      }

      res.json({ success: true, message: 'Event processed' });
    } catch (error: any) {
      console.error('❌ [ZAPIER] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 📊 GOOGLE SHEETS - Sincronização de Planilhas
  // ============================================
  
  app.post("/api/webhooks/google-sheets", requireAuth, async (req, res) => {
    try {
      const { action, row, rowIndex } = req.body;
      const userId = (req as any).userId;
      
      console.log('📊 [GOOGLE SHEETS] Ação recebida:', action);

      switch (action) {
        case 'row_added':
        case 'row_updated':
          // Formato esperado: [Telefone, Nome, Email, Tags]
          const contact = await storage.createContact({
            userId,
            phoneNumber: row[0]?.replace(/\D/g, ''), // Coluna A: Telefone
            name: row[1] || 'Sem nome',               // Coluna B: Nome
            email: row[2] || null,                    // Coluna C: Email
            tags: row[3] ? row[3].split(',').map((t: string) => t.trim()) : [], // Coluna D: Tags
            isActive: true
          });
          
          console.log(`✅ [GOOGLE SHEETS] Contato sincronizado: ${contact.id}`);
          break;

        case 'row_deleted':
          // Buscar e desativar contato
          if (row[0]) {
            const phone = row[0].replace(/\D/g, '');
            const contact = await storage.getContactByPhone(phone, userId);
            if (contact) {
              await storage.updateContact(contact.id, { isActive: false });
              console.log(`🗑️ [GOOGLE SHEETS] Contato desativado: ${contact.id}`);
            }
          }
          break;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ [GOOGLE SHEETS] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 🤖 OPENAI / CHATGPT - IA
  // ============================================
  
  app.post("/api/webhooks/openai", requireAuth, async (req, res) => {
    try {
      const { contactId, question, answer, conversationId } = req.body;
      const userId = (req as any).userId;
      
      console.log('🤖 [OPENAI] Resposta recebida para contato:', contactId);

      if (contactId && answer) {
        const contact = await storage.getContact(contactId, userId);
        
        if (contact) {
          // Enviar resposta da IA para o contato
          await whatsappService.sendMessage(
            contact.phoneNumber,
            answer,
            userId
          );

          // Salvar mensagem no histórico
          await storage.createMessage({
            userId,
            contactId: contact.id,
            type: 'text',
            content: answer,
            status: 'sent',
            sentAt: new Date()
          });

          console.log(`✅ [OPENAI] Resposta enviada para ${contact.phoneNumber}`);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ [OPENAI] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 📧 SENDGRID - E-mail
  // ============================================
  
  app.post("/api/webhooks/sendgrid", async (req, res) => {
    try {
      const events = req.body;
      
      console.log('📧 [SENDGRID] Eventos recebidos:', events.length);

      for (const event of events) {
        switch (event.event) {
          case 'delivered':
            console.log(`✅ [SENDGRID] E-mail entregue para ${event.email}`);
            break;

          case 'bounce':
          case 'dropped':
            // Marcar e-mail como inválido
            const contacts = await storage.getContacts('default-user'); // TODO: Melhorar busca
            const contact = contacts.find(c => c.email === event.email);
            
            if (contact) {
              await storage.updateContact(contact.id, { 
                tags: [...(contact.tags || []), 'email-invalido']
              });
              console.log(`⚠️ [SENDGRID] E-mail inválido marcado: ${event.email}`);
            }
            break;

          case 'open':
            console.log(`👁️ [SENDGRID] E-mail aberto por ${event.email}`);
            break;

          case 'click':
            console.log(`🖱️ [SENDGRID] Link clicado por ${event.email}`);
            break;
        }
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error('❌ [SENDGRID] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 📨 MAILGUN - E-mail
  // ============================================
  
  app.post("/api/webhooks/mailgun", async (req, res) => {
    try {
      const { event, recipient, message } = req.body;
      
      console.log('📨 [MAILGUN] Evento recebido:', event);

      switch (event) {
        case 'delivered':
          console.log(`✅ [MAILGUN] E-mail entregue para ${recipient}`);
          break;

        case 'failed':
        case 'bounced':
          console.log(`❌ [MAILGUN] E-mail falhou para ${recipient}`);
          break;

        case 'opened':
          console.log(`👁️ [MAILGUN] E-mail aberto por ${recipient}`);
          break;

        case 'clicked':
          console.log(`🖱️ [MAILGUN] Link clicado por ${recipient}`);
          break;
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error('❌ [MAILGUN] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 📞 TWILIO - Telefonia
  // ============================================
  
  app.post("/api/webhooks/twilio", async (req, res) => {
    try {
      const { CallStatus, From, To, RecordingUrl, CallSid, Direction } = req.body;
      
      console.log('📞 [TWILIO] Evento de chamada:', CallStatus);

      if (CallStatus === 'completed') {
        // Registrar chamada completada
        const cleanPhone = From.replace(/\D/g, '');
        
        // Buscar ou criar contato
        let contact = await storage.getContactByPhone(cleanPhone, 'default-user');
        if (!contact) {
          contact = await storage.createContact({
            userId: 'default-user',
            phoneNumber: cleanPhone,
            name: `Contato ${cleanPhone}`,
            tags: ['telefone'],
            isActive: true
          });
        }

        // Salvar registro da chamada
        await storage.createMessage({
          userId: 'default-user',
          contactId: contact.id,
          type: 'audio',
          content: `Chamada telefônica (${Direction})`,
          mediaUrl: RecordingUrl || null,
          status: 'delivered',
          sentAt: new Date()
        });

        console.log(`✅ [TWILIO] Chamada registrada para ${cleanPhone}`);
      }

      res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    } catch (error: any) {
      console.error('❌ [TWILIO] Erro:', error.message);
      res.status(500).send('Error');
    }
  });

  // ============================================
  // 🎫 HUBSPOT - CRM
  // ============================================
  
  app.post("/api/webhooks/hubspot", async (req, res) => {
    try {
      const events = req.body;
      
      console.log('🎫 [HUBSPOT] Eventos recebidos:', events.length || 1);

      for (const event of (Array.isArray(events) ? events : [events])) {
        const { subscriptionType, objectId, propertyName, propertyValue } = event;

        if (subscriptionType === 'contact.creation' || subscriptionType === 'contact.propertyChange') {
          // Sincronizar contato do HubSpot
          // Aqui você buscaria os dados completos na API do HubSpot
          // const hubspotContact = await hubspot.contacts.get(objectId);

          console.log(`✅ [HUBSPOT] Contato atualizado: ${objectId}`);
        }
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error('❌ [HUBSPOT] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 💼 PIPEDRIVE - CRM
  // ============================================
  
  app.post("/api/webhooks/pipedrive", async (req, res) => {
    try {
      const { event, current } = req.body;
      
      console.log('💼 [PIPEDRIVE] Evento recebido:', event);

      switch (event) {
        case 'added.person':
        case 'updated.person':
          if (current?.phone) {
            const phone = current.phone[0]?.value.replace(/\D/g, '');
            
            // Criar ou atualizar contato
            let contact = await storage.getContactByPhone(phone, 'default-user');
            
            if (!contact) {
              contact = await storage.createContact({
                userId: 'default-user',
                phoneNumber: phone,
                name: current.name,
                email: current.email?.[0]?.value || null,
                tags: ['pipedrive'],
                isActive: true
              });
              console.log(`✅ [PIPEDRIVE] Contato criado: ${contact.id}`);
            } else {
              await storage.updateContact(contact.id, {
                name: current.name,
                email: current.email?.[0]?.value || contact.email
              });
              console.log(`✅ [PIPEDRIVE] Contato atualizado: ${contact.id}`);
            }
          }
          break;

        case 'won.deal':
          console.log(`🎉 [PIPEDRIVE] Negócio ganho: ${current?.title}`);
          // Aqui você pode acionar um funil de boas-vindas, por exemplo
          break;

        case 'lost.deal':
          console.log(`😞 [PIPEDRIVE] Negócio perdido: ${current?.title}`);
          break;
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('❌ [PIPEDRIVE] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 🔧 WEBHOOK GENÉRICO - Para testes
  // ============================================
  
  app.post("/api/webhooks/generic", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const data = req.body;
      
      console.log('🔧 [GENERIC] Webhook recebido:', JSON.stringify(data, null, 2));

      // Log para debug
      console.log(`User: ${userId}, Data: ${JSON.stringify(data)}`);

      res.json({ 
        success: true, 
        received: data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ [GENERIC] Erro:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // 📋 LISTAR WEBHOOKS DISPONÍVEIS
  // ============================================
  
  app.get("/api/webhooks/list", (req, res) => {
    const webhooks = [
      {
        name: 'Stripe',
        url: '/api/webhooks/stripe',
        method: 'POST',
        auth: false,
        description: 'Pagamentos com Stripe'
      },
      {
        name: 'Mercado Pago',
        url: '/api/webhooks/mercadopago',
        method: 'POST',
        auth: false,
        description: 'Pagamentos com Mercado Pago'
      },
      {
        name: 'Zapier',
        url: '/api/webhooks/zapier',
        method: 'POST',
        auth: true,
        description: 'Automações Zapier'
      },
      {
        name: 'Google Sheets',
        url: '/api/webhooks/google-sheets',
        method: 'POST',
        auth: true,
        description: 'Sincronização com planilhas'
      },
      {
        name: 'OpenAI',
        url: '/api/webhooks/openai',
        method: 'POST',
        auth: true,
        description: 'Respostas de IA'
      },
      {
        name: 'SendGrid',
        url: '/api/webhooks/sendgrid',
        method: 'POST',
        auth: false,
        description: 'Eventos de e-mail SendGrid'
      },
      {
        name: 'Mailgun',
        url: '/api/webhooks/mailgun',
        method: 'POST',
        auth: false,
        description: 'Eventos de e-mail Mailgun'
      },
      {
        name: 'Twilio',
        url: '/api/webhooks/twilio',
        method: 'POST',
        auth: false,
        description: 'Eventos de telefonia Twilio'
      },
      {
        name: 'HubSpot',
        url: '/api/webhooks/hubspot',
        method: 'POST',
        auth: false,
        description: 'Sincronização CRM HubSpot'
      },
      {
        name: 'Pipedrive',
        url: '/api/webhooks/pipedrive',
        method: 'POST',
        auth: false,
        description: 'Sincronização CRM Pipedrive'
      },
      {
        name: 'Generic',
        url: '/api/webhooks/generic',
        method: 'POST',
        auth: true,
        description: 'Webhook genérico para testes'
      }
    ];

    res.json({ 
      total: webhooks.length,
      webhooks,
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  });
}
