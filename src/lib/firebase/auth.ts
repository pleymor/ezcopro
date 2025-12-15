import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
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
