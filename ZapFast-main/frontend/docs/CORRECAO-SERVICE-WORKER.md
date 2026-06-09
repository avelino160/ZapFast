# ✅ Correção do Service Worker

## 🔧 Problema Identificado
O Service Worker não estava sendo registrado porque o arquivo estava no local errado.

## ✅ Soluções Aplicadas

### 1. **Arquivo Movido para Local Correto**
- ❌ Antes: `public/sw.js` (raiz do projeto)
- ✅ Agora: `client/public/sw.js` (pasta do cliente Vite)

### 2. **Rota Explícita Adicionada**
Adicionei uma rota no servidor Express para servir o Service Worker:

```typescript
app.get('/sw.js', (req, res) => {
  const swPath = join(process.cwd(), 'client', 'public', 'sw.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(swPath);
});
```

### 3. **Hook Melhorado**
Atualizei o hook `usePushNotifications` para:
- Verificar se já existe uma registration
- Adicionar mais logs para debug
- Melhor tratamento de erros

## 🧪 Como Testar

### Passo 1: Verificar se o Service Worker é Servido
Abra no navegador: http://localhost:5000/sw.js

Você deve ver o código JavaScript do Service Worker.

### Passo 2: Abrir o DevTools
1. Pressione F12
2. Vá para a aba **Console**
3. Limpe o console (ícone 🚫)

### Passo 3: Ativar Notificações
1. Vá para **Configurações** → **Notificações**
2. Clique em **"Ativar Notificações Push"**
3. No console, você deve ver:
   ```
   🔄 Registrando Service Worker...
   ✅ Service Worker registrado: [objeto]
   ✅ Service Worker está pronto
   ```

### Passo 4: Verificar Registration (DevTools)
1. No DevTools, vá para **Application**
2. No menu lateral, clique em **Service Workers**
3. Você deve ver:
   - ✅ Status: **Activated**
   - ✅ Source: **/sw.js**
   - ✅ Scope: **/**

### Passo 5: Verificar Subscrição (DevTools)
1. No DevTools, vá para **Application** → **Storage** → **IndexedDB**
2. Ou vá para **Console** e digite:
   ```javascript
   navigator.serviceWorker.ready
     .then(reg => reg.pushManager.getSubscription())
     .then(sub => console.log('Subscrição:', sub))
   ```
3. Você deve ver um objeto com `endpoint`, `keys`, etc.

## 🧪 Testar Notificações

### Teste 1: Via Console do Navegador
```javascript
// Desconexão
fetch('/api/push/test/disconnection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ phoneNumber: '+5511999999999' })
}).then(r => r.json()).then(console.log);
```

### Teste 2: Via curl/Postman
```bash
curl -X POST http://localhost:5000/api/push/test/disconnection \
  -H "Content-Type: application/json" \
  -H "Cookie: zapfast.sid=SEU_SESSION_ID" \
  -d '{"phoneNumber": "+5511999999999"}'
```

### Teste 3: Verificar Logs do Service Worker
1. DevTools → **Application** → **Service Workers**
2. Clique no link **sw.js** para abrir o console do Service Worker
3. Envie uma notificação de teste
4. Você deve ver no console do SW:
   ```
   📬 Push notification recebida: [objeto]
   ```

## 🐛 Troubleshooting

### Erro: "Failed to register service worker"

**Possíveis causas:**

1. **Arquivo não existe**
   - Verifique: http://localhost:5000/sw.js deve retornar código JS
   - Solução: Confirme que `client/public/sw.js` existe

2. **Erro de sintaxe no sw.js**
   - Verifique o console do navegador
   - Solução: Abra `client/public/sw.js` e corrija erros

3. **HTTPS necessário** (apenas em produção)
   - Service Workers só funcionam em HTTPS ou localhost
   - Em localhost: funciona normalmente
   - Em produção: precisa de HTTPS

4. **Service Worker anterior em cache**
   - DevTools → Application → Service Workers
   - Clique em **Unregister**
   - Recarregue a página (Ctrl+F5)

### Erro: "Permission denied"

O usuário negou a permissão de notificações.

**Solução:**
1. No Chrome: Clique no ícone de cadeado na barra de endereço
2. Notificações → Permitir
3. Recarregue a página

### Erro: "Push service unavailable"

O navegador não suporta push notifications.

**Soluções:**
- Use Chrome, Firefox, ou Edge mais recente
- iOS: Adicione o site à Home Screen
- Verifique se está em localhost ou HTTPS

## 📊 Logs Esperados

### No Console do Navegador:
```
🔄 Registrando Service Worker...
✅ Service Worker registrado: ServiceWorkerRegistration {...}
✅ Service Worker está pronto
💾 Salvando subscrição...
✅ Subscrição registrada com sucesso
```

### No Console do Servidor:
```
GET /sw.js 200 in 5ms
POST /api/push/subscribe 200 in 125ms
💾 Salvando subscrição push para usuário: [userId]
✅ Subscrição salva com sucesso
```

### No Console do Service Worker:
```
✅ Service Worker instalado
✅ Service Worker ativado
📬 Push notification recebida: PushEvent {...}
```

## ✅ Checklist Final

Antes de considerar que está funcionando:

- [ ] http://localhost:5000/sw.js retorna código JavaScript
- [ ] DevTools → Application → Service Workers mostra "Activated"
- [ ] Botão "Ativar Notificações" na página de Settings
- [ ] Após clicar, status muda para "Ativas ✅"
- [ ] Console mostra "✅ Subscrição registrada com sucesso"
- [ ] POST para `/api/push/test/disconnection` retorna success:true
- [ ] Notificação aparece no sistema operacional
- [ ] Clicar na notificação abre o navegador

## 🎯 Status Atual

**SISTEMA CORRIGIDO** ✅

Mudanças aplicadas:
- ✅ Service Worker movido para `client/public/sw.js`
- ✅ Rota explícita adicionada no servidor
- ✅ Hook melhorado com logs
- ✅ Servidor reiniciado com sucesso

**Próximo passo:** Testar no navegador seguindo os passos acima.

## 📝 Arquivos Modificados

1. `client/public/sw.js` - Criado no local correto
2. `server/routes.ts` - Adicionada rota para servir sw.js
3. `client/src/hooks/usePushNotifications.ts` - Melhorado com logs
4. `CORRECAO-SERVICE-WORKER.md` - Este arquivo (documentação)

## 🔗 Links Úteis

- Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- Web Push Protocol: https://web.dev/push-notifications-web-push-protocol/

---

**Última atualização:** 08/06/2026 09:09
