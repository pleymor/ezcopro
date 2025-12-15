/**
 * Formate un montant en centimes vers euros
 * @param cents Montant en centimes (ex: 1050 = 10.50€)
 * @returns Chaîne formatée en euros (ex: "10,50 €")
 */
export const formatEuros = (cents: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
};

/**
 * Formate une date en format français
 * @param date Date ou timestamp Firestore
 * @returns Chaîne formatée (ex: "15 déc. 2025")
 */
export const formatDate = (date: Date | { seconds: number; nanoseconds: number }): string => {
  const d = 'seconds' in date ? new Date(date.seconds * 1000) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

/**
 * Formate une date avec l'heure
 * @param date Date ou timestamp Firestore
 * @returns Chaîne formatée (ex: "15 déc. 2025 à 14:30")
 */
export const formatDateTime = (date: Date | { seconds: number; nanoseconds: number }): string => {
  const d = 'seconds' in date ? new Date(date.seconds * 1000) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Formate un pourcentage de tantièmes
 * @param tantiemes Tantièmes du lot
 * @param total Total des tantièmes de la copropriété
 * @returns Chaîne formatée (ex: "15,00 %")
 */
export const formatTantiemesPercent = (tantiemes: number, total: number): string => {
  if (total === 0) return '0,00 %';
  const percent = (tantiemes / total) * 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percent / 100);
};

/**
 * Convertit un montant en euros vers centimes
 * @param euros Montant en euros (ex: 10.50)
 * @returns Montant en centimes (ex: 1050)
 */
export const eurosToCents = (euros: number): number => {
  return Math.round(euros * 100);
};

/**
 * Convertit un montant en centimes vers euros
 * @param cents Montant en centimes (ex: 1050)
 * @returns Montant en euros (ex: 10.50)
 */
export const centsToEuros = (cents: number): number => {
  return cents / 100;
};

/**
 * Alias pour formatEuros (compatibilité)
 */
export const formatCurrency = formatEuros;

/**
 * Formate une date de manière relative (ex: "il y a 2 heures")
 * @param date Date ou timestamp Firestore
 * @returns Chaîne formatée relative
 */
export const formatRelativeDate = (
  date: Date | { seconds: number; nanoseconds: number }
): string => {
  const d = 'seconds' in date ? new Date(date.seconds * 1000) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "À l'instant";
  }
  if (diffMin < 60) {
    return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  }
  if (diffHour < 24) {
    return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
  }
  if (diffDay < 7) {
    return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
  }

  // Au-delà d'une semaine, afficher la date complète
  return formatDateTime(d);
};
