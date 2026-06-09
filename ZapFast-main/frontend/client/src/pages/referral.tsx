import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Gift,
  Copy,
  Users,
  DollarSign,
  Share2,
  CheckCircle,
  Clock,
  Trophy,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Referral() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Gerar código único baseado no ID do usuário
  const userId = localStorage.getItem("demo_user_id") || "default-user";
  // Gerar código único de 8 caracteres baseado no ID
  const generateReferralCode = (id: string) => {
    // Criar um hash simples do ID do usuário
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Converter para string base36 e pegar 8 caracteres
    const code = Math.abs(hash).toString(36).toUpperCase().substring(0, 8).padEnd(8, '0');
    return `PZ${code}`;
  };
  
  const referralCode = generateReferralCode(userId);
  const referralLink = `https://pilotzap.tech/ref/${referralCode}`;
  const totalReferrals = 0;
  const activeReferrals = 0;
  const pendingReferrals = 0;
  const totalEarnings = 0.0;
  const nextRewardAt = 3;

  const referralHistory: any[] = [];

  const rewards = [
    { target: 3, label: "3 indicações", reward: "50 MT de crédito", achieved: false },
    { target: 5, label: "5 indicações", reward: "1 mês grátis", achieved: false },
    { target: 10, label: "10 indicações", reward: "3 meses grátis", achieved: false },
    { target: 20, label: "20 indicações", reward: "Plano anual grátis", achieved: false },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "Compartilhe com seus amigos e ganhe recompensas.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Código copiado!",
      description: "Seu código de indicação foi copiado.",
    });
  };

  const handleShare = (platform: string) => {
    const message = `Junte-se a mim no PilotZap! Use meu código ${referralCode} e ganhe benefícios exclusivos. ${referralLink}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedLink = encodeURIComponent(referralLink);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(`Junte-se a mim no PilotZap! Use meu código ${referralCode}`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Convite PilotZap')}&body=${encodedMessage}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareDialog(false);
      toast({
        title: "Compartilhando...",
        description: `Abrindo ${platform} para compartilhar seu link.`,
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border pl-14 pr-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-page-title">
                Indique e Ganhe
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-primary border-primary">
                <Gift className="h-3 w-3 mr-1" />
                Programa Ativo
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-8">
            {/* Referral Link Card */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Seu Link de Indicação Único
                </CardTitle>
                <CardDescription>
                  Cada usuário possui um código exclusivo. Compartilhe seu link e ganhe recompensas por cada amigo que assinar!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    💡 <strong>Dica:</strong> Seu código é único e permanente, vinculado à sua conta.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-background/80 border border-border rounded-lg px-4 py-2.5">
                    <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate font-mono" data-testid="text-referral-link">
                      {referralLink}
                    </span>
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className="shrink-0"
                    data-testid="button-copy-link"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Código:</span>
                    <code className="bg-background/80 border border-border px-2 py-1 rounded text-primary font-semibold">
                      {referralCode}
                    </code>
                    <Button variant="ghost" size="sm" onClick={handleCopyCode} className="h-7 px-2">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2" 
                    data-testid="button-share"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-referrals">
                    {totalReferrals}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeReferrals > 0 ? `${activeReferrals} ativas` : 'Nenhuma indicação ainda'} {pendingReferrals > 0 ? `· ${pendingReferrals} pendentes` : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="text-total-earnings">
                    {totalEarnings.toFixed(2).replace(".", ",")} MT
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ganhe créditos por cada indicação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Indicações Ativas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-referrals">
                    {activeReferrals}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Amigos que assinaram o plano
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Recompensa</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-next-reward">
                    {nextRewardAt - totalReferrals} restantes
                  </div>
                  <div className="mt-2">
                    <Progress value={(totalReferrals / nextRewardAt) * 100} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalReferrals}/{nextRewardAt} para {rewards[0].reward}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Rewards Tiers & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reward Tiers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Níveis de Recompensa
                  </CardTitle>
                  <CardDescription>
                    Quanto mais indicações, maiores as recompensas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rewards.map((reward, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          reward.achieved
                            ? "bg-primary/5 border-primary/30"
                            : "bg-muted/30 border-border"
                        }`}
                        data-testid={`reward-tier-${reward.target}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              reward.achieved
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {reward.target}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{reward.label}</p>
                            <p className="text-xs text-muted-foreground">{reward.reward}</p>
                          </div>
                        </div>
                        {reward.achieved ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Conquistado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Referral History */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Indicações</CardTitle>
                  <CardDescription>
                    Acompanhe suas indicações e status das recompensas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralHistory.length > 0 ? (
                      referralHistory.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                          data-testid={`referral-item-${referral.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {referral.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{referral.name}</p>
                              <p className="text-xs text-muted-foreground">{referral.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-green-600">
                              {referral.reward}
                            </span>
                            {referral.status === "paid" ? (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Recompensa
                              </Badge>
                            ) : referral.status === "active" ? (
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
                                Ativa
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-500/30 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Nenhuma indicação ainda
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Comece a compartilhar seu link e ganhe recompensas
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Link de Indicação</DialogTitle>
            <DialogDescription>
              Escolha uma rede social para compartilhar seu link e ganhar recompensas
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-500"
              onClick={() => handleShare('whatsapp')}
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="text-sm font-medium">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500"
              onClick={() => handleShare('facebook')}
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-sky-50 dark:hover:bg-sky-950 hover:border-sky-500"
              onClick={() => handleShare('twitter')}
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span className="text-sm font-medium">Twitter</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-cyan-50 dark:hover:bg-cyan-950 hover:border-cyan-500"
              onClick={() => handleShare('telegram')}
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="text-sm font-medium">Telegram</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-700"
              onClick={() => handleShare('linkedin')}
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">LinkedIn</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-500"
              onClick={() => handleShare('email')}
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span className="text-sm font-medium">E-mail</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
