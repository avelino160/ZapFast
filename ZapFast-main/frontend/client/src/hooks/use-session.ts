import { useEffect } from 'react';
import { useLocation } from 'wouter';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

export function useSessionCheck() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkSession = () => {
      const isLoggedIn = localStorage.getItem('demo_logged_in');
      const loginTimestamp = localStorage.getItem('demo_login_timestamp');

      if (isLoggedIn === 'true' && loginTimestamp) {
        const currentTime = Date.now();
        const loginTime = parseInt(loginTimestamp, 10);
        const timeDiff = currentTime - loginTime;

        // Se passou mais de 24 horas, fazer logout
        if (timeDiff > SESSION_DURATION) {
          localStorage.removeItem('demo_logged_in');
          localStorage.removeItem('demo_user_email');
          localStorage.removeItem('demo_user_name');
          localStorage.removeItem('demo_user_surname');
          localStorage.removeItem('demo_login_timestamp');
          setLocation('/login');
        }
      }
    };

    // Verificar imediatamente
    checkSession();

    // Verificar a cada minuto
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, [setLocation]);
}
