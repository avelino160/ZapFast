import webpush from 'web-push';
import { storage } from '../storage';

// Configurar VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@zapfast.com';

webpush.setVapidDetails(
  vapidSubject,
  vapidPublicKey,
  vapidPrivateKey
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, any>;
}

class PushNotificationService {
  /**
   * Salvar uma nova subscrição de push
   */
  async saveSubscription(userId: string, subscription: PushSubscription, userAgent?: string) {
    try {
      console.log('💾 Salvando subscrição push para usuário:', userId);
      
      await storage.savePushSubscription({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
      });
      
      console.log('✅ Subscrição salva com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao salvar subscrição:', error);
      throw error;
    }
  }

  /**
   * Remover uma subscrição de push
   */
  async removeSubscription(userId: string, endpoint: string) {
    try {
      console.log('🗑️ Removendo subscrição push:', endpoint);
      
      await storage.removePushSubscription(userId, endpoint);
      
      console.log('✅ Subscrição removida com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao remover subscrição:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação para um usuário específico
   */
  async sendToUser(userId: string, payload: NotificationPayload) {
    try {
      console.log('📤 Enviando notificação para usuário:', userId);
      
      const subscriptions = await storage.getUserPushSubscriptions(userId);
      
      if (subscriptions.length === 0) {
        console.log('⚠️ Usuário não tem subscrições ativas');
        return { success: true, sent: 0 };
      }

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(
              pushSubscription,
              JSON.stringify(payload)
            );
            return { success: true, endpoint: sub.endpoint };
          } catch (error: any) {
            console.error('❌ Erro ao enviar para endpoint:', sub.endpoint, error.message);
            
            // Se o endpoint expirou (410), remover da base
            if (error.statusCode === 410) {
              console.log('🗑️ Endpoint expirado, removendo:', sub.endpoint);
              await storage.removePushSubscription(userId, sub.endpoint);
            }
            
            return { success: false, endpoint: sub.endpoint, error: error.message };
          }
        })
      );

      const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
      console.log(`✅ Notificação enviada para ${sent}/${subscriptions.length} dispositivos`);
      
      return { success: true, sent, total: subscriptions.length };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de desconexão do WhatsApp
   */
  async sendDisconnectionAlert(userId: string, phoneNumber?: string) {
    const payload: NotificationPayload = {
      title: '⚠️ WhatsApp Desconectado',
      body: phoneNumber 
        ? `Seu WhatsApp ${phoneNumber} foi desconectado` 
        : 'Seu WhatsApp foi desconectado',
      icon: '/attached_assets/favicon.png',
      badge: '/attached_assets/favicon.png',
      url: '/whatsapp-connection',
      tag: 'whatsapp-disconnect',
      requireInteraction: true,
      data: {
        type: 'disconnection',
        phoneNumber,
      },
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Enviar aviso de renovação de plano
   */
  async sendRenewalWarning(userId: string, daysLeft: number, planType: string) {
    const payload: NotificationPayload = {
      title: '🔔 Renovação Próxima',
      body: `Seu plano ${planType} expira em ${daysLeft} dias. Renove agora!`,
      icon: '/attached_assets/favicon.png',
      badge: '/attached_assets/favicon.png',
      url: '/settings',
      tag: 'plan-renewal',
      requireInteraction: true,
      data: {
        type: 'renewal',
        daysLeft,
        planType,
      },
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Enviar novidades da plataforma
   */
  async sendPlatformNews(userId: string, newsTitle: string, newsDescription: string, newsUrl?: string) {
    const payload: NotificationPayload = {
      title: `🎉 ${newsTitle}`,
      body: newsDescription,
      icon: '/attached_assets/favicon.png',
      badge: '/attached_assets/favicon.png',
      url: newsUrl || '/dashboard',
      tag: 'platform-news',
      requireInteraction: false,
      data: {
        type: 'news',
        newsTitle,
      },
    };

    return this.sendToUser(userId, payload);
  }

  /**
   * Broadcast: enviar para todos os usuários
   */
  async sendToAll(payload: NotificationPayload) {
    try {
      console.log('📢 Enviando broadcast para todos os usuários');
      
      const allUsers = await storage.getAllUsers();
      
      const results = await Promise.allSettled(
        allUsers.map(user => this.sendToUser(user.id, payload))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`✅ Broadcast enviado para ${successful}/${allUsers.length} usuários`);
      
      return { success: true, sent: successful, total: allUsers.length };
    } catch (error) {
      console.error('❌ Erro ao enviar broadcast:', error);
      throw error;
    }
  }

  /**
   * Obter VAPID public key para o cliente
   */
  getVapidPublicKey(): string {
    return vapidPublicKey;
  }
}

export const pushNotificationService = new PushNotificationService();
