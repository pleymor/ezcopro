/**
 * Templates d'email pour l'extension Firebase Trigger Email
 *
 * Ces templates doivent être ajoutés dans la collection 'email_templates' de Firestore.
 * Voir: https://firebase.google.com/docs/extensions/official/firestore-send-email
 *
 * Pour les ajouter, exécuter le script seed-email-templates.ts ou les créer manuellement
 * dans la console Firebase.
 */

export const EMAIL_TEMPLATES = {
  'nouveau-document': {
    subject: '📄 Nouveau document disponible - {{coproprieteNom}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau document disponible</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .document-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .document-name {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .document-category {
      display: inline-block;
      background: #e0e7ff;
      color: #3730a3;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 20px;
    }
    .cta-button:hover {
      background: #2563eb;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .footer a {
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 Nouveau document disponible</h1>
  </div>

  <div class="content">
    <p>Bonjour {{prenom}},</p>

    <p>Un nouveau document a été partagé par votre syndic sur l'extranet de <strong>{{coproprieteNom}}</strong>.</p>

    <div class="document-card">
      <div class="document-name">{{documentNom}}</div>
      <span class="document-category">{{categorie}}</span>
    </div>

    <p>Vous pouvez consulter ce document et le télécharger depuis votre espace copropriétaire.</p>

    <center>
      <a href="{{lienExtranet}}" class="cta-button">Consulter le document</a>
    </center>
  </div>

  <div class="footer">
    <p>Cet email a été envoyé automatiquement par EzCopro.</p>
    <p>
      Vous recevez cet email car vous avez activé les notifications pour les nouveaux documents.<br>
      <a href="{{lienExtranet}}/preferences">Gérer mes préférences de notification</a>
    </p>
  </div>
</body>
</html>
    `,
    text: `
Bonjour {{prenom}},

Un nouveau document a été partagé par votre syndic sur l'extranet de {{coproprieteNom}}.

Document: {{documentNom}}
Catégorie: {{categorie}}

Consultez ce document sur votre espace copropriétaire:
{{lienExtranet}}

---
Cet email a été envoyé automatiquement par EzCopro.
Pour gérer vos préférences de notification: {{lienExtranet}}/preferences
    `,
  },
};

/**
 * Script pour ajouter les templates dans Firestore
 * À exécuter une fois lors du setup du projet
 */
export async function seedEmailTemplates(db: FirebaseFirestore.Firestore): Promise<void> {
  const batch = db.batch();

  for (const [templateName, template] of Object.entries(EMAIL_TEMPLATES)) {
    const docRef = db.collection('email_templates').doc(templateName);
    batch.set(docRef, template);
  }

  await batch.commit();
  console.log('Email templates seeded successfully');
}
