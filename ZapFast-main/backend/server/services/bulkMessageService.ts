import { storage } from '../storage';
import { whatsappService } from './whatsappService';

interface BulkCampaign {
  id: string;
  userId: string;
  name: string;
  message: string;
  mediaUrl?: string;
  recipients: string[]; // contact IDs
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'failed';
  progress: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  settings: {
    delayBetweenMessages: number; // in seconds
    maxRetries: number;
    scheduledAt?: Date;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface BulkMessageJob {
  campaignId: string;
  contactId: string;
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
  retries: number;
  status: 'pending' | 'sent' | 'failed';
}

/**
 * BulkMessageService - Service for managing bulk messaging campaigns
 * 
 * Features:
 * - Queue-based message sending with configurable delays
 * - Automatic retry logic for failed messages
 * - Progress tracking and real-time status updates
 * - Support for text, images, videos, audio, and documents
 * - Variable substitution ({{nome}}, {{email}}, etc.)
 * - Scheduled campaigns
 * - Pause/resume functionality
 */
export class BulkMessageService {
  private activeCampaigns: Map<string, BulkCampaign> = new Map();
  private messageQueues: Map<string, BulkMessageJob[]> = new Map();
  private campaignTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    console.log('📤 BulkMessageService inicializado');
  }

  /**
   * Create a new bulk messaging campaign
   */
  async createCampaign(
    userId: string,
    name: string,
    message: string,
    recipientIds: string[],
    settings: {
      delayBetweenMessages?: number;
      maxRetries?: number;
      scheduledAt?: Date;
    } = {},
    mediaUrl?: string
  ): Promise<BulkCampaign> {
    const campaignId = `bulk_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Get recipient contacts
    const contacts = await Promise.all(
      recipientIds.map(id => storage.getContact(id, userId))
    );
    const validContacts = contacts.filter(c => c !== null);

    const campaign: BulkCampaign = {
      id: campaignId,
      userId,
      name,
      message,
      mediaUrl,
      recipients: recipientIds,
      status: settings.scheduledAt ? 'scheduled' : 'draft',
      progress: {
        total: validContacts.length,
        sent: 0,
        failed: 0,
        pending: validContacts.length,
      },
      settings: {
        delayBetweenMessages: settings.delayBetweenMessages || 3,
        maxRetries: settings.maxRetries || 3,
        scheduledAt: settings.scheduledAt,
      },
      createdAt: new Date(),
    };

    // Create message queue
    const queue: BulkMessageJob[] = validContacts.map(contact => ({
      campaignId,
      contactId: contact!.id,
      phoneNumber: contact!.phoneNumber,
      message: this.replaceVariables(message, contact!),
      mediaUrl,
      retries: 0,
      status: 'pending',
    }));

    this.activeCampaigns.set(campaignId, campaign);
    this.messageQueues.set(campaignId, queue);

    console.log(`📤 Campanha criada: ${campaignId} (${validContacts.length} destinatários)`);

    // If scheduled, set up timer
    if (settings.scheduledAt) {
      const delay = settings.scheduledAt.getTime() - Date.now();
      if (delay > 0) {
        const timer = setTimeout(() => {
          this.startCampaign(campaignId);
        }, delay);
        this.campaignTimers.set(campaignId, timer);
        console.log(`⏰ Campanha agendada para: ${settings.scheduledAt.toLocaleString('pt-BR')}`);
      }
    }

    return campaign;
  }

  /**
   * Start sending messages for a campaign
   */
  async startCampaign(campaignId: string): Promise<boolean> {
    const campaign = this.activeCampaigns.get(campaignId);
    const queue = this.messageQueues.get(campaignId);

    if (!campaign || !queue) {
      console.error(`❌ Campanha não encontrada: ${campaignId}`);
      return false;
    }

    if (campaign.status === 'sending') {
      console.warn(`⚠️ Campanha já está sendo enviada: ${campaignId}`);
      return false;
    }

    campaign.status = 'sending';
    campaign.startedAt = new Date();
    console.log(`🚀 Iniciando campanha: ${campaign.name} (${queue.length} mensagens)`);

    // Process queue
    this.processQueue(campaignId);

    return true;
  }

  /**
   * Process message queue with delays
   */
  private async processQueue(campaignId: string): Promise<void> {
    const campaign = this.activeCampaigns.get(campaignId);
    const queue = this.messageQueues.get(campaignId);

    if (!campaign || !queue) return;

    while (queue.length > 0 && campaign.status === 'sending') {
      const job = queue[0];

      try {
        // Send message
        const success = await whatsappService.sendMessage(
          job.phoneNumber,
          job.message,
          campaign.userId,
          job.mediaUrl
        );

        if (success) {
          job.status = 'sent';
          campaign.progress.sent++;
          campaign.progress.pending--;
          queue.shift(); // Remove from queue

          // Save message to database
          await storage.createMessage({
            userId: campaign.userId,
            contactId: job.contactId,
            type: job.mediaUrl ? 'image' : 'text',
            content: job.message,
            mediaUrl: job.mediaUrl,
            status: 'sent',
            sentAt: new Date(),
          });

          console.log(`✅ Mensagem enviada: ${job.phoneNumber} (${campaign.progress.sent}/${campaign.progress.total})`);
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${job.phoneNumber}:`, error);
        
        // Retry logic
        job.retries++;
        if (job.retries < campaign.settings.maxRetries) {
          console.log(`🔄 Tentativa ${job.retries}/${campaign.settings.maxRetries} para ${job.phoneNumber}`);
          // Move to end of queue for retry
          queue.push(queue.shift()!);
        } else {
          // Max retries reached
          job.status = 'failed';
          campaign.progress.failed++;
          campaign.progress.pending--;
          queue.shift();
          console.error(`💥 Falha definitiva após ${job.retries} tentativas: ${job.phoneNumber}`);
        }
      }

      // Delay between messages to avoid WhatsApp ban
      if (queue.length > 0 && campaign.status === 'sending') {
        await this.delay(campaign.settings.delayBetweenMessages * 1000);
      }
    }

    // Campaign completed
    if (queue.length === 0) {
      campaign.status = 'completed';
      campaign.completedAt = new Date();
      console.log(`🎉 Campanha concluída: ${campaign.name}`);
      console.log(`   Enviadas: ${campaign.progress.sent}`);
      console.log(`   Falharam: ${campaign.progress.failed}`);
    }
  }

  /**
   * Pause a running campaign
   */
  pauseCampaign(campaignId: string): boolean {
    const campaign = this.activeCampaigns.get(campaignId);
    
    if (!campaign) return false;
    
    if (campaign.status === 'sending') {
      campaign.status = 'paused';
      console.log(`⏸️ Campanha pausada: ${campaign.name}`);
      return true;
    }
    
    return false;
  }

  /**
   * Resume a paused campaign
   */
  resumeCampaign(campaignId: string): boolean {
    const campaign = this.activeCampaigns.get(campaignId);
    
    if (!campaign) return false;
    
    if (campaign.status === 'paused') {
      campaign.status = 'sending';
      console.log(`▶️ Campanha retomada: ${campaign.name}`);
      this.processQueue(campaignId);
      return true;
    }
    
    return false;
  }

  /**
   * Cancel a campaign
   */
  cancelCampaign(campaignId: string): boolean {
    const campaign = this.activeCampaigns.get(campaignId);
    
    if (!campaign) return false;

    // Clear scheduled timer if exists
    const timer = this.campaignTimers.get(campaignId);
    if (timer) {
      clearTimeout(timer);
      this.campaignTimers.delete(campaignId);
    }

    campaign.status = 'failed';
    campaign.completedAt = new Date();
    console.log(`🛑 Campanha cancelada: ${campaign.name}`);
    
    return true;
  }

  /**
   * Get campaign status and progress
   */
  getCampaignStatus(campaignId: string): BulkCampaign | null {
    return this.activeCampaigns.get(campaignId) || null;
  }

  /**
   * Get all campaigns for a user
   */
  getUserCampaigns(userId: string): BulkCampaign[] {
    return Array.from(this.activeCampaigns.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Convert @ variables to {{}} format
   * Converts @nome to {{nome}}, @email to {{email}}, etc.
   */
  private convertAtToDoubleBraces(text: string): string {
    return text
      .replace(/@nome/g, '{{nome}}')
      .replace(/@email/g, '{{email}}')
      .replace(/@telefone/g, '{{telefone}}');
  }

  /**
   * Replace variables in message template
   * Supports: {{nome}}, {{email}}, {{telefone}} and @nome, @email, @telefone
   */
  private replaceVariables(template: string, contact: any): string {
    // First convert @ to {{}}
    const normalizedTemplate = this.convertAtToDoubleBraces(template);
    
    // Then replace with actual values
    return normalizedTemplate
      .replace(/\{\{nome\}\}/gi, contact.name || 'Cliente')
      .replace(/\{\{email\}\}/gi, contact.email || '')
      .replace(/\{\{telefone\}\}/gi, contact.phoneNumber || '');
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up completed campaigns older than 24 hours
   */
  cleanup(): void {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    for (const [id, campaign] of this.activeCampaigns.entries()) {
      if (
        (campaign.status === 'completed' || campaign.status === 'failed') &&
        campaign.completedAt &&
        campaign.completedAt.getTime() < oneDayAgo
      ) {
        this.activeCampaigns.delete(id);
        this.messageQueues.delete(id);
        console.log(`🧹 Campanha removida da memória: ${campaign.name}`);
      }
    }
  }
}

export const bulkMessageService = new BulkMessageService();

// Clean up old campaigns every hour
setInterval(() => {
  bulkMessageService.cleanup();
}, 60 * 60 * 1000);
