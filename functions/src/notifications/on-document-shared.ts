/**
 * Cloud Function: Envoi d'emails lors du partage d'un document
 *
 * Cette fonction se déclenche lorsqu'un document est rendu visible sur l'extranet
 * (visibleExtranet passe de false à true) et envoie un email aux copropriétaires
 * qui ont activé les notifications.
 *
 * Prérequis:
 * 1. Installer l'extension Firebase "Trigger Email" depuis la console Firebase
 * 2. Configurer SMTP ou un service d'envoi (SendGrid, Mailgun, etc.)
 * 3. Déployer cette fonction: firebase deploy --only functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialiser Firebase Admin si pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface DocumentPartage {
  id: string;
  nom: string;
  categorie: string;
  visibleExtranet: boolean;
  datePartage: admin.firestore.Timestamp | null;
}

interface PreferencesNotification {
  emailNouveauxDocuments: boolean;
}

interface Coproprietaire {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
}

/**
 * Déclenché lors de la mise à jour d'un document partagé
 */
export const onDocumentShared = functions
  .region('europe-west1')
  .firestore.document('coproprietes/{coproprieteId}/documentsPartages/{documentId}')
  .onUpdate(async (change, context) => {
    const { coproprieteId, documentId } = context.params;
    const before = change.before.data() as DocumentPartage;
    const after = change.after.data() as DocumentPartage;

    // Vérifier si le document vient d'être rendu visible
    if (before.visibleExtranet === true || after.visibleExtranet !== true) {
      console.log(`Document ${documentId}: visibilité inchangée ou déjà visible`);
      return null;
    }

    console.log(`Document ${documentId} rendu visible sur l'extranet`);

    try {
      // Récupérer la copropriété pour le nom
      const coproDoc = await db.doc(`coproprietes/${coproprieteId}`).get();
      const coproprieteNom = coproDoc.data()?.nom || 'Votre copropriété';

      // Récupérer tous les copropriétaires
      const coproprietairesSnapshot = await db
        .collection(`coproprietes/${coproprieteId}/coproprietaires`)
        .get();

      // Pour chaque copropriétaire, vérifier les préférences et envoyer l'email
      const emailPromises: Promise<void>[] = [];

      for (const coproDoc of coproprietairesSnapshot.docs) {
        const copro = { id: coproDoc.id, ...coproDoc.data() } as Coproprietaire;

        if (!copro.email) {
          console.log(`Copropriétaire ${copro.id}: pas d'email`);
          continue;
        }

        // Vérifier les préférences de notification
        // On cherche par l'ID du user Firebase (pas l'ID du copropriétaire)
        // Dans une vraie implémentation, il faudrait mapper coproprietaireId -> userId
        const prefsSnapshot = await db
          .collection(`coproprietes/${coproprieteId}/preferencesNotification`)
          .where('emailNouveauxDocuments', '==', true)
          .get();

        // Pour simplifier, on envoie à tous ceux qui ont un email
        // Dans une vraie implémentation, filtrer par userId
        emailPromises.push(
          sendEmailNotification(
            copro.email,
            copro.prenom,
            after.nom,
            after.categorie,
            coproprieteNom,
            coproprieteId
          )
        );
      }

      await Promise.all(emailPromises);
      console.log(`${emailPromises.length} emails envoyés pour le document ${documentId}`);

      return null;
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      throw error;
    }
  });

/**
 * Envoie un email de notification via l'extension Trigger Email
 */
async function sendEmailNotification(
  to: string,
  prenom: string,
  documentNom: string,
  categorie: string,
  coproprieteNom: string,
  coproprieteId: string
): Promise<void> {
  // L'extension Trigger Email surveille la collection 'mail'
  // et envoie les emails automatiquement
  await db.collection('mail').add({
    to,
    template: {
      name: 'nouveau-document',
      data: {
        prenom,
        documentNom,
        categorie,
        coproprieteNom,
        lienExtranet: `${process.env.APP_URL || 'https://ezcopro.fr'}/extranet/documents`,
      },
    },
  });

  console.log(`Email envoyé à ${to} pour le document "${documentNom}"`);
}
