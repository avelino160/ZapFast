@echo off
echo ============================================
echo 🧪 TESTANDO TODOS OS WEBHOOKS
echo ============================================
echo.

set BASE_URL=http://localhost:5000

echo 💳 1. Testando Stripe...
curl -X POST %BASE_URL%/api/webhooks/stripe -H "Content-Type: application/json" -d "{\"type\":\"checkout.session.completed\",\"data\":{\"object\":{\"metadata\":{\"userId\":\"110a8de0-308e-4844-be67-22fbb126ab7e\",\"planType\":\"pro\",\"durationDays\":\"30\"}}}}"
echo.
echo.

echo 💰 2. Testando Mercado Pago...
curl -X POST %BASE_URL%/api/webhooks/mercadopago -H "Content-Type: application/json" -d "{\"type\":\"payment\",\"data\":{\"id\":\"123456\"}}"
echo.
echo.

echo 📧 3. Testando SendGrid...
curl -X POST %BASE_URL%/api/webhooks/sendgrid -H "Content-Type: application/json" -d "[{\"event\":\"delivered\",\"email\":\"test@email.com\",\"timestamp\":1234567890}]"
echo.
echo.

echo 📨 4. Testando Mailgun...
curl -X POST %BASE_URL%/api/webhooks/mailgun -H "Content-Type: application/json" -d "{\"event\":\"delivered\",\"recipient\":\"test@email.com\"}"
echo.
echo.

echo 📞 5. Testando Twilio...
curl -X POST %BASE_URL%/api/webhooks/twilio -d "CallStatus=completed&From=+5511999999999&To=+5511888888888&Direction=inbound&CallSid=CA123abc"
echo.
echo.

echo 🎫 6. Testando HubSpot...
curl -X POST %BASE_URL%/api/webhooks/hubspot -H "Content-Type: application/json" -d "[{\"subscriptionType\":\"contact.creation\",\"objectId\":12345}]"
echo.
echo.

echo 💼 7. Testando Pipedrive...
curl -X POST %BASE_URL%/api/webhooks/pipedrive -H "Content-Type: application/json" -d "{\"event\":\"added.person\",\"current\":{\"name\":\"João Silva\",\"phone\":[{\"value\":\"5511999999999\"}],\"email\":[{\"value\":\"joao@email.com\"}]}}"
echo.
echo.

echo ============================================
echo ✅ TESTES CONCLUÍDOS!
echo ============================================
echo.
echo 📋 Veja os logs do servidor para verificar o resultado
echo 📚 Documentação completa: WEBHOOKS-COMPLETO.md
echo.
pause
