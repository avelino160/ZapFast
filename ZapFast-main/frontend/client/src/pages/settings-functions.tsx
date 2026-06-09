// Este arquivo contém as funções auxiliares do settings

export const generateApiKey = () => {
  return `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

export const validateWebhookUrl = (url: string) => {
  if (!url.trim()) {
    return { valid: false, error: "Digite uma URL válida" };
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { valid: false, error: "A URL deve começar com http:// ou https://" };
  }
  return { valid: true };
};

export const validatePassword = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) {
    return { valid: false, error: "As senhas não coincidem" };
  }
  if (password.length < 6) {
    return { valid: false, error: "A senha deve ter pelo menos 6 caracteres" };
  }
  return { valid: true };
};
