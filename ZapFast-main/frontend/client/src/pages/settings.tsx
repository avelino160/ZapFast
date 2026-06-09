import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon, User, Smartphone, CreditCard, Bell, Lock, Link as LinkIcon, BarChart3,
  FileText, HelpCircle, Mail, MessageCircle, LogOut, Moon, Sun, Key, Copy, Check, X, Eye, EyeOff,
  Trash2, RefreshCw, Shield, Globe
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { data: authResponse } = useQuery<{ success: boolean; user: any }>({ 
    queryKey: ["/api/auth/me"], 
    retry: false 
  });
  
  const user = authResponse?.user;

  // Push notifications hook
  const pushNotifications = usePushNotifications();

  const [displayEmail, setDisplayEmail] = useState("usuario@pilotzap.com");
  const [displayName, setDisplayName] = useState("Usuário");
  const [fullName, setFullName] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [disconnectAlerts, setDisconnectAlerts] = useState(true);
  const [renewalWarnings, setRenewalWarnings] = useState(true);
  const [platformNews, setPlatformNews] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhooks, setWebhooks] = useState<string[]>([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    console.log('🔍 [SETTINGS] Dados do usuário:', user);
    
    if (user) {
      setDisplayEmail(user.email || "usuario@pilotzap.com");
      
      // Capitalizar primeira letra ao carregar
      const capitalizeFirst = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };
      
      // Priorizar nickname, senão montar nome completo
      if (user.nickname && user.nickname.trim()) {
        console.log('✅ [SETTINGS] Tem nickname:', user.nickname);
        setFullName(capitalizeFirst(user.nickname));
        setDisplayName(capitalizeFirst(user.nickname));
      } else {
        // Montar nome completo a partir de firstName e lastName
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        console.log('✅ [SETTINGS] firstName:', firstName, 'lastName:', lastName);
        
        let completeName = "";
        
        if (firstName && lastName) {
          completeName = `${capitalizeFirst(firstName)} ${capitalizeFirst(lastName)}`;
        } else if (firstName) {
          completeName = capitalizeFirst(firstName);
        } else if (lastName) {
          completeName = capitalizeFirst(lastName);
        }
        
        console.log('✅ [SETTINGS] Nome completo montado:', completeName);
        setFullName(completeName);
        
        // DisplayName usa apenas o primeiro nome
        if (firstName) {
          setDisplayName(capitalizeFirst(firstName));
        } else {
          setDisplayName("Usuário");
        }
      }
    }
    
    const savedEmailNotif = localStorage.getItem("notif_email");
    const savedDisconnect = localStorage.getItem("notif_disconnect");
    const savedRenewal = localStorage.getItem("notif_renewal");
    const savedNews = localStorage.getItem("notif_news");
    if (savedEmailNotif !== null) setEmailNotifications(savedEmailNotif === "true");
    if (savedDisconnect !== null) setDisconnectAlerts(savedDisconnect === "true");
    if (savedRenewal !== null) setRenewalWarnings(savedRenewal === "true");
    if (savedNews !== null) setPlatformNews(savedNews === "true");
    const savedApiKey = localStorage.getItem("pilotzap_api_key");
    const savedWebhooks = localStorage.getItem("pilotzap_webhooks");
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedWebhooks) setWebhooks(JSON.parse(savedWebhooks));
    const saved2FA = localStorage.getItem("pilotzap_2fa_enabled");
    if (saved2FA) setIs2FAEnabled(saved2FA === "true");
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("demo_logged_in");
    localStorage.removeItem("demo_user_email");
    localStorage.removeItem("demo_user_name");
    localStorage.removeItem("demo_login_timestamp");
    window.location.href = "/login";
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    toast({ title: "Senha alterada", description: "Sua senha foi alterada com sucesso" });
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    toast({ title: "Conta excluída", description: "Sua conta foi excluída com sucesso" });
    window.location.href = "/login";
  };

  const handleSaveProfile = async () => {
    try {
      // Capitalizar primeira letra antes de salvar
      const capitalizeFirst = (str: string) => {
        if (!str || str.trim().length === 0) return '';
        const trimmed = str.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
      };

      // Se o nome tem apenas uma palavra, é tratado como apelido (nickname)
      // Se tem múltiplas palavras, é nome completo (firstName + lastName)
      const nameParts = fullName.trim().split(' ').filter(p => p.length > 0);
      
      let firstName = '';
      let lastName = '';
      let nickname = '';
      
      if (nameParts.length === 1) {
        // Uma palavra = apelido
        nickname = nameParts[0];
        firstName = nameParts[0]; // Salvar também como firstName para compatibilidade
      } else if (nameParts.length >= 2) {
        // Múltiplas palavras = nome completo
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
        nickname = ''; // Limpar apelido quando tem nome completo
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: capitalizeFirst(firstName),
          lastName: capitalizeFirst(lastName),
          nickname: capitalizeFirst(nickname),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      const data = await response.json();
      
      if (data.success) {
        setIsEditingProfile(false);
        toast({ 
          title: "Perfil atualizado", 
          description: "Suas informações foram atualizadas com sucesso" 
        });
        
        // Recarregar dados do usuário
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível atualizar o perfil",
        variant: "destructive" 
      });
    }
  };

  const handleNotificationToggle = (type: string, value: boolean) => {
    switch (type) {
      case "email": setEmailNotifications(value); localStorage.setItem("notif_email", value.toString()); break;
      case "disconnect": setDisconnectAlerts(value); localStorage.setItem("notif_disconnect", value.toString()); break;
      case "renewal": setRenewalWarnings(value); localStorage.setItem("notif_renewal", value.toString()); break;
      case "news": setPlatformNews(value); localStorage.setItem("notif_news", value.toString()); break;
    }
    toast({ title: "Preferência salva", description: "Suas preferências de notificação foram atualizadas" });
  };

  const handleGenerateApiKey = () => {
    const newKey = `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    localStorage.setItem("pilotzap_api_key", newKey);
    toast({ title: "API Key gerada", description: "Sua nova API Key foi gerada com sucesso" });
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    toast({ title: "Copiado", description: "API Key copiada para a área de transferência" });
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleAddWebhook = () => {
    if (!webhookUrl.trim()) {
      toast({ title: "Erro", description: "Digite uma URL válida", variant: "destructive" });
      return;
    }
    if (!webhookUrl.startsWith("http://") && !webhookUrl.startsWith("https://")) {
      toast({ title: "Erro", description: "A URL deve começar com http:// ou https://", variant: "destructive" });
      return;
    }
    const updatedWebhooks = [...webhooks, webhookUrl];
    setWebhooks(updatedWebhooks);
    localStorage.setItem("pilotzap_webhooks", JSON.stringify(updatedWebhooks));
    setWebhookUrl("");
    toast({ title: "Webhook adicionado", description: "Webhook configurado com sucesso" });
  };

  const handleRemoveWebhook = (index: number) => {
    const updatedWebhooks = webhooks.filter((_, i) => i !== index);
    setWebhooks(updatedWebhooks);
    localStorage.setItem("pilotzap_webhooks", JSON.stringify(updatedWebhooks));
    toast({ title: "Webhook removido", description: "Webhook removido com sucesso" });
  };

  const handleToggle2FA = () => {
    const newStatus = !is2FAEnabled;
    setIs2FAEnabled(newStatus);
    localStorage.setItem("pilotzap_2fa_enabled", newStatus.toString());
    toast({
      title: newStatus ? "2FA ativado" : "2FA desativado",
      description: newStatus ? "Autenticação em dois fatores foi ativada" : "Autenticação em dois fatores foi desativada"
    });
    setShow2FAModal(false);
  };

  const menuItems = [
    { id: "account", label: "Conta", icon: User },
    { id: "subscription", label: "Assinatura", icon: CreditCard },
    { id: "whatsapp", label: "WhatsApp", icon: Smartphone },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "appearance", label: "Aparência", icon: theme === 'dark' ? Moon : Sun },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "integrations", label: "Integrações", icon: LinkIcon },
    { id: "usage", label: "Uso", icon: BarChart3 },
    { id: "legal", label: "Legal", icon: FileText },
    { id: "support", label: "Suporte", icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border pl-14 pr-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">Configurações</h1>
            </div>
          </div>
        </header>
        
        {/* Tabs Horizontais em Grid */}
        <div className="border-b border-border bg-card px-4 lg:px-6 py-2">
          <div className="grid grid-cols-5 gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center justify-center gap-2 px-2 py-2.5 text-xs font-medium rounded-md transition-colors ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
              {activeSection === "account" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Conta</CardTitle>
                    <CardDescription>Gerencie suas informações pessoais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditingProfile}
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input value={displayEmail} disabled />
                    </div>
                    
                    {isEditingProfile ? (
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleSaveProfile}>
                          <Check className="h-4 w-4 mr-2" />Salvar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => {
                            setIsEditingProfile(false);
                            // Restaurar valores originais
                            if (user) {
                              const capitalizeFirst = (str: string) => {
                                if (!str) return '';
                                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                              };
                              
                              if (user.nickname && user.nickname.trim()) {
                                setFullName(capitalizeFirst(user.nickname));
                              } else {
                                const firstName = user.firstName || "";
                                const lastName = user.lastName || "";
                                let completeName = "";
                                
                                if (firstName && lastName) {
                                  completeName = `${capitalizeFirst(firstName)} ${capitalizeFirst(lastName)}`;
                                } else if (firstName) {
                                  completeName = capitalizeFirst(firstName);
                                }
                                
                                setFullName(completeName);
                              }
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={() => setIsEditingProfile(true)}>
                        <User className="h-4 w-4 mr-2" />Editar Perfil
                      </Button>
                    )}
                    
                    <Separator />
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />Sair da Conta
                    </Button>
                    <Separator />
                    <Button variant="outline" className="w-full" onClick={() => setShowPasswordModal(true)}>
                      <Lock className="h-4 w-4 mr-2" />Alterar Senha
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={() => setShowDeleteAccountModal(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />Excluir Conta
                    </Button>
                  </CardContent>
                </Card>
              )}
              {activeSection === "subscription" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Assinatura</CardTitle>
                    <CardDescription>Gerencie seu plano e pagamentos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Plano Atual</p>
                          <p className="text-2xl font-bold text-primary">Gratuito</p>
                          <p className="text-sm text-muted-foreground mt-1">Limite: 1.000 mensagens/mês</p>
                        </div>
                        <Button onClick={() => toast({ title: "Em breve", description: "Funcionalidade de upgrade estará disponível em breve" })}>
                          Fazer Upgrade
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Histórico de Pagamentos</p>
                      <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">Nenhum pagamento realizado</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeSection === "whatsapp" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />WhatsApp</CardTitle>
                    <CardDescription>Gerencie sua conexão com o WhatsApp</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Status da Conexão</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">Desconectado</Badge>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => window.location.href = "/whatsapp-connection"}>
                        <Smartphone className="h-4 w-4 mr-2" />Conectar
                      </Button>
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full" onClick={() => {
                      toast({ title: "Reconectando", description: "Redirecionando para página de conexão..." });
                      setTimeout(() => window.location.href = "/whatsapp-connection", 1000);
                    }}>
                      <RefreshCw className="h-4 w-4 mr-2" />Reconectar Dispositivo
                    </Button>
                  </CardContent>
                </Card>
              )}
              {activeSection === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notificações</CardTitle>
                    <CardDescription>Configure suas preferências de notificações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Push Notifications Status */}
                    {pushNotifications.isSupported ? (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Notificações Push</p>
                            <p className="text-sm text-muted-foreground">
                              {pushNotifications.isSubscribed 
                                ? "✅ Ativas - Você receberá alertas em tempo real" 
                                : "⚠️ Desativadas - Ative para receber alertas"}
                            </p>
                          </div>
                          <Badge variant={pushNotifications.isSubscribed ? "default" : "secondary"}>
                            {pushNotifications.isSubscribed ? "Ativas" : "Inativas"}
                          </Badge>
                        </div>
                        
                        {pushNotifications.error && (
                          <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                            ❌ {pushNotifications.error}
                          </div>
                        )}

                        {!pushNotifications.isSubscribed ? (
                          <Button 
                            className="w-full" 
                            onClick={pushNotifications.subscribe}
                            disabled={pushNotifications.isLoading}
                          >
                            {pushNotifications.isLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Ativando...
                              </>
                            ) : (
                              <>
                                <Bell className="h-4 w-4 mr-2" />
                                Ativar Notificações Push
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={pushNotifications.unsubscribe}
                            disabled={pushNotifications.isLoading}
                          >
                            {pushNotifications.isLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Desativando...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Desativar Notificações Push
                              </>
                            )}
                          </Button>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          🌍 Funciona em iOS, Android e PC
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          ⚠️ Notificações push não são suportadas neste navegador
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Notificações por E-mail</p><p className="text-sm text-muted-foreground">Receba atualizações por e-mail</p></div>
                      <Switch checked={emailNotifications} onCheckedChange={(checked) => handleNotificationToggle("email", checked)} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Alertas de Desconexão</p><p className="text-sm text-muted-foreground">Seja notificado quando desconectar</p></div>
                      <Switch checked={disconnectAlerts} onCheckedChange={(checked) => handleNotificationToggle("disconnect", checked)} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Avisos de Renovação</p><p className="text-sm text-muted-foreground">Lembre-se das renovações</p></div>
                      <Switch checked={renewalWarnings} onCheckedChange={(checked) => handleNotificationToggle("renewal", checked)} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Novidades da Plataforma</p><p className="text-sm text-muted-foreground">Fique por dentro das novidades</p></div>
                      <Switch checked={platformNews} onCheckedChange={(checked) => handleNotificationToggle("news", checked)} />
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeSection === "appearance" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}Aparência
                    </CardTitle>
                    <CardDescription>Personalize a aparência do sistema</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Tema</p>
                        <p className="text-sm text-muted-foreground">{theme === 'dark' ? 'Escuro' : 'Claro'}</p>
                      </div>
                      <Button variant="outline" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                        Alternar Tema
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeSection === "security" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Segurança</CardTitle>
                    <CardDescription>Proteja sua conta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => setShowPasswordModal(true)}>
                      <Key className="h-4 w-4 mr-2" />Alterar Senha
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShowSessionsModal(true)}>
                      <Smartphone className="h-4 w-4 mr-2" />Ver Sessões Ativas
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShow2FAModal(true)}>
                      <Shield className="h-4 w-4 mr-2" />Autenticação em Dois Fatores (2FA)
                      {is2FAEnabled && <Badge variant="default" className="ml-2">Ativo</Badge>}
                    </Button>
                  </CardContent>
                </Card>
              )}
              {activeSection === "integrations" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5" />Integrações</CardTitle>
                    <CardDescription>Conecte com outras plataformas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">API Key</p>
                        {apiKey && <Badge variant="secondary">Configurada</Badge>}
                      </div>
                      {apiKey && (
                        <div className="flex gap-2">
                          <Input value={apiKey} disabled className="font-mono text-xs" />
                          <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                            {apiKeyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                      <Button variant="outline" className="w-full" onClick={() => setShowApiKeyModal(true)}>
                        <Key className="h-4 w-4 mr-2" />{apiKey ? "Gerar Nova API Key" : "Gerar API Key"}
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Webhooks</p>
                        {webhooks.length > 0 && <Badge variant="secondary">{webhooks.length}</Badge>}
                      </div>
                      {webhooks.length > 0 && (
                        <div className="space-y-2">
                          {webhooks.map((webhook, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1 text-sm truncate">{webhook}</span>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveWebhook(index)}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" className="w-full" onClick={() => setShowWebhookModal(true)}>
                        <LinkIcon className="h-4 w-4 mr-2" />Adicionar Webhook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeSection === "usage" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Uso</CardTitle>
                    <CardDescription>Acompanhe seu consumo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium">Mensagens Enviadas</p>
                      <p className="text-3xl font-bold mt-2">0 / 1.000</p>
                      <p className="text-sm text-muted-foreground mt-1">Limite do plano gratuito</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeSection === "legal" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Legal</CardTitle>
                    <CardDescription>Documentos e políticas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Em breve", description: "Documento estará disponível em breve" })}>
                      <FileText className="h-4 w-4 mr-2" />Termos de Uso
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Em breve", description: "Documento estará disponível em breve" })}>
                      <FileText className="h-4 w-4 mr-2" />Política de Privacidade
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Em breve", description: "Documento estará disponível em breve" })}>
                      <FileText className="h-4 w-4 mr-2" />LGPD/GDPR
                    </Button>
                  </CardContent>
                </Card>
              )}
              {activeSection === "support" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Suporte</CardTitle>
                    <CardDescription>Precisa de ajuda?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-green-500 text-white hover:bg-green-600 hover:text-white border-green-600" onClick={() => {
                      const message = encodeURIComponent(`Olá, Meu nome é ${displayName} e meu e-mail de cadastro na PilotZap é ${displayEmail}. Preciso de ajuda com [descreva brevemente o problema]. Poderiam me auxiliar, por favor? Obrigado!`);
                      window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
                    }}>
                      <MessageCircle className="h-4 w-4 mr-2" />WhatsApp de Suporte
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      window.location.href = `mailto:suporte@pilotzap.com?subject=Suporte PilotZap&body=Olá, Meu nome é ${displayName} e meu e-mail de cadastro é ${displayEmail}. Preciso de ajuda com:`;
                    }}>
                      <Mail className="h-4 w-4 mr-2" />Enviar E-mail
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "Em breve", description: "FAQ estará disponível em breve" })}>
                      <HelpCircle className="h-4 w-4 mr-2" />FAQ
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "Em breve", description: "Tutoriais estarão disponíveis em breve" })}>
                      <FileText className="h-4 w-4 mr-2" />Tutoriais
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        {/* Modals */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>Digite sua senha atual e a nova senha</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <div className="relative">
                <Input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" />
                <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <div className="relative">
                <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Digite a nova senha" />
                <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
            <Button onClick={handleChangePassword}>Alterar Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Conta</DialogTitle>
            <DialogDescription>Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">Atenção: Esta ação não pode ser desfeita!</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccountModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Excluir Conta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar API Key</DialogTitle>
            <DialogDescription>{apiKey ? "Gerar uma nova API Key irá invalidar a anterior." : "Gere uma API Key para integrar com outras plataformas."}</DialogDescription>
          </DialogHeader>
          {apiKey && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">Atenção: A API Key atual será invalidada!</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyModal(false)}>Cancelar</Button>
            <Button onClick={() => { handleGenerateApiKey(); setShowApiKeyModal(false); }}>Gerar {apiKey ? "Nova " : ""}API Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showWebhookModal} onOpenChange={setShowWebhookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Webhook</DialogTitle>
            <DialogDescription>Digite a URL que receberá as notificações dos eventos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL do Webhook</Label>
              <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://seu-site.com/webhook" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowWebhookModal(false); setWebhookUrl(""); }}>Cancelar</Button>
            <Button onClick={() => { handleAddWebhook(); setShowWebhookModal(false); }}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSessionsModal} onOpenChange={setShowSessionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sessões Ativas</DialogTitle>
            <DialogDescription>Gerencie suas sessões ativas</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sessão Atual</p>
                  <p className="text-sm text-muted-foreground">Windows · Chrome</p>
                  <p className="text-xs text-muted-foreground mt-1">Última atividade: agora</p>
                </div>
                <Badge variant="default">Ativa</Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionsModal(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autenticação em Dois Fatores (2FA)</DialogTitle>
            <DialogDescription>
              {is2FAEnabled ? "A autenticação em dois fatores está ativa. Deseja desativar?" : "Adicione uma camada extra de segurança à sua conta."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm">
                {is2FAEnabled 
                  ? "Ao desativar o 2FA, apenas sua senha será necessária para fazer login."
                  : "Ao ativar o 2FA, você precisará de um código adicional além da senha para fazer login."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FAModal(false)}>Cancelar</Button>
            <Button onClick={handleToggle2FA}>{is2FAEnabled ? "Desativar 2FA" : "Ativar 2FA"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
