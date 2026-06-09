import { useState, useEffect, useCallback } from 'react';

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported] = useState<boolean>(() => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  });
  
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar permissão e subscrição existente
  useEffect(() => {
    if (!isSupported) return;

    // Verificar permissão atual
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Verificar se já está subscrito
    checkSubscription();
  }, [isSupported]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(subscription !== null);
    } catch (err) {
      console.error('Erro ao verificar subscrição:', err);
    }
  };

  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
    try {
      // Verificar se já existe uma registration
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        console.log('🔄 Registrando Service Worker...');
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          type: 'classic',
        });
        console.log('✅ Service Worker registrado:', registration);
      } else {
        console.log('✅ Service Worker já registrado:', registration);
      }
      
      // Aguardar o service worker estar pronto
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker está pronto');
      
      return registration;
    } catch (err: any) {
      console.error('❌ Erro ao registrar Service Worker:', err);
      throw new Error(`Falha ao registrar Service Worker: ${err.message}`);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Notificações push não são suportadas neste navegador');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        throw new Error('Permissão negada para notificações');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar permissão');
      console.error('Erro ao solicitar permissão:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Notificações push não são suportadas');
      return;
    }

    if (permission !== 'granted') {
      await requestPermission();
      if (permission !== 'granted') return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Registrar service worker
      const registration = await registerServiceWorker();

      // Obter VAPID public key do servidor
      const vapidResponse = await fetch('/api/push/vapid-public-key');
      if (!vapidResponse.ok) {
        throw new Error('Falha ao obter chave pública');
      }

      const { publicKey } = await vapidResponse.json();
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Subscrever para push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Enviar subscrição para o servidor
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar subscrição no servidor');
      }

      setIsSubscribed(true);
      console.log('✅ Subscrição registrada com sucesso');
    } catch (err: any) {
      setError(err.message || 'Erro ao subscrever para notificações');
      console.error('Erro ao subscrever:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;

        // Remover subscrição do navegador
        await subscription.unsubscribe();

        // Remover subscrição do servidor
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ endpoint }),
        });

        setIsSubscribed(false);
        console.log('✅ Subscrição removida com sucesso');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar subscrição');
      console.error('Erro ao cancelar subscrição:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
};
