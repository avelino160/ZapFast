import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import StarfieldBackground from "@/components/starfield-background";
import Dashboard from "@/pages/dashboard";
import WhatsAppConnection from "@/pages/whatsapp-connection";
import FlowBuilder from "@/pages/flow-builder";
import FlowEditor from "@/pages/flow-editor";
import Contacts from "@/pages/contacts";
import Campaigns from "@/pages/campaigns";
import Analytics from "@/pages/analytics";
import Plans from "@/pages/plans";
import Settings from "@/pages/settings";
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
  const isLoggedIn = localStorage.getItem("demo_logged_in") === "true";

  useEffect(() => {
    if (!isLoggedIn && location !== "/" && location !== "/login") {
      setLocation("/login");
    }
  }, [isLoggedIn, location, setLocation]);

  return (
    <BlockedUserCheck>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/whatsapp-connection" component={WhatsAppConnection} />
        <Route path="/flow-builder" component={FlowBuilder} />
        <Route path="/disparos" component={Campaigns} />
        <Route path="/flow-editor/:id" component={FlowEditor} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/plans" component={Plans} />
        <Route path="/settings" component={Settings} />
        <Route path="/referral" component={Referral} />
        <Route path="/blocked" component={BlockedPage} />
        <Route component={NotFound} />
      </Switch>
    </BlockedUserCheck>
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
