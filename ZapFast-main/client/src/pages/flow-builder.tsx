import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Funnel as Flow } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Plus,
  Trash2,
  Edit,
  MessageSquare,
  Upload,
  Download,
  Check
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FlowBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedFlowsForExport, setSelectedFlowsForExport] = useState<string[]>([]);
  const [newFlowName, setNewFlowName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: flows, isLoading } = useQuery<Flow[]>({
    queryKey: ["/api/funnels"],
    retry: false,
  });

  const createFlowMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/funnels", {
        name: newFlowName,
        status: "draft",
        flowData: { nodes: [], edges: [] },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fluxo Criado",
        description: "Seu fluxo foi criado com sucesso!",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      setIsCreateDialogOpen(false);
      setNewFlowName("");
    },
    onError: (error: any) => {
      toast({
        title: "Limite Excedido",
        description: error.message || "Falha ao criar fluxo. Tente novamente.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const deleteFlowMutation = useMutation({
    mutationFn: async (flowId: string) => {
      const response = await apiRequest("DELETE", `/api/funnels/${flowId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fluxo Removido",
        description: "Fluxo removido com sucesso!",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover fluxo.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const toggleFlowStatusMutation = useMutation({
    mutationFn: async ({ flowId, newStatus }: { flowId: string; newStatus: string }) => {
      const response = await apiRequest("PUT", `/api/funnels/${flowId}`, {
        status: newStatus,
      });
      return response.json();
    },
    onMutate: async ({ flowId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/funnels"] });
      const previousFlows = queryClient.getQueryData<Flow[]>(["/api/funnels"]);
      queryClient.setQueryData<Flow[]>(["/api/funnels"], (old) =>
        old?.map((f) => (f.id === flowId ? { ...f, status: newStatus as Flow["status"] } : f))
      );
      return { previousFlows };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFlows) {
        queryClient.setQueryData(["/api/funnels"], context.previousFlows);
      }
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do fluxo.",
        variant: "destructive",
        duration: 2000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (importedFlows: any[]) => {
      const res = await apiRequest('POST', '/api/funnels/import', { funnels: importedFlows });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Fluxo importado!",
        description: `${data.imported} fluxo foi adicionado com sucesso.`,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/funnels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao importar",
        description: error.message || "Não foi possível importar o fluxo. Verifique o formato do arquivo.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        const imported = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        importMutation.mutate(imported);
      } catch (error) {
        toast({
          title: "Arquivo inválido",
          description: "O arquivo não está em formato JSON válido.",
          variant: "destructive",
          duration: 2000,
        });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenExportDialog = () => {
    if (!flows || flows.length === 0) {
      toast({
        title: "Nenhum fluxo",
        description: "Não há fluxo para exportar.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setSelectedFlowsForExport(flows.map(f => f.id));
    setIsExportDialogOpen(true);
  };

  const handleToggleFlowExport = (flowId: string) => {
    setSelectedFlowsForExport(prev => 
      prev.includes(flowId) 
        ? prev.filter(id => id !== flowId)
        : [...prev, flowId]
    );
  };

  const handleSelectAllFlows = () => {
    if (flows) {
      if (selectedFlowsForExport.length === flows.length) {
        setSelectedFlowsForExport([]);
      } else {
        setSelectedFlowsForExport(flows.map(f => f.id));
      }
    }
  };

  const handleExportSelectedFlows = () => {
    if (selectedFlowsForExport.length === 0) {
      toast({
        title: "Selecione fluxos",
        description: "Selecione pelo menos um fluxo para exportar.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const selectedFlows = flows?.filter(f => selectedFlowsForExport.includes(f.id)) || [];
    const exportData = selectedFlows.map(flow => ({
      name: flow.name,
      triggerPhrases: flow.triggerPhrases,
      status: flow.status,
      flowData: flow.flowData,
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fluxo-pilotzap-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Fluxo exportado!",
      description: `${selectedFlows.length} fluxo(s) exportado(s) com sucesso.`,
      duration: 2000,
    });
    setIsExportDialogOpen(false);
  };

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) {
      toast({
        title: "Nome Obrigatório",
        description: "Digite um nome para o fluxo",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    createFlowMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-card border-b border-border pl-14 pr-4 lg:px-6 pt-[16px] pb-[16px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-page-title">Fluxos</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                data-testid="input-import-file"
              />
              <Button 
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={importMutation.isPending}
                data-testid="button-import-flows"
                className="flex-1 sm:flex-initial"
              >
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{importMutation.isPending ? 'Importando...' : 'Importar'}</span>
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleOpenExportDialog}
                disabled={!flows || flows.length === 0}
                data-testid="button-export-flows"
                className="flex-1 sm:flex-initial"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex-1 sm:flex-initial pl-[12px] pr-[12px]"
                data-testid="button-create-flow"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Novo Fluxo</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse bg-card border border-border">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="flex justify-between mt-4">
                    <div className="h-10 w-20 bg-muted rounded"></div>
                    <div className="h-10 w-20 bg-muted rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows && flows.length > 0 ? (
                flows.map((flow) => (
                  <Card 
                    key={flow.id} 
                    className="p-6 bg-card border border-border hover:border-primary/50 transition-all"
                    data-testid={`card-flow-${flow.id}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground" data-testid={`text-flow-name-${flow.id}`}>
                          {flow.name}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {/* Status and Switch */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${flow.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-muted-foreground" data-testid={`text-flow-status-${flow.id}`}>
                              {flow.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <Switch
                            checked={flow.status === 'active'}
                            onCheckedChange={(checked) => {
                              toggleFlowStatusMutation.mutate({
                                flowId: flow.id,
                                newStatus: checked ? 'active' : 'inactive'
                              });
                            }}
                            data-testid={`switch-flow-status-${flow.id}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="rounded-full w-10 h-10 bg-red-600 hover:bg-red-700"
                          onClick={() => deleteFlowMutation.mutate(flow.id)}
                          disabled={deleteFlowMutation.isPending}
                          data-testid={`button-delete-flow-${flow.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="rounded-full w-10 h-10 bg-purple-600 hover:bg-purple-700"
                          onClick={() => setLocation(`/flow-editor/${flow.id}`)}
                          data-testid={`button-edit-flow-${flow.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum fluxo criado</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Comece criando seu primeiro fluxo de vendas automatizado
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    data-testid="button-create-first-flow"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Fluxo
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-create-flow">
          <DialogHeader>
            <DialogTitle>Criar Novo Fluxo</DialogTitle>
            <DialogDescription>
              Configure seu novo fluxo de vendas automatizado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flow-name">Nome do Fluxo</Label>
              <Input
                id="flow-name"
                placeholder="Ex: Fluxo Grátis Henrique"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                data-testid="input-new-flow-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              data-testid="button-cancel-create"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFlow}
              disabled={createFlowMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-confirm-create"
            >
              {createFlowMutation.isPending ? "Criando..." : "Criar Fluxo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-export-flows">
          <DialogHeader>
            <DialogTitle>Exportar Fluxos</DialogTitle>
            <DialogDescription>
              Selecione os fluxos que deseja exportar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="select-all-flows"
                checked={flows ? selectedFlowsForExport.length === flows.length : false}
                onCheckedChange={handleSelectAllFlows}
                data-testid="checkbox-select-all-flows"
              />
              <label htmlFor="select-all-flows" className="text-sm font-medium cursor-pointer">
                Selecionar todos ({flows?.length || 0})
              </label>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {flows?.map((flow) => (
                <div key={flow.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                  <Checkbox
                    id={`export-flow-${flow.id}`}
                    checked={selectedFlowsForExport.includes(flow.id)}
                    onCheckedChange={() => handleToggleFlowExport(flow.id)}
                    data-testid={`checkbox-export-flow-${flow.id}`}
                  />
                  <label htmlFor={`export-flow-${flow.id}`} className="flex-1 text-sm cursor-pointer">
                    {flow.name}
                  </label>
                  <span className={`text-xs px-2 py-0.5 rounded ${flow.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {flow.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              data-testid="button-cancel-export"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExportSelectedFlows}
              disabled={selectedFlowsForExport.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-confirm-export"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar ({selectedFlowsForExport.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
