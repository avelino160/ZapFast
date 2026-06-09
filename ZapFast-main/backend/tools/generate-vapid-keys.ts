import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔑 VAPID Keys geradas com sucesso!\n');
console.log('Adicione estas variáveis ao seu arquivo .env:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('\n💡 Essas chaves são usadas para autenticar as notificações push.');
