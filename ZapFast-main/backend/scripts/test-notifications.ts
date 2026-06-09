import "dotenv/config";

// Simular uma requisição HTTP
async function testNotifications() {
  const baseUrl = 'http://localhost:5000';
  
  // Você precisa pegar o cookie de sessão do navegador
  // Ou podemos enviar diretamente via service
  
  console.log('🧪 Testando notificações push...\n');
  
  // Importar o serviço
  const { pushNotificationService } = await import('./server/services/pushNotificationService.js');
  
  // ID do usuário logado (você pode ver nos logs)
  const userId = '110a8de0-308e-4844-be67-22fbb126ab7e';
  
  try {
    // 1. Teste de Desconexão
    console.log('1️⃣ Enviando notificação de DESCONEXÃO...');
    const result1 = await pushNotificationService.sendDisconnectionAlert(
      userId,
      '+5511999999999'
    );
    console.log('✅ Resultado:', result1);
    
    // Aguardar 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. Teste de Renovação
    console.log('\n2️⃣ Enviando notificação de RENOVAÇÃO...');
    const result2 = await pushNotificationService.sendRenewalWarning(
      userId,
      3,
      'Pro'
    );
    console.log('✅ Resultado:', result2);
    
    // Aguardar 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Teste de Novidade
    console.log('\n3️⃣ Enviando notificação de NOVIDADE...');
    const result3 = await pushNotificationService.sendPlatformNews(
      userId,
      'Nova Funcionalidade',
      'Agora você pode agendar mensagens para envio automático!',
      '/dashboard'
    );
    console.log('✅ Resultado:', result3);
    
    console.log('\n🎉 Teste completo! Verifique as 3 notificações no seu sistema.');
    
  } catch (error) {
    console.error('❌ Erro ao testar notificações:', error);
  }
  
  process.exit(0);
}

testNotifications();
