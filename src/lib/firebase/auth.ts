import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  getIdTokenResult as firebaseGetIdTokenResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
  IdTokenResult,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Déclenche le flow OAuth2 Google
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
  };
};

/**
 * Déconnecte l'utilisateur
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Observe les changements d'état d'authentification
 */
export const onAuthStateChanged = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  return firebaseOnAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Retourne l'utilisateur courant
 */
export const getCurrentUser = (): AuthUser | null => {
  const firebaseUser = auth?.currentUser;
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
};

/**
 * Récupère le résultat du token ID avec les custom claims
 */
export const getIdTokenResult = async (forceRefresh = false): Promise<IdTokenResult | null> => {
  const firebaseUser = auth?.currentUser;
  if (!firebaseUser) return null;
  return firebaseGetIdTokenResult(firebaseUser, forceRefresh);
};

/**
 * Crée un compte avec email et mot de passe
 */
export const createAccountWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
  };
};

/**
 * Connecte un utilisateur avec email et mot de passe
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
  };
};

/**
 * Supprime le compte de l'utilisateur actuellement connecté
 */
export const deleteCurrentAccount = async (): Promise<void> => {
  const firebaseUser = auth?.currentUser;
  if (!firebaseUser) {
    throw new Error('Aucun utilisateur connecté');
  }
  await firebaseUser.delete();
};
