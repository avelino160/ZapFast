# 🧪 Teste Rápido - Notificações Push

## 🎯 Checklist de 2 Minutos

### ✅ Passo 1: Verificar Service Worker (10 segundos)
Abra no navegador: http://localhost:5000/sw.js

**Resultado esperado:** Código JavaScript (não erro 404)

---

### ✅ Passo 2: Ativar Notificações (30 segundos)
1. Acesse: http://localhost:5000/settings
2. Clique na seção **"Notificações"**
3. Clique no botão **"Ativar Notificações Push"**
4. Aceite a permissão no navegador

**Resultado esperado:** 
- Status muda para **"Ativas ✅"**
- Badge verde aparece

---

### ✅ Passo 3: Testar Notificação (30 segundos)

#### Opção A: Console do Navegador (F12 → Console)
```javascript
fetch('/api/push/test/disconnection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ phoneNumber: '+5511999999999' })
}).then(r => r.json()).then(d => {
  console.log('✅ Resposta:', d);
  if (d.success) alert('✅ Notificação enviada! Verifique seu sistema.');
});
```

#### Opção B: Criar botão de teste temporário

Cole no console do navegador:
```javascript
// Criar botão de teste
const btn = document.createElement('button');
btn.textContent = '🧪 TESTAR NOTIFICAÇÃO';
btn.style = 'position:fixed; top:10px; right:10px; z-index:9999; padding:10px 20px; background:#22c55e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:bold;';
btn.onclick = async () => {
  const res = await fetch('/api/push/test/disconnection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ phoneNumber: '+5511999999999' })
  });
  const data = await res.json();
  alert(data.success ? '✅ Notificação enviada!' : '❌ Erro: ' + data.error);
};
document.body.appendChild(btn);
```

Isso criará um botão verde no canto superior direito da página.

**Resultado esperado:** 
- Uma notificação aparece no seu sistema operacional
- Título: **"⚠️ WhatsApp Desconectado"**
- Mensagem: **"Seu WhatsApp +5511999999999 foi desconectado"**

---

### ✅ Passo 4: Verificar Subscrição (20 segundos)

Cole no console:
```javascript
navigator.serviceWorker.ready
  .then(reg => reg.pushManager.getSubscription())
  .then(sub => {
    if (sub) {
      console.log('✅ SUBSCRITO!');
      console.log('📍 Endpoint:', sub.endpoint);
      console.table({
        'Service Worker': '✅ Registrado',
        'Permissão': Notification.permission,
        'Subscrição': sub ? '✅ Ativa' : '❌ Inativa'
      });
    } else {
      console.log('❌ NÃO SUBSCRITO');
    }
  });
```

**Resultado esperado:**
```
✅ SUBSCRITO!
📍 Endpoint: https://fcm.googleapis.com/fcm/send/...

┌────────────────┬───────────────┐
│    (index)     │    Values     │
├────────────────┼───────────────┤
│ Service Worker │ ✅ Registrado  │
│   Permissão    │   granted     │
│  Subscrição    │  ✅ Ativa     │
└────────────────┴───────────────┘
```

---

## 🎨 Teste Visual Completo

### Teste todos os tipos de notificação:

```javascript
// 1. Desconexão
fetch('/api/push/test/disconnection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ phoneNumber: '+5511999999999' })
});

// Aguarde 3 segundos...

// 2. Renovação
fetch('/api/push/test/renewal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ daysLeft: 7, planType: 'Pro' })
});

// Aguarde 3 segundos...

// 3. Novidade
fetch('/api/push/test/news', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ 
    title: 'Nova Funcionalidade', 
    description: 'Agora você pode agendar mensagens!' 
  })
});
```

**Resultado esperado:** 
3 notificações diferentes aparecem no seu sistema.

---

## 🐛 Se Algo Não Funcionar

### ❌ Erro: "Failed to register"
```javascript
// Desregistrar e tentar novamente
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  location.reload();
});
```

### ❌ Permissão negada
1. Clique no cadeado na barra de endereço
2. Notificações → Permitir
3. Recarregue a página

### ❌ Botão não aparece
- Faça login primeiro
- Vá para Settings → Notificações
- Se não aparecer, limpe cache (Ctrl+Shift+Delete)

---

## 📊 Logs de Debug

Abra o console e cole:
```javascript
// Ativar logs detalhados
localStorage.setItem('debug', 'push:*');

// Ver status completo
(async () => {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  
  console.table({
    'Service Worker': reg.active ? '✅ Ativo' : '❌ Inativo',
    'Permissão': Notification.permission,
    'Subscrição': sub ? '✅ Sim' : '❌ Não',
    'Endpoint': sub ? sub.endpoint.substring(0, 50) + '...' : 'N/A'
  });
})();
```

---

## ✅ Resultado Final Esperado

Depois de seguir todos os passos:

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Sistema de Notificações Push FUNCIONANDO                │
├─────────────────────────────────────────────────────────────┤
│  Service Worker:    ✅ Registrado e ativo                   │
│  Permissão:         ✅ Concedida (granted)                  │
│  Subscrição:        ✅ Ativa no banco de dados              │
│  Notificações:      ✅ Chegando no dispositivo              │
│  Cliques:           ✅ Redirecionando corretamente          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Teste de Aceitação

Execute este script final:
```javascript
(async function testeCompleto() {
  console.log('🧪 Iniciando teste completo...\n');
  
  // 1. Service Worker
  const reg = await navigator.serviceWorker.ready;
  console.log(reg.active ? '✅ Service Worker ativo' : '❌ Service Worker inativo');
  
  // 2. Permissão
  console.log(Notification.permission === 'granted' ? '✅ Permissão concedida' : '❌ Permissão negada');
  
  // 3. Subscrição
  const sub = await reg.pushManager.getSubscription();
  console.log(sub ? '✅ Subscrição ativa' : '❌ Sem subscrição');
  
  // 4. Testar envio
  if (sub) {
    console.log('\n📤 Enviando notificação de teste...');
    const res = await fetch('/api/push/test/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        title: 'Teste Completo', 
        description: 'Sistema funcionando perfeitamente!' 
      })
    });
    const data = await res.json();
    console.log(data.success ? '✅ Notificação enviada!' : '❌ Erro ao enviar');
    
    if (data.success) {
      console.log('\n🎉 TESTE COMPLETO: TUDO FUNCIONANDO! 🎉');
      console.log('Verifique se a notificação apareceu no seu sistema.');
    }
  }
})();
```

**Resultado esperado:**
```
🧪 Iniciando teste completo...

✅ Service Worker ativo
✅ Permissão concedida
✅ Subscrição ativa

📤 Enviando notificação de teste...
✅ Notificação enviada!

🎉 TESTE COMPLETO: TUDO FUNCIONANDO! 🎉
Verifique se a notificação apareceu no seu sistema.
```

---

## 🚀 Próximos Passos

Após confirmar que tudo funciona:

1. **Integrar com eventos reais**
   - WhatsApp desconexão (já integrado)
   - Verificação de expiração de plano
   - Novos contatos/mensagens

2. **Criar painel admin**
   - Enviar broadcasts
   - Ver histórico
   - Analytics

3. **Produção**
   - Gerar novas VAPID keys
   - Configurar HTTPS
   - Rate limiting

---

**Tempo total de teste: ~2 minutos** ⏱️

Se tudo funcionar, o sistema está **100% operacional**! ✅
