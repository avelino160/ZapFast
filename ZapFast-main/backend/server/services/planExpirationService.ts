import { storage } from '../storage';
import { pushNotificationService } from './pushNotificationService';

/**
 * Serviço para verificar expiração de planos e enviar notificações
 */
class PlanExpirationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Iniciar verificação periódica de planos expirando
   * @param intervalHours - Intervalo em horas entre verificações (padrão: 24h)
   */
  start(intervalHours: number = 24) {
    if (this.isRunning) {
      console.log('⚠️ Serviço de verificação de planos já está rodando');
      return;
    }

    console.log(`🔔 Iniciando serviço de verificação de planos (a cada ${intervalHours}h)`);
    
    // Executar imediatamente na primeira vez
    this.checkExpiringPlans();

    // Depois executar no intervalo especificado
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.checkExpiringPlans();
    }, intervalMs);

    this.isRunning = true;
  }

  /**
   * Parar verificação periódica
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Serviço de verificação de planos parado');
    }
  }

  /**
   * Verificar planos expirando e enviar notificações
   */
  async checkExpiringPlans() {
    try {
      console.log('🔍 Verificando planos expirando...');
      
      const users = await storage.getAllUsers();
      const now = new Date();
      let notificationsSent = 0;

      for (const user of users) {
        // Ignorar usuários bloqueados ou sem plano
        if (user.isBlocked || !user.planExpiresAt) {
          continue;
        }

        // Calcular dias restantes
        const expiresAt = new Date(user.planExpiresAt);
        const diffTime = expiresAt.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Enviar notificação se faltam 7, 5, 3, 2 ou 1 dia
        const alertDays = [7, 5, 3, 2, 1];
        
        if (alertDays.includes(daysLeft) && daysLeft > 0) {
          console.log(`📅 Plano de ${user.email} expira em ${daysLeft} dias`);
          
          try {
            await pushNotificationService.sendRenewalWarning(
              user.id,
              daysLeft,
              user.planType || 'básico'
            );
            
            notificationsSent++;
            console.log(`✅ Notificação enviada para ${user.email}`);
          } catch (error) {
            console.error(`❌ Erro ao enviar notificação para ${user.email}:`, error);
          }
        }

        // Se expirou hoje, bloquear usuário
        if (daysLeft <= 0) {
          console.log(`⚠️ Plano de ${user.email} expirou! Bloqueando...`);
          
          try {
            await storage.blockUser(user.id);
            console.log(`🔒 Usuário ${user.email} bloqueado`);
            
            // Enviar notificação de expiração
            await pushNotificationService.sendToUser(user.id, {
              title: '❌ Plano Expirado',
              body: 'Seu plano expirou. Renove agora para continuar usando!',
              url: '/settings',
              tag: 'plan-expired',
              requireInteraction: true,
            });
          } catch (error) {
            console.error(`❌ Erro ao bloquear ${user.email}:`, error);
          }
        }
      }

      console.log(`✅ Verificação concluída. ${notificationsSent} notificações enviadas.`);
    } catch (error) {
      console.error('❌ Erro ao verificar planos expirando:', error);
    }
  }

  /**
   * Verificar status do serviço
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null,
    };
  }
}

export const planExpirationService = new PlanExpirationService();
