import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { DashboardAnalytics } from "@shared/api-types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type WhatsAppStatus = {
  connected: boolean;
  phoneNumber?: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
};
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import WhatsAppConnectionModal from "@/components/whatsapp-connection-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Send, Loader2, PlayCircle, Filter, Rocket, SunIcon, MoonIcon } from "lucide-react";
import { Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TrendType = 'up' | 'down' | 'neutral';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trendChange?: string;
  trendType?: TrendType;
  'data-testid'?: string;
}

function MetricCard({ title, value, icon: Icon, trendChange, trendType = 'neutral', 'data-testid': testId }: MetricCardProps) {
  const TrendIcon = trendType === 'up' ? ArrowUp : trendType === 'down' ? ArrowDown : Minus;
  const trendColor = trendType === 'up' ? 'text-green-500' : trendType === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div className="rounded-lg h-full">
      <Card className="h-full transition-colors duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5">
          <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5 pt-1">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground" data-testid={testId}>
            {value}
          </div>
          {trendChange && (
            <p className={cn('flex items-center gap-1 text-[10px] sm:text-xs font-medium mt-1', trendColor)}>
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {trendChange}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Olá, este é um teste de envio do PilotZap!");
  const [ongoingExecutions, setOngoingExecutions] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: analytics, isLoading: analyticsLoading } = useQuery<any>({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
    staleTime: 30000, 
    refetchInterval: 10000, // Refresh dashboard every 10 seconds for real-time feel
  });

  // Fetch recent messages for activities
  const { data: messages } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    staleTime: 10000,
    refetchInterval: 10000,
  });

  // Sync state with query data
  useEffect(() => {
    if (analytics?.ongoingExecutions) {
      const mockPhones = ["5511999998888", "5511777776666", "5511999991111", "5511988882222"];
      const filtered = analytics.ongoingExecutions.filter((exe: any) => {
        const phone = String(exe.phoneNumber || "");
        const name = String(exe.funnelName || "");
        return !mockPhones.includes(phone) && 
               !name.includes("FLUXO VCB IMPOR") &&
               !name.includes("Vendas Diretas") &&
               !name.includes("Suporte VIP") &&
               !name.includes("Lembrete de Aula");
      });
      setOngoingExecutions(filtered);
    } else {
      setOngoingExecutions([]);
    }
  }, [analytics]);

  useEffect(() => {
    if (messages) {
      setRecentLogs(messages.slice(0, 5));
    }
  }, [messages]);

  const { theme, toggleTheme } = useTheme();

  const { data: whatsappStatus } = useQuery<WhatsAppStatus>({
    queryKey: ["/api/whatsapp/status"],
    retry: false,
  });

  const { data: authResponse, isLoading: userLoading } = useQuery<{ success: boolean; user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  const user = authResponse?.user;

  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    console.log('🔍 [DASHBOARD] Dados do usuário:', user);
    
    if (!user) {
      // Não definir "Usuário" enquanto está carregando
      if (!userLoading) {
        setDisplayName("Usuário");
      }
      return;
    }
    
    // Função para capitalizar primeira letra
    const capitalizeFirst = (str: string) => {
      if (!str || str.trim().length === 0) return '';
      const trimmed = str.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    };

    // Priorizar: nickname > firstName > fallback
    if (user?.nickname && user.nickname.trim()) {
      console.log('✅ [DASHBOARD] Usando nickname:', user.nickname);
      setDisplayName(capitalizeFirst(user.nickname));
    } else if (user?.firstName && user.firstName.trim()) {
      console.log('✅ [DASHBOARD] Usando firstName:', user.firstName);
      setDisplayName(capitalizeFirst(user.firstName));
    } else {
      console.log('⚠️ [DASHBOARD] Sem nome, usando "Usuário"');
      setDisplayName("Usuário");
    }
  }, [user, userLoading]);

  const sendTestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/messages/send", {
        phoneNumber: testPhone.replace(/\D/g, ''),
        content: testMessage,
        type: "text",
        // No contactId for direct test
        directSend: true 
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao enviar mensagem");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mensagem Enviada!",
        description: "O teste de envio foi concluído com sucesso.",
        duration: 3000,
      });
      setShowTestDialog(false);
      setTestPhone("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no Envio",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    }
  });

  const stopExecutionMutation = useMutation({
    mutationFn: async (id: string) => {
      // In a real app, this would call the API. For demo/mock, we just invalidate
      const response = await apiRequest("POST", `/api/funnel-executions/${id}/stop`, {});
      if (!response.ok) throw new Error("Falha ao parar disparo");
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Update local state state immediately
      setOngoingExecutions(prev => prev.filter(exe => String(exe.id) !== String(variables)));
      
      // Update query data as well to maintain consistency
      queryClient.setQueryData(["/api/analytics/dashboard"], (oldData: any) => {
        if (!oldData) return oldData;
        const updatedExecutions = (oldData.ongoingExecutions || [])
          .filter((exe: any) => String(exe.id) !== String(variables));
          
        return {
          ...oldData,
          ongoingExecutions: updatedExecutions,
          activeFunnels: Math.max(0, (oldData.activeFunnels || 0) - 1)
        };
      });
      
      toast({ title: "Disparo Interrompido", description: "O fluxo para este contato foi parado.", duration: 2000 });
    }
  });

  const metricsData = analytics?.weeklyData || [
    { name: 'Dom', mensagens: 0, contatos: 0, conversoes: 0, funisAtivos: 0, taxaFinalizacao: 0 },
    { name: 'Seg', mensagens: 0, contatos: 0, conversoes: 0, funisAtivos: 0, taxaFinalizacao: 0 },
    { name: 'Ter', mensagens: 0, contatos: 0, conversoes: 0, funisAtivos: 0, taxaFinalizacao: 0 },
    { name: 'Qua', mensagens: 0, contatos: 0, conversoes: 0, funisAtivos: 0, taxaFinalizacao: 0 },
    { name: 'Qui', mensagens: 0, contatos: 0, conversoes: 0, funisAtivos: 0, taxaFinalizacao: 0 },
    { name: 'Sex', mensagens: 0, contatos: 0, conversoes: 0, funisAtivos: 0, taxaFinalizacao: 0 },
    { name: 'Sáb', mensagens: 0, contatos: 0, conversoes: 0, funisAtivos: 0, taxaFinalizacao: 0 },
  ];

  // Calculate comparison metrics
  const getMessageDiff = () => {
    if (!analytics) return { value: 0, text: "0%", colorClass: "text-muted-foreground" };
    const today = analytics.todayMessages || 0;
    const yesterday = analytics.yesterdayMessages || 0;
    if (yesterday === 0) {
      if (today > 0) return { value: 100, text: `+${today} novas`, colorClass: "text-green-600" };
      return { value: 0, text: "0%", colorClass: "text-muted-foreground" };
    }
    const diff = ((today - yesterday) / yesterday) * 100;
    const sign = diff > 0 ? "+" : "";
    const colorClass = diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-muted-foreground";
    return { value: diff, text: `${sign}${diff.toFixed(0)}%`, colorClass };
  };

  const getFunnelInfo = () => {
    if (!analytics) return "Total: 0 fluxos";
    const total = analytics.totalFunnels || 0;
    const active = analytics.activeFunnels || 0;
    if (total === 0) return "Nenhum fluxo criado";
    return `${active}/${total} ativos`;
  };

  const getDeliveryInfo = () => {
    if (!analytics) return "0 mensagens enviadas";
    const sent = analytics.sentMessages || 0;
    const delivered = analytics.deliveredMessages || 0;
    if (sent === 0) return "Nenhuma mensagem enviada";
    return `${delivered}/${sent} entregues (${analytics.deliveryRate?.toFixed(0) || 0}%)`;
  };

  const getContactDiff = () => {
    if (!analytics) return { value: 0, text: "0%", colorClass: "text-muted-foreground" };
    const total = analytics.totalContacts || 0;
    const today = analytics.activeContacts || 0; // Simplified for demo/real data calculation
    if (total === 0) return { value: 0, text: "0%", colorClass: "text-muted-foreground" };
    const diff = (today / total) * 100;
    return { value: diff, text: `+${diff.toFixed(0)}%`, colorClass: "text-green-600" };
  };

  const getRateDiff = () => {
    if (!analytics) return { value: 0, text: "0%", colorClass: "text-muted-foreground" };
    const rate = analytics.deliveryRate || 0;
    const prevRate = analytics.yesterdayDeliveryRate || 0;
    if (prevRate === 0) {
      if (rate > 0) return { value: 100, text: `+${rate.toFixed(0)}%`, colorClass: "text-green-600" };
      return { value: 0, text: "0%", colorClass: "text-muted-foreground" };
    }
    const diff = rate - prevRate;
    const sign = diff > 0 ? "+" : "";
    const colorClass = diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-muted-foreground";
    return { value: diff, text: `${sign}${diff.toFixed(1)}%`, colorClass };
  };

  const contactDiff = getContactDiff();
  const rateDiff = getRateDiff();
  const messageDiff = getMessageDiff();

  // Cores do gráfico baseadas no tema
  const chartColors = {
    text: theme === 'dark' ? '#ffffff' : '#000000',
    grid: theme === 'dark' ? '#444444' : '#e5e5e5',
    axis: theme === 'dark' ? '#666666' : '#999999',
    tooltipBg: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    tooltipBorder: theme === 'dark' ? '#333333' : '#e5e5e5',
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border pl-14 pr-4 lg:pl-6 lg:pr-6 py-3 sm:py-4 lg:py-5 pt-[16px] pb-[16px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground" data-testid="text-dashboard-title">
                Bem-vindo, <span className="text-primary">{displayName || "..."}</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${whatsappStatus?.connected ? "bg-green-500" : "bg-red-500"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${whatsappStatus?.connected ? "bg-green-500" : "bg-red-500"}`}></span>
                </span>
                <span className={`text-xs ${whatsappStatus?.connected ? "text-muted-foreground" : "text-red-500"}`}>
                  {whatsappStatus?.connected ? "Conectado" : "Desconectado"}
                </span>
              </div>

              <div className="group inline-flex items-center gap-2" data-state={theme === "dark" ? "checked" : "unchecked"}>
                <span
                  className="group-data-[state=checked]:text-muted-foreground/50 cursor-pointer text-muted-foreground"
                  onClick={() => theme === "dark" && toggleTheme()}
                >
                  <SunIcon className="size-4" aria-hidden="true" />
                </span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  aria-label="Alternar entre modo claro e escuro"
                  data-testid="switch-theme"
                />
                <span
                  className="group-data-[state=unchecked]:text-muted-foreground/50 cursor-pointer text-muted-foreground"
                  onClick={() => theme === "light" && toggleTheme()}
                >
                  <MoonIcon className="size-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <MetricCard
              title="Fluxos Ativos"
              value={analyticsLoading ? "..." : analytics?.activeFunnels || 0}
              icon={Filter}
              trendChange={(analytics?.activeFunnels || 0) > 0
                ? `${analytics?.activeFunnels} ${analytics?.activeFunnels === 1 ? 'fluxo' : 'fluxos'} ativo(s) no sistema`
                : "Nenhum fluxo ativo"}
              trendType="neutral"
              data-testid="text-active-flows"
            />

            <MetricCard
              title="Total de Interações"
              value={analyticsLoading ? "..." : analytics?.todayMessages || 0}
              icon={Rocket}
              trendChange={`${messageDiff.text} vs período anterior`}
              trendType={messageDiff.value > 0 ? 'up' : messageDiff.value < 0 ? 'down' : 'neutral'}
              data-testid="text-today-messages"
            />

            <MetricCard
              title="Novos Contatos"
              value={analyticsLoading ? "..." : analytics?.totalContacts || 0}
              icon={Users}
              trendChange={`${contactDiff.text} vs mês passado`}
              trendType={contactDiff.value > 0 ? 'up' : contactDiff.value < 0 ? 'down' : 'neutral'}
              data-testid="text-active-contacts"
            />

            <MetricCard
              title="Taxa de Finalização"
              value={analyticsLoading ? "..." : `${(analytics?.deliveryRate || 0).toFixed(1)}%`}
              icon={TrendingUp}
              trendChange={`${rateDiff.text} vs mês passado`}
              trendType={rateDiff.value > 0 ? 'up' : rateDiff.value < 0 ? 'down' : 'neutral'}
              data-testid="text-delivery-rate"
            />
          </div>

          {/* Metrics Chart */}
          <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:gap-6 items-stretch">
            <Card className="min-w-0 flex flex-col overflow-hidden">
              <CardHeader className="p-4 sm:p-5 lg:p-6 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Análise de Desempenho</CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] sm:text-xs text-foreground">
                    {[
                      { color: "#8b5cf6", label: "Interações" },
                      { color: "#a78bfa", label: "Contatos" },
                      { color: "#c084fc", label: "Fluxos" },
                      { color: "#d8b4fe", label: "Sucesso%" },
                    ].map(({ color, label }) => (
                      <div key={label} className="hidden sm:flex items-center gap-1.5">
                        <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-6 pt-0 flex-1">
                <div className="h-[250px] sm:h-[300px] lg:h-[340px] w-full" data-testid="chart-metrics">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={metricsData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradMensagens" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="gradContatos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="gradFunis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c084fc" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: chartColors.text, fontSize: 12 }}
                        axisLine={{ stroke: chartColors.axis }}
                        tickLine={{ stroke: chartColors.axis }}
                        stroke={chartColors.axis}
                      />
                      <YAxis
                        tick={{ fill: chartColors.text, fontSize: 12 }}
                        axisLine={{ stroke: chartColors.axis }}
                        tickLine={{ stroke: chartColors.axis }}
                        stroke={chartColors.axis}
                        domain={[0, 'auto']}
                        allowDataOverflow={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.tooltipBg,
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: chartColors.text,
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                        }}
                        labelStyle={{ color: chartColors.text, marginBottom: 4, fontWeight: 'bold' }}
                        cursor={{ stroke: chartColors.axis, strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="mensagens"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#gradMensagens)"
                        name="Interações"
                        dot={false}
                        activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="contatos"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        fill="url(#gradContatos)"
                        name="Novos Contatos"
                        dot={false}
                        activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="funisAtivos"
                        stroke="#c084fc"
                        strokeWidth={2}
                        name="Fluxos Ativos"
                        dot={false}
                        activeDot={{ r: 5, fill: '#c084fc', strokeWidth: 0 }}
                        strokeDasharray="5 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="taxaFinalizacao"
                        stroke="#d8b4fe"
                        strokeWidth={2}
                        name="Taxa de Sucesso"
                        dot={false}
                        activeDot={{ r: 5, fill: '#d8b4fe', strokeWidth: 0 }}
                        strokeDasharray="5 3"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex sm:hidden flex-row items-center justify-between mt-3 px-1 w-full">
                  {[
                    { color: "#8b5cf6", label: "Interações" },
                    { color: "#a78bfa", label: "Contatos" },
                    { color: "#c084fc", label: "Fluxos" },
                    { color: "#d8b4fe", label: "Sucesso%" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[8px] text-foreground whitespace-nowrap">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      {/* 🚀 MODAL ZAPRÁPIDO WHATSAPP - ABRIR AUTOMATICAMENTE */}
      <WhatsAppConnectionModal 
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
      />
    </div>
  );
}
