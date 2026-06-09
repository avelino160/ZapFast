import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          // Limpar localStorage
          localStorage.removeItem("demo_logged_in");
          localStorage.removeItem("demo_user_email");
          localStorage.removeItem("demo_user_name");
          localStorage.removeItem("demo_user_surname");
          localStorage.removeItem("demo_login_timestamp");
          localStorage.removeItem("demo_user_id");
          
          setLocation("/login");
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setLocation("/login");
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
