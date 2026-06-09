import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Send, 
  Plus, 
  Pause, 
  Play, 
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MessageSquare,
  Image,
  Video,
  FileText,
  Calendar
} from "lucide-react";

// Variáveis disponíveis para autocomplete
const AVAILABLE_VARIABLES = [
  { value: '@nome', label: 'Nome', description: 'Nome completo do contato' },
  { value: '@email', label: 'E-mail', description: 'Endereço de e-mail do contato' },
  { value: '@telefone', label: 'Telefone', description: 'Número de telefone do contato' },
];

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  tags?: string[];
}

interface BulkCampaign {
  id: string;
  userId: string;
  name: string;
  message: string;
  mediaUrl?: string;
  recipients: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'failed';
  progress: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  settings: {
    delayBetweenMessages: number;
    maxRetries: number;
    scheduledAt?: string;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export default function BulkMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    mediaUrl: "",
    delayBetweenMessages: 3,
    maxRetries: 3,
    scheduledAt: "",
  });

  // Estados para autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [filteredSuggestions, setFilteredSuggestions] = useState(AVAILABLE_VARIABLES);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch contacts
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    retry: false,
  });

  // Fetch campaigns
  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery<BulkCampaign[]>({
    queryKey: ["/api/bulk-messages/campaigns"],
    retry: false,
    refetchInterval: 2000, // Refresh every 2 seconds to show real-time progress
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest("POST", "/api/bulk-messages/campaigns", campaignData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-messages/campaigns"] });
      toast({
        title: "Campanha Criada",
        description: "Sua campanha de disparos em massa foi criada!",
        duration: 3000,
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar campanha.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const startCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest("POST", `/api/bulk-messages/campaigns/${campaignId}/start`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-messages/campaigns"] });
      toast({
        title: "Campanha Iniciada",
        description: "Os disparos começaram!",
        duration: 2000,
      });
    },
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest("POST", `/api/bulk-messages/campaigns/${campaignId}/pause`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-messages/campaigns"] });
      toast({
        title: "Campanha Pausada",
        description: "Os disparos foram pausados.",
        duration: 2000,
      });
    },
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest("POST", `/api/bulk-messages/campaigns/${campaignId}/resume`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-messages/campaigns"] });
      toast({
        title: "Campanha Retomada",
        description: "Os disparos continuaram.",
        duration: 2000,
      });
    },
  });

  const cancelCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest("POST", `/api/bulk-messages/campaigns/${campaignId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-messages/campaigns"] });
      toast({
        title: "Campanha Cancelada",
        description: "A campanha foi cancelada.",
        duration: 2000,
      });
    },
  });

  // Detectar @ e mostrar sugestões
  const handleMessageChange = (value: string) => {
    setFormData({ ...formData, message: value });

    const textarea = messageTextareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && lastAtIndex === cursorPosition - 1) {
      // Acabou de digitar @
      setShowSuggestions(true);
      setFilteredSuggestions(AVAILABLE_VARIABLES);
      setSelectedSuggestionIndex(0);

      // Calcular posição
      const rect = textarea.getBoundingClientRect();
      const textBeforeAt = textBeforeCursor.substring(0, lastAtIndex);
      const lines = textBeforeAt.split('\n');
      const currentLine = lines.length - 1;
      
      const lineHeight = 20;
      const verticalOffset = currentLine * lineHeight;
      
      setSuggestionPosition({
        top: rect.top + verticalOffset + window.scrollY,
        left: rect.left + 15,
      });
    } else if (lastAtIndex !== -1 && cursorPosition > lastAtIndex) {
      // Digitando após @
      const searchTerm = textBeforeCursor.substring(lastAtIndex + 1).toLowerCase();
      const filtered = AVAILABLE_VARIABLES.filter(v =>
        v.value.toLowerCase().includes(searchTerm) ||
        v.label.toLowerCase().includes(searchTerm)
      );
      setFilteredSuggestions(filtered);
      
      if (filtered.length === 0) {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Inserir variável selecionada
  const insertVariable = (variable: string) => {
    const textarea = messageTextareaRef.current;
    if (!textarea) return;

    const value = formData.message;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newValue = 
        value.substring(0, lastAtIndex) + 
        variable + 
        textAfterCursor;
      
      setFormData({ ...formData, message: newValue });
      setShowSuggestions(false);
      
      // Focar no textarea novamente
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursorPos = lastAtIndex + variable.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Navegar nas sugestões com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && showSuggestions) {
      e.preventDefault();
      insertVariable(filteredSuggestions[selectedSuggestionIndex].value);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

  const resetForm = () => {
    setFormData({
      name: "",
      message: "",
      mediaUrl: "",
      delayBetweenMessages: 3,
      maxRetries: 3,
      scheduledAt: "",
    });
    setSelectedContacts([]);
  };

  const handleCreateCampaign = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome Obrigatório",
        description: "Digite um nome para a campanha",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    
    if (!formData.message.trim()) {
      toast({
        title: "Mensagem Obrigatória",
        description: "Digite a mensagem que será enviada",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "Selecione Destinatários",
        description: "Selecione pelo menos um contato",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    createCampaignMutation.mutate({
      ...formData,
      recipientIds: selectedContacts,
      scheduledAt: formData.scheduledAt || undefined,
    });
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phoneNumber.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      scheduled: "bg-blue-500",
      sending: "bg-yellow-500",
      completed: "bg-green-500",
      paused: "bg-orange-500",
      failed: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      scheduled: "Agendada",
      sending: "Enviando",
      completed: "Concluída",
      paused: "Pausada",
      failed: "Falhou",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'sending':
        return <Send className="h-4 w-4 animate-pulse" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
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
              <h1 className="text-2xl font-semibold">Campanhas</h1>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Campanha de Disparos</DialogTitle>
                  <DialogDescription>
                    Configure sua campanha de mensagens em massa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Campanha</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Promoção Black Friday"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      ref={messageTextareaRef}
                      id="message"
                      placeholder="Digite sua mensagem aqui... Digite @ para inserir variáveis"
                      value={formData.message}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite @ para inserir variáveis: @nome, @email, @telefone
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="mediaUrl">URL da Mídia (Opcional)</Label>
                    <Input
                      id="mediaUrl"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Suporta: imagens (.jpg, .png), vídeos (.mp4), áudio (.mp3), documentos
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="delay">Delay entre mensagens (segundos)</Label>
                      <Input
                        id="delay"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.delayBetweenMessages}
                        onChange={(e) => setFormData({ ...formData, delayBetweenMessages: parseInt(e.target.value) || 3 })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recomendado: 3-5 segundos para evitar bloqueio
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="retries">Máximo de tentativas</Label>
                      <Input
                        id="retries"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.maxRetries}
                        onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value) || 3 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scheduledAt">Agendar para (Opcional)</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label>Selecionar Destinatários ({selectedContacts.length} selecionados)</Label>
                      <Button variant="outline" size="sm" onClick={selectAllContacts}>
                        {selectedContacts.length === filteredContacts.length ? "Desmarcar Todos" : "Selecionar Todos"}
                      </Button>
                    </div>
                    
                    <Input
                      placeholder="Buscar contatos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-3"
                    />

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredContacts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum contato encontrado
                        </p>
                      ) : (
                        filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                            onClick={() => toggleContactSelection(contact.id)}
                          >
                            <Checkbox
                              checked={selectedContacts.includes(contact.id)}
                              onCheckedChange={() => toggleContactSelection(contact.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.phoneNumber}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateCampaign}
                      disabled={createCampaignMutation.isPending}
                    >
                      {createCampaignMutation.isPending ? "Criando..." : "Criar Campanha"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma campanha criada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira campanha de disparos em massa
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <Badge className={getStatusColor(campaign.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(campaign.status)}
                              <span>{getStatusLabel(campaign.status)}</span>
                            </span>
                          </Badge>
                        </div>
                        <CardDescription className="mt-2 line-clamp-2">
                          {campaign.message}
                        </CardDescription>
                      </div>
                      
                      <div className="flex space-x-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => startCampaignMutation.mutate(campaign.id)}
                            disabled={startCampaignMutation.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        
                        {campaign.status === 'sending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pauseCampaignMutation.mutate(campaign.id)}
                            disabled={pauseCampaignMutation.isPending}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pausar
                          </Button>
                        )}
                        
                        {campaign.status === 'paused' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => resumeCampaignMutation.mutate(campaign.id)}
                              disabled={resumeCampaignMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Retomar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => cancelCampaignMutation.mutate(campaign.id)}
                              disabled={cancelCampaignMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      {(campaign.status === 'sending' || campaign.status === 'paused' || campaign.status === 'completed') && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progresso</span>
                            <span>{Math.round((campaign.progress.sent / campaign.progress.total) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(campaign.progress.sent / campaign.progress.total) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{campaign.progress.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{campaign.progress.sent}</p>
                          <p className="text-xs text-muted-foreground">Enviadas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-500">{campaign.progress.pending}</p>
                          <p className="text-xs text-muted-foreground">Pendentes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-500">{campaign.progress.failed}</p>
                          <p className="text-xs text-muted-foreground">Falharam</p>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="flex items-center space-x-6 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Delay: {campaign.settings.delayBetweenMessages}s</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{campaign.recipients.length} destinatários</span>
                        </div>
                        {campaign.settings.scheduledAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Agendado: {new Date(campaign.settings.scheduledAt).toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Popup de Sugestões */}
      {showSuggestions && (
        <div
          className="fixed bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
          style={{
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`,
            minWidth: '280px',
            maxWidth: '380px',
            zIndex: 9999,
            transform: 'translateY(-100%)',
            marginTop: '-8px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 bg-muted/50 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">
              Variáveis disponíveis
            </p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.value}
                className={`w-full text-left px-3 py-2.5 hover:bg-accent transition-colors ${
                  index === selectedSuggestionIndex ? 'bg-accent' : ''
                }`}
                onClick={() => insertVariable(suggestion.value)}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{suggestion.value}</p>
                    <p className="text-xs text-muted-foreground truncate">{suggestion.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {suggestion.label}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 bg-muted/50 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ↑↓ navegar • Enter selecionar • Esc fechar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
