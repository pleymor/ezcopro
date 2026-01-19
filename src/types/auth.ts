// Types pour l'authentification et les rôles

/**
 * Rôles utilisateur dans l'application
 * - syndic: Gestionnaire de copropriété (accès complet)
 * - coproprietaire: Copropriétaire avec accès extranet limité
 */
export type UserRole = 'syndic' | 'coproprietaire';

/**
 * Custom Claims Firebase pour la gestion des rôles
 * Ces claims sont définis par une Cloud Function lors de l'acceptation d'invitation
 */
export interface CustomClaims {
  role: UserRole;
  // ID du copropriétaire lié (uniquement pour rôle coproprietaire)
  coproprietaireId?: string;
  // ID de la copropriété
  coproprieteId: string;
}

/**
 * Utilisateur authentifié avec ses claims
 */
export interface AuthUserWithClaims {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  claims: CustomClaims | null;
}

/**
 * Vérifie si l'utilisateur est un syndic
 */
export function isSyndic(claims: CustomClaims | null): boolean {
  return claims?.role === 'syndic';
}

/**
 * Vérifie si l'utilisateur est un copropriétaire
 */
export function isCoproprietaire(claims: CustomClaims | null): boolean {
  return claims?.role === 'coproprietaire';
}
