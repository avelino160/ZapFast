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

export default function Referral() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Demo data
  const referralCode = "PILOTZAP-AB12CD";
  const referralLink = `https://pilotzap.com/ref/${referralCode}`;
  const totalReferrals = 7;
  const activeReferrals = 5;
  const pendingReferrals = 2;
  const totalEarnings = 175.0;
  const nextRewardAt = 10;

  const referralHistory = [
    { id: 1, name: "João S.", date: "03/06/2026", status: "active", reward: "R$ 25,00" },
    { id: 2, name: "Maria L.", date: "01/06/2026", status: "active", reward: "R$ 25,00" },
    { id: 3, name: "Pedro R.", date: "28/05/2026", status: "active", reward: "R$ 25,00" },
    { id: 4, name: "Ana C.", date: "25/05/2026", status: "active", reward: "R$ 25,00" },
    { id: 5, name: "Lucas M.", date: "20/05/2026", status: "active", reward: "R$ 25,00" },
    { id: 6, name: "Carla F.", date: "18/05/2026", status: "pending", reward: "R$ 25,00" },
    { id: 7, name: "Bruno T.", date: "15/05/2026", status: "pending", reward: "R$ 25,00" },
  ];

  const rewards = [
    { target: 3, label: "3 indicações", reward: "1 mês grátis", achieved: true },
    { target: 5, label: "5 indicações", reward: "Desconto de 30%", achieved: true },
    { target: 10, label: "10 indicações", reward: "Plano Pro vitalício", achieved: false },
    { target: 20, label: "20 indicações", reward: "Acesso VIP + Bônus", achieved: false },
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
                  Seu Link de Indicação
                </CardTitle>
                <CardDescription>
                  Compartilhe seu link exclusivo e ganhe R$ 25,00 por cada amigo que assinar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Button variant="outline" size="sm" className="gap-2" data-testid="button-share">
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
                    {activeReferrals} ativas · {pendingReferrals} pendentes
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
                    R$ {totalEarnings.toFixed(2).replace(".", ",")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ 25,00 por indicação ativa
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
                    {totalReferrals}/{nextRewardAt} para Plano Pro vitalício
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
                    {referralHistory.map((referral) => (
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
                          {referral.status === "active" ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
