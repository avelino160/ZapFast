import axios from 'axios';
import { storage } from '../storage';
import { getPlanLimits, type PlanType } from '../shared/plan-limits';
import QRCode from 'qrcode';
import { pushNotificationService } from './pushNotificationService';

interface WhatsAppConnection {
  connected: boolean;
  phoneNumber?: string;
  status: string;
  qrCode?: string;
}

/**
 * WhatsAppService — webhook-based implementation.
 *
 * The direct Baileys library (@whiskeysockets/baileys) is not available in this
 * environment. WhatsApp connectivity is handled via the Whapi.cloud API:
 *   - Incoming messages arrive at POST /api/whatsapp/webhook
 *   - Outgoing messages are sent via the WHAPI_TOKEN + WHAPI_URL env vars
 *   - Connection status / QR codes are fetched from the Whapi API
 */
export class WhatsAppService {
  private connectionStatuses: Map<string, WhatsAppConnection> = new Map();

  constructor() {
    console.log('🚀 WhatsAppService (webhook mode) inicializado');
  }

  private get whapiUrl(): string {
    return process.env.WHAPI_URL || 'https://gate.whapi.cloud';
  }

  private get whapiToken(): string | undefined {
    return process.env.WHAPI_TOKEN;
  }

  async getConnectionStatus(userId: string): Promise<WhatsAppConnection> {
    const cached = this.connectionStatuses.get(userId);
    if (cached) return cached;

    // Try fetching status from Whapi if token is configured
    if (this.whapiToken) {
      try {
        const response = await axios.get(`${this.whapiUrl}/health`, {
          headers: { Authorization: `Bearer ${this.whapiToken}` },
          timeout: 5000,
        });
        const data = response.data as any;
        const isConnected = data?.status === 'active' || data?.device?.status === 'active';
        const phone = data?.device?.phone;
        const status: WhatsAppConnection = {
          connected: isConnected,
          status: isConnected ? 'connected' : 'disconnected',
          phoneNumber: phone,
        };
        this.connectionStatuses.set(userId, status);
        return status;
      } catch {
        // fall through to disconnected
      }
    }

    // Check DB for persisted state
    try {
      const dbConn = await storage.getWhatsappConnection(userId);
      if (dbConn) {
        const status: WhatsAppConnection = {
          connected: dbConn.isConnected ?? false,
          status: dbConn.isConnected ? 'connected' : 'disconnected',
          phoneNumber: dbConn.phoneNumber ?? undefined,
          qrCode: dbConn.qrCode ?? undefined,
        };
        this.connectionStatuses.set(userId, status);
        return status;
      }
    } catch {}

    return { connected: false, status: 'disconnected' };
  }

  async getQRCode(userId: string): Promise<string> {
    const status = this.connectionStatuses.get(userId);
    if (status?.connected) return '';

    if (!this.whapiToken) {
      console.warn('⚠️ WHAPI_TOKEN não configurado. Configure para receber QR code real.');
      return '';
    }

    try {
      const response = await axios.get(`${this.whapiUrl}/device/qr`, {
        headers: { Authorization: `Bearer ${this.whapiToken}` },
        timeout: 10000,
      });
      const data = response.data as any;
      const qrData = data?.qr || data?.qrCode || data?.code;
      if (qrData) {
        const qrBase64 = qrData.startsWith('data:') ? qrData : await QRCode.toDataURL(qrData);
        this.connectionStatuses.set(userId, {
          connected: false,
          status: 'qr_ready',
          qrCode: qrBase64,
        });
        return qrBase64;
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar QR code do Whapi:', err?.message || err);
    }

    return '';
  }

  async sendMessage(
    phoneNumber: string,
    message: string,
    userId: string = 'default-user',
    mediaUrl?: string,
    mediaFileName?: string,
    location?: { latitude: number; longitude: number; address: string },
    quoted?: any,
  ): Promise<boolean> {
    if (!this.whapiToken) {
      console.warn('⚠️ WHAPI_TOKEN não configurado. Mensagem não enviada para:', phoneNumber);
      return false;
    }

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const to = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

      let payload: any;

      if (location) {
        payload = {
          to,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.address,
          },
        };
        await axios.post(`${this.whapiUrl}/messages/location`, payload, {
          headers: { Authorization: `Bearer ${this.whapiToken}` },
        });
      } else if (mediaUrl) {
        const cleanUrl = mediaUrl.replace(/^(video:|audio:|doc:)/, '');
        if (mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) || mediaUrl.startsWith('data:image')) {
          payload = { to, media: cleanUrl, caption: message };
          await axios.post(`${this.whapiUrl}/messages/image`, payload, {
            headers: { Authorization: `Bearer ${this.whapiToken}` },
          });
        } else if (mediaUrl.match(/\.(mp4|avi|mov)$/i) || mediaUrl.startsWith('video:')) {
          payload = { to, media: cleanUrl, caption: message };
          await axios.post(`${this.whapiUrl}/messages/video`, payload, {
            headers: { Authorization: `Bearer ${this.whapiToken}` },
          });
        } else if (mediaUrl.match(/\.(mp3|wav|ogg)$/i) || mediaUrl.startsWith('audio:')) {
          payload = { to, media: cleanUrl };
          await axios.post(`${this.whapiUrl}/messages/audio`, payload, {
            headers: { Authorization: `Bearer ${this.whapiToken}` },
          });
        } else {
          payload = { to, media: cleanUrl, caption: message, filename: mediaFileName || 'documento' };
          await axios.post(`${this.whapiUrl}/messages/document`, payload, {
            headers: { Authorization: `Bearer ${this.whapiToken}` },
          });
        }
      } else {
        payload = { to, body: message };
        await axios.post(`${this.whapiUrl}/messages/text`, payload, {
          headers: { Authorization: `Bearer ${this.whapiToken}` },
        });
      }

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem via Whapi:', error?.response?.data || error?.message);
      return false;
    }
  }

  async disconnect(userId: string): Promise<void> {
    this.connectionStatuses.set(userId, { connected: false, status: 'disconnected' });
    try {
      const dbConn = await storage.getWhatsappConnection(userId);
      if (dbConn) {
        await storage.updateWhatsappConnection(dbConn.id, { isConnected: false });
        
        // Enviar notificação push de desconexão
        try {
          await pushNotificationService.sendDisconnectionAlert(
            userId,
            dbConn.phoneNumber ?? undefined
          );
          console.log('📱 Notificação de desconexão enviada para usuário:', userId);
        } catch (notifError) {
          console.error('❌ Erro ao enviar notificação de desconexão:', notifError);
        }
      }
    } catch {}
  }

  async getAntiBanStats() {
    return { messagesThisHour: 0, maxPerHour: 100, queueSize: 0 };
  }
}

export const whatsappService = new WhatsAppService();
