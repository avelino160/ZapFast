# 🧪 Guia de Teste - Sistema de Login

## 🎯 Objetivo
Validar que o sistema de login está funcionando corretamente após as correções.

---

## 📋 Pré-requisitos

- [x] Node.js instalado
- [x] Banco de dados Neon configurado
- [x] Arquivo `.env` com `DATABASE_URL`
- [x] Script `setup-auth.ts` executado

---

## 🚀 Passo a Passo

### 1️⃣ Verificar Banco de Dados

```bash
npx tsx setup-auth.ts
```

**Resultado Esperado:**
```
✅ Coluna "password" verificada!
📊 Usuários existentes: 1
✨ Configuração de autenticação concluída com sucesso!
```

---

### 2️⃣ Iniciar o Servidor

```bash
npm run dev
```

**Resultado Esperado:**
```
serving on port 5000
```

---

### 3️⃣ Testar Login via API

#### Opção A: Usando cURL (Terminal)

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@zapfast.com\",\"password\":\"admin123\"}" ^
  -c cookies.txt
```

#### Opção B: Usando PowerShell

```powershell
$body = @{
    email = "admin@zapfast.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -SessionVariable session
```

#### Opção C: Usando Navegador (DevTools Console)

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@zapfast.com',
    password: 'admin123'
  }),
  credentials: 'include' // IMPORTANTE: Inclui cookies
})
.then(r => r.json())
.then(data => console.log(data));
```

**Resultado Esperado:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "admin@zapfast.com",
    "firstName": "Admin",
    "lastName": "ZapFast"
  }
}
```

---

### 4️⃣ Verificar Sessão

#### Terminal:
```bash
curl http://localhost:5000/api/auth/me -b cookies.txt
```

#### PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
  -WebSession $session
```

#### Navegador (após login):
```javascript
fetch('http://localhost:5000/api/auth/me', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

**Resultado Esperado:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "admin@zapfast.com",
    "firstName": "Admin",
    "lastName": "ZapFast",
    "planType": "pro",
    "planExpiresAt": null,
    "isBlocked": false
  }
}
```

---

### 5️⃣ Testar Rota Protegida

#### Terminal:
```bash
curl http://localhost:5000/api/funnels -b cookies.txt
```

#### PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/funnels" `
  -WebSession $session
```

#### Navegador:
```javascript
fetch('http://localhost:5000/api/funnels', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

**Resultado Esperado:**
```json
[
  // Array de funis (pode estar vazio)
]
```

**Não deve retornar:** `401 Unauthorized`

---

### 6️⃣ Testar Acesso Sem Login

#### Limpar cookies primeiro:
```bash
# Terminal
del cookies.txt

# PowerShell
Remove-Variable session

# Navegador
// Limpar cookies no DevTools → Application → Cookies
```

#### Tentar acessar rota protegida:
```bash
curl http://localhost:5000/api/funnels
```

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "Autenticação necessária. Faça login primeiro."
}
```

**Status Code:** `401 Unauthorized`

---

### 7️⃣ Testar Logout

#### Terminal:
```bash
curl -X POST http://localhost:5000/api/auth/logout -b cookies.txt
```

#### PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" `
  -Method POST `
  -WebSession $session
```

#### Navegador:
```javascript
fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

**Resultado Esperado:**
```json
{
  "success": true
}
```

---

### 8️⃣ Verificar Sessão Destruída

Após logout, tentar acessar `/api/auth/me`:

```bash
curl http://localhost:5000/api/auth/me -b cookies.txt
```

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "Não autenticado"
}
```

---

## ✅ Checklist de Validação

Use este checklist para garantir que tudo está funcionando:

- [ ] ✅ Setup executado sem erros
- [ ] ✅ Servidor iniciou na porta 5000
- [ ] ✅ Login bem-sucedido com credenciais corretas
- [ ] ✅ Login falha com senha incorreta
- [ ] ✅ `/api/auth/me` retorna dados do usuário após login
- [ ] ✅ Rotas protegidas funcionam após login (`/api/funnels`, `/api/contacts`)
- [ ] ✅ Rotas protegidas retornam 401 sem login
- [ ] ✅ Logout funciona corretamente
- [ ] ✅ Após logout, sessão é invalidada

---

## 🐛 Problemas Comuns

### Problema: "Cannot connect to database"
**Solução:** Verifique `DATABASE_URL` no arquivo `.env`

### Problema: Login funciona mas rotas protegidas retornam 401
**Solução:** Certifique-se de incluir `credentials: 'include'` nas requisições

### Problema: "Usuário sem senha cadastrada"
**Solução:** Execute `npx tsx setup-auth.ts` novamente

### Problema: Cookies não são salvos
**Solução:** 
- No navegador: Verifique configurações de privacidade
- Em API: Use `credentials: 'include'` ou `-b cookies.txt`

---

## 📊 Logs Esperados no Servidor

Ao fazer login, você deve ver:

```
POST /api/auth/login 200 in 245ms :: {"success":true,"user":{...}}
🔐 [SESSION] User xxx-xxx-xxx - GET /api/auth/me
GET /api/auth/me 200 in 12ms :: {"success":true,"user":{...}}
🔐 [SESSION] User xxx-xxx-xxx - GET /api/funnels
GET /api/funnels 200 in 34ms :: [{...}]
```

Ao tentar acessar sem login:

```
❌ [AUTH] Tentativa de acesso sem autenticação
GET /api/funnels 401 in 2ms :: {"success":false,"error":"Autenticação necessária..."}
```

---

## 🎉 Sucesso!

Se todos os testes passaram, o sistema de login está funcionando perfeitamente! 🚀

### Próximos Passos:

1. **Testar no Frontend** - Integrar com interface de login
2. **Criar Mais Usuários** - Testar com múltiplos usuários
3. **Testar Registro** - Criar novos usuários via `POST /api/auth/register`

---

## 📞 Suporte

Se algum teste falhar:

1. Verifique os logs do servidor
2. Execute `npx tsx setup-auth.ts` novamente
3. Reinicie o servidor
4. Limpe cookies/cache do navegador
5. Consulte `CORRECOES-LOGIN.md` para detalhes técnicos

---

**Última atualização:** 08/06/2026  
**Status dos Testes:** ✅ Todos validados
