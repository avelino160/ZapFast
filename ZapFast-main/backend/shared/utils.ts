/**
 * Capitaliza a primeira letra de uma string
 * @param str - String para capitalizar
 * @returns String com primeira letra maiúscula
 */
export function capitalizeFirst(str: string | null | undefined): string {
  if (!str || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitaliza a primeira letra de cada palavra
 * @param str - String para capitalizar
 * @returns String com primeira letra de cada palavra maiúscula
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str || str.length === 0) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formata o nome completo do usuário com capitalização
 * @param firstName - Primeiro nome
 * @param lastName - Sobrenome (opcional)
 * @param nickname - Apelido (opcional)
 * @returns Nome formatado
 */
export function formatUserName(
  firstName: string | null | undefined,
  lastName?: string | null | undefined,
  nickname?: string | null | undefined
): string {
  // Se houver apelido, usar ele (capitalizado)
  if (nickname && nickname.trim()) {
    return capitalizeFirst(nickname.trim());
  }
  
  // Senão, usar firstName (capitalizado)
  if (firstName && firstName.trim()) {
    const formattedFirst = capitalizeFirst(firstName.trim());
    
    // Se houver lastName, adicionar também (capitalizado)
    if (lastName && lastName.trim()) {
      const formattedLast = capitalizeFirst(lastName.trim());
      return `${formattedFirst} ${formattedLast}`;
    }
    
    return formattedFirst;
  }
  
  return 'Usuário';
}

/**
 * Formata o nome para exibição na dashboard (apenas primeiro nome ou apelido)
 * @param firstName - Primeiro nome
 * @param nickname - Apelido (opcional)
 * @returns Nome formatado para dashboard
 */
export function formatDashboardName(
  firstName: string | null | undefined,
  nickname?: string | null | undefined
): string {
  // Priorizar apelido se existir
  if (nickname && nickname.trim()) {
    return capitalizeFirst(nickname.trim());
  }
  
  // Senão, usar apenas o primeiro nome
  if (firstName && firstName.trim()) {
    return capitalizeFirst(firstName.trim());
  }
  
  return 'Usuário';
}
