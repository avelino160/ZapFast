import Sidebar from "@/components/sidebar";
import { Lock } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border pl-14 pr-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Integrações</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Em Breve</h2>
            <p className="text-lg text-muted-foreground">
              Novas integrações estão chegando em breve!
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
