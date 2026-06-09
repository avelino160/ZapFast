import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";
import logoDashboard from "@assets/logo-dashboard-old.png";
import pilotIcon from "@/assets/pilot-icon.png";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { IoLogoWhatsapp } from "react-icons/io";
import {
  MessageCircle,
  Filter,
  Users,
  TrendingUp,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  Smartphone,
  Rocket,
  LogOut,
  Gift,
  Zap,
  Send,
  Bot,
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useSettings();

  const handleLogout = () => {
    localStorage.removeItem("demo_logged_in");
    localStorage.removeItem("demo_user_email");
    localStorage.removeItem("demo_user_name");
    window.location.href = "/login";
  };

  if (location.startsWith("/flow-editor/")) {
    return null;
  }

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Início", key: 'dashboard' },
    { 
      href: "/whatsapp-connection", 
      icon: MessageCircle, 
      label: "Conexão", 
      key: 'whatsapp_connection' 
    },
    { href: "/flow-builder", icon: Filter, label: "Fluxos", key: 'sales_funnels' },
    { href: "/disparos-massa", icon: Send, label: "Campanhas", key: 'bulk_messages' },
    { href: "/chatbot-ai", icon: Bot, label: "Chatbot AI", key: 'chatbot_ai' },
    { href: "/contacts", icon: Users, label: "Contatos", key: 'contacts' },
    { href: "/integrations", icon: Zap, label: "Integrações", key: 'integrations' },
    { href: "/analytics", icon: TrendingUp, label: "Relatórios", key: 'reports' },
    { href: "/referral", icon: Gift, label: "Indique e Ganhe", key: 'referral' },
    { href: "/settings", icon: Settings, label: "Configurações", key: 'settings' },
    { href: "#logout", icon: LogOut, label: "Sair", key: 'logout', onClick: handleLogout },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const showMinimized = !isMobile && isMinimized;
    
    return (
      <div className="flex flex-col h-full">
        <div className="pt-2 px-4 sm:pt-3 sm:px-6 flex items-center justify-between">
          {!showMinimized && (
            <Link href="/dashboard" className="flex items-center gap-0">
              <img 
                src={pilotIcon} 
                alt="PilotZap Icon" 
                className="h-12 w-12 object-contain -mr-2"
                style={{ background: 'transparent' }}
              />
              <img 
                src={logoDashboard} 
                alt="PilotZap Logo" 
                className="h-12 w-auto object-contain cursor-pointer dark:brightness-0 dark:invert"
              />
            </Link>
          )}
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            const isLogout = item.key === 'logout';
            const Icon = item.icon;

            const content = (
              <Button
                onClick={(e) => {
                  if (isLogout) {
                    e.preventDefault();
                    handleLogout();
                  } else {
                    setIsMobileMenuOpen(false);
                  }
                }}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full ${showMinimized ? 'justify-center px-2' : 'justify-start'} ${isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-transparent hover:text-primary'} ${isLogout ? 'text-red-500 hover:text-red-600 hover:bg-red-50/10' : ''}`}
                data-testid={`button-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                title={showMinimized ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 ${showMinimized ? '' : 'mr-3'}`} />
                {!showMinimized && item.label}
              </Button>
            );

            if (isLogout) {
              return <div key={item.key}>{content}</div>;
            }

            return (
              <Link key={item.href} href={item.href}>
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Botão de Suporte ao Cliente */}
        <div className="px-4 pb-4 mt-auto">
          <Button
            onClick={() => {
              const userName = localStorage.getItem("demo_user_name") || "Usuário";
              const userEmail = localStorage.getItem("demo_user_email") || "email@exemplo.com";
              const message = encodeURIComponent(
                `Olá, Meu nome é ${userName} e meu e-mail de cadastro na PilotZap é ${userEmail}. Preciso de ajuda com [descreva brevemente o problema]. Poderiam me auxiliar, por favor? Obrigado!`
              );
              window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
              setIsMobileMenuOpen(false);
            }}
            variant="outline"
            className={`w-full ${showMinimized ? 'justify-center px-2' : 'justify-start'} bg-green-500 text-white border-green-600 hover:bg-green-500 hover:text-white hover:border-green-600`}
            data-testid="button-customer-support"
            title={showMinimized ? "Suporte ao Cliente" : undefined}
          >
            <IoLogoWhatsapp className={`h-5 w-5 ${showMinimized ? '' : 'mr-3'}`} />
            {!showMinimized && "Suporte ao Cliente"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed top-3 left-3 z-40 h-7 w-7 p-0 bg-card border border-border shadow-md hover:bg-primary/20 hover:text-primary rounded-md"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-3.5 w-3.5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="bg-card flex flex-col h-full">
            <SidebarContent isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex bg-card border-r border-border flex-col transition-all duration-300 ${isMinimized ? 'w-16' : 'w-64'}`}>
        <SidebarContent isMobile={false} />
      </div>
    </>
  );
}
