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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Bot, 
  Save, 
  Settings,
  Brain,
  Info
} from "lucide-react";

// Variáveis disponíveis para autocomplete
const AVAILABLE_VARIABLES = [
  { value: '@nome', label: 'Nome do cliente', description: 'Nome completo do contato' },
  { value: '@email', label: 'E-mail', description: 'Endereço de e-mail do contato' },
  { value: '@telefone', label: 'Telefone', description: 'Número de telefone do contato' },
  { value: '@data', label: 'Data atual', description: 'Data de hoje formatada' },
];

interface ChatbotConfig {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  aiProvider: 'openai' | 'custom';
  apiKey?: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  fallbackMessage: string;
  greetingMessage?: string;
  triggerKeywords: string[];
  conversationMemory: boolean;
  maxMemoryMessages: number;
  createdAt: string;
  updatedAt: string;
}

export default function ChatbotAI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "Assistente Virtual",
    isActive: true,
    aiProvider: 'openai' as 'openai' | 'custom',
    apiKey: "",
    model: "gpt-4o-mini",
    systemPrompt: `Você é um assistente virtual inteligente e prestativo para WhatsApp.

Diretrizes:
- Seja educado, amigável e profissional
- Responda de forma clara e concisa
- Use o nome do cliente quando apropriado (@nome)
- Se não souber algo, seja honesto e ofereça alternativas
- Mantenha o tom conversacional e natural

Seu objetivo é ajudar os clientes e proporcionar uma excelente experiência.`,
    temperature: 0.7,
    maxTokens: 500,
    fallbackMessage: "Desculpe, não consegui processar sua mensagem. Pode reformular?",
    greetingMessage: "Olá @nome! 👋 Sou seu assistente virtual. Como posso ajudá-lo hoje?",
    triggerKeywords: "",
    conversationMemory: true,
    maxMemoryMessages: 10,
  });

  // Estados para autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [filteredSuggestions, setFilteredSuggestions] = useState(AVAILABLE_VARIABLES);
  const [activeField, setActiveField] = useState<'systemPrompt' | 'greetingMessage' | 'fallbackMessage' | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);
  const greetingMessageRef = useRef<HTMLTextAreaElement>(null);
  const fallbackMessageRef = useRef<HTMLTextAreaElement>(null);

  // Fetch config
  const { data: config, isLoading } = useQuery<ChatbotConfig>({
    queryKey: ["/api/chatbot/config"],
    retry: false,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name,
          isActive: data.isActive,
          aiProvider: data.aiProvider,
          apiKey: data.apiKey || "",
          model: data.model,
          systemPrompt: data.systemPrompt,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          fallbackMessage: data.fallbackMessage,
          greetingMessage: data.greetingMessage || "",
          triggerKeywords: data.triggerKeywords.join(", "),
          conversationMemory: data.conversationMemory,
          maxMemoryMessages: data.maxMemoryMessages,
        });
      }
    },
  });

  // Detectar @ e mostrar sugestões
  const handleTextChange = (
    field: 'systemPrompt' | 'greetingMessage' | 'fallbackMessage',
    value: string,
    textareaRef: React.RefObject<HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: value });

    // Verificar se digitou @
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && lastAtIndex === cursorPosition - 1) {
      // Acabou de digitar @
      setActiveField(field);
      setShowSuggestions(true);
      setFilteredSuggestions(AVAILABLE_VARIABLES);
      setSelectedSuggestionIndex(0);

      // Calcular posição simples e direta
      const rect = textarea.getBoundingClientRect();
      const textBeforeAt = textBeforeCursor.substring(0, lastAtIndex);
      const lines = textBeforeAt.split('\n');
      const currentLine = lines.length - 1;
      
      // Posição vertical - na linha atual do cursor
      const lineHeight = 20;
      const verticalOffset = currentLine * lineHeight;
      
      setSuggestionPosition({
        top: rect.top + verticalOffset + window.scrollY,
        left: rect.left + 15, // Pequeno offset da esquerda
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
    if (!activeField) return;

    const textarea = activeField === 'systemPrompt' ? systemPromptRef.current :
                     activeField === 'greetingMessage' ? greetingMessageRef.current :
                     fallbackMessageRef.current;
    
    if (!textarea) return;

    const value = formData[activeField];
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newValue = 
        value.substring(0, lastAtIndex) + 
        variable + 
        textAfterCursor;
      
      setFormData({ ...formData, [activeField]: newValue });
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
  const handleKeyDown = (e: React.KeyboardEvent, field: 'systemPrompt' | 'greetingMessage' | 'fallbackMessage') => {
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

  const saveConfigMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        triggerKeywords: data.triggerKeywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
      };

      if (config) {
        const response = await apiRequest("PUT", `/api/chatbot/config/${config.id}`, payload);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/chatbot/config", payload);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/config"] });
      toast({
        title: "Configuração Salva",
        description: "As configurações do chatbot foram atualizadas!",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome Obrigatório",
        description: "Digite um nome para o chatbot",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!formData.systemPrompt.trim()) {
      toast({
        title: "Prompt Obrigatório",
        description: "Digite um prompt do sistema",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    saveConfigMutation.mutate(formData);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border pl-14 pr-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Bot className="h-6 w-6" />
                Chatbot AI
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {config && (
                <Badge className={config.isActive ? "bg-green-500" : "bg-gray-500"}>
                  {config.isActive ? "Ativo" : "Inativo"}
                </Badge>
              )}
              <Button
                onClick={handleSave}
                disabled={saveConfigMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveConfigMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Configuration */}
          <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Configure as informações gerais do seu chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Chatbot</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Assistente Virtual"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Chatbot Ativo</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Configuração da IA
                  </CardTitle>
                  <CardDescription>
                    Configure o modelo e comportamento da inteligência artificial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model">Modelo</Label>
                      <Select
                        value={formData.model}
                        onValueChange={(value) => setFormData({ ...formData, model: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o">GPT-4o (Mais Inteligente)</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini (Recomendado)</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais Rápido)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="apiKey">OpenAI API Key (Opcional)</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Se não informado, usará a chave do sistema
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="systemPrompt">Prompt do Sistema</Label>
                    <div className="relative">
                      <Textarea
                        ref={systemPromptRef}
                        id="systemPrompt"
                        placeholder="Defina como o chatbot deve se comportar..."
                        value={formData.systemPrompt}
                        onChange={(e) => handleTextChange('systemPrompt', e.target.value, systemPromptRef)}
                        onKeyDown={(e) => handleKeyDown(e, 'systemPrompt')}
                        rows={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite @ para inserir variáveis: @nome, @email, @telefone, @data
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="temperature">
                      Criatividade (Temperature): {formData.temperature}
                    </Label>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[formData.temperature]}
                      onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      0 = Mais consistente, 1 = Mais criativo
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxTokens">Tamanho Máximo da Resposta (Tokens)</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="100"
                      max="2000"
                      value={formData.maxTokens}
                      onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 500 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ~1 token = 0.75 palavras. 500 tokens ≈ 375 palavras
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mensagens e Gatilhos</CardTitle>
                  <CardDescription>
                    Configure mensagens automáticas e palavras-chave
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="greetingMessage">Mensagem de Saudação (Opcional)</Label>
                    <Textarea
                      ref={greetingMessageRef}
                      id="greetingMessage"
                      placeholder="Ex: Olá @nome! Como posso ajudá-lo?"
                      value={formData.greetingMessage}
                      onChange={(e) => handleTextChange('greetingMessage', e.target.value, greetingMessageRef)}
                      onKeyDown={(e) => handleKeyDown(e, 'greetingMessage')}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite @ para inserir variáveis
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="fallbackMessage">Mensagem de Erro (Fallback)</Label>
                    <Textarea
                      ref={fallbackMessageRef}
                      id="fallbackMessage"
                      placeholder="Mensagem quando o chatbot não consegue responder"
                      value={formData.fallbackMessage}
                      onChange={(e) => handleTextChange('fallbackMessage', e.target.value, fallbackMessageRef)}
                      onKeyDown={(e) => handleKeyDown(e, 'fallbackMessage')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="triggerKeywords">Palavras-Chave de Gatilho (Opcional)</Label>
                    <Input
                      id="triggerKeywords"
                      placeholder="Ex: ajuda, suporte, dúvida (separadas por vírgula)"
                      value={formData.triggerKeywords}
                      onChange={(e) => setFormData({ ...formData, triggerKeywords: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se definido, chatbot só responde mensagens com essas palavras. Deixe vazio para responder todas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memória de Conversação</CardTitle>
                  <CardDescription>
                    Configure como o chatbot lembra de conversas anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="conversationMemory"
                      checked={formData.conversationMemory}
                      onCheckedChange={(checked) => setFormData({ ...formData, conversationMemory: checked })}
                    />
                    <Label htmlFor="conversationMemory">Ativar Memória de Conversação</Label>
                  </div>

                  {formData.conversationMemory && (
                    <div>
                      <Label htmlFor="maxMemoryMessages">
                        Máximo de Mensagens na Memória: {formData.maxMemoryMessages}
                      </Label>
                      <Slider
                        id="maxMemoryMessages"
                        min={1}
                        max={20}
                        step={1}
                        value={[formData.maxMemoryMessages]}
                        onValueChange={([value]) => setFormData({ ...formData, maxMemoryMessages: value })}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Memória expira após 30 minutos de inatividade
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
            transform: 'translateY(-100%)', // Move completamente para cima
            marginTop: '-8px', // Pequeno espaçamento
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
