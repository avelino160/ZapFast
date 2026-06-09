import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import StarfieldBackground from "@/components/starfield-background";
import { useSessionCheck } from "@/hooks/use-session";
import { ProtectedRoute } from "@/components/protected-route";
import Dashboard from "@/pages/dashboard";
import WhatsAppConnection from "@/pages/whatsapp-connection";
import FlowBuilder from "@/pages/flow-builder";
import FlowEditor from "@/pages/flow-editor";
import Contacts from "@/pages/contacts";
import Campaigns from "@/pages/campaigns";
import BulkMessages from "@/pages/bulk-messages";
import ChatbotAI from "@/pages/chatbot-ai";
import Analytics from "@/pages/analytics";
import Plans from "@/pages/plans";
import Settings from "@/pages/settings";
import Integrations from "@/pages/integrations";
import Login from "@/pages/login";
import BlockedPage from "@/pages/blocked";
import Referral from "@/pages/referral";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  planType: string;
  planExpiresAt: string | null;
  isBlocked: boolean;
};

function BlockedUserCheck({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/me"],
    retry: false,
  });

  useEffect(() => {
    if (user?.isBlocked && location !== '/blocked' && location !== '/plans') {
      setLocation('/blocked');
    }
  }, [user, location, setLocation]);

  return <>{children}</>;
}

function Router() {
  const [location, setLocation] = useLocation();

  // Verificar expiração de sessão a cada minuto
  useSessionCheck();

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute><BlockedUserCheck><Dashboard /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/whatsapp-connection">
        <ProtectedRoute><BlockedUserCheck><WhatsAppConnection /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/flow-builder">
        <ProtectedRoute><BlockedUserCheck><FlowBuilder /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/disparos">
        <ProtectedRoute><BlockedUserCheck><Campaigns /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/disparos-massa">
        <ProtectedRoute><BlockedUserCheck><BulkMessages /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/chatbot-ai">
        <ProtectedRoute><BlockedUserCheck><ChatbotAI /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/flow-editor/:id">
        <ProtectedRoute><BlockedUserCheck><FlowEditor /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/contacts">
        <ProtectedRoute><BlockedUserCheck><Contacts /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute><BlockedUserCheck><Analytics /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/plans">
        <ProtectedRoute><BlockedUserCheck><Plans /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><BlockedUserCheck><Settings /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/integrations">
        <ProtectedRoute><BlockedUserCheck><Integrations /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/referral">
        <ProtectedRoute><BlockedUserCheck><Referral /></BlockedUserCheck></ProtectedRoute>
      </Route>
      <Route path="/blocked">
        <ProtectedRoute><BlockedPage /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const { theme } = useTheme();
  return (
    <>
      {theme === "dark" && <StarfieldBackground />}
      <div className="relative z-10">
        <Router />
      </div>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsProvider>
          <TooltipProvider>
            <AppInner />
          </TooltipProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
