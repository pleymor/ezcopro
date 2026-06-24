# Gestion des Accès - GED ezcopro

Ce document décrit le système de contrôle d'accès pour la Gestion Électronique de Documents (GED) d'ezcopro.

## Table des matières

1. [Niveaux d'accès](#niveaux-daccès)
2. [Matrice des permissions](#matrice-des-permissions)
3. [Héritage des droits](#héritage-des-droits)
4. [Cas limites](#cas-limites)
5. [Implémentation technique](#implémentation-technique)

---

## Niveaux d'accès

Le système utilise trois niveaux d'accès hiérarchiques, du plus restrictif au plus permissif :

| Niveau | Identifiant | Description | Icône |
|--------|-------------|-------------|-------|
| **Syndic seul** | `syndic` | Documents confidentiels réservés au gestionnaire | 🔒 Lock |
| **Conseil syndical** | `conseil` | Documents accessibles aux membres du conseil et au syndic | 👥 Users |
| **Tous copropriétaires** | `tous` | Documents publics visibles par tous | 🌐 Globe |

### Définition des rôles

#### Syndic
- Gestionnaire professionnel ou bénévole de la copropriété
- Accès complet à tous les documents et dossiers
- Peut créer, modifier, supprimer tout élément
- Peut gérer les membres du conseil syndical

#### Membre du conseil syndical
- Copropriétaire désigné par le syndic comme membre du conseil
- Accès aux documents `conseil` et `tous`
- Ne peut pas créer/modifier de documents (lecture seule sur extranet)
- Peut être désigné président du conseil

#### Copropriétaire standard
- Propriétaire d'un ou plusieurs lots
- Accès uniquement aux documents `tous`
- Consultation en lecture seule sur l'extranet

---

## Matrice des permissions

### Accès aux documents

| Niveau document | Syndic | Conseil Syndical | Copropriétaire |
|-----------------|:------:|:----------------:|:--------------:|
| `syndic`        | ✅ Oui | ❌ Non           | ❌ Non         |
| `conseil`       | ✅ Oui | ✅ Oui           | ❌ Non         |
| `tous`          | ✅ Oui | ✅ Oui           | ✅ Oui         |

### Accès aux dossiers

| Niveau dossier | Syndic | Conseil Syndical | Copropriétaire |
|----------------|:------:|:----------------:|:--------------:|
| `syndic`       | ✅ Visible | ❌ Masqué    | ❌ Masqué      |
| `conseil`      | ✅ Visible | ✅ Visible   | ❌ Masqué      |
| `tous`         | ✅ Visible | ✅ Visible   | ✅ Visible     |

### Actions par rôle

| Action | Syndic | Conseil | Copropriétaire |
|--------|:------:|:-------:|:--------------:|
| Créer un dossier | ✅ | ❌ | ❌ |
| Renommer un dossier | ✅ | ❌ | ❌ |
| Supprimer un dossier | ✅ | ❌ | ❌ |
| Changer le niveau d'accès | ✅ | ❌ | ❌ |
| Uploader un document | ✅ | ❌ | ❌ |
| Déplacer un document | ✅ | ❌ | ❌ |
| Télécharger un document | ✅ | ✅* | ✅* |
| Supprimer un document | ✅ | ❌ | ❌ |

*Selon le niveau d'accès du document

---

## Héritage des droits

### Création de sous-dossiers

Lors de la création d'un sous-dossier, le niveau d'accès est hérité du dossier parent par défaut :

```
📁 Contrats (niveau: syndic)
 └── 📁 2024 (hérite: syndic par défaut)
     └── 📁 Ascenseur (hérite: syndic par défaut)
```

**Règle** : Le syndic peut modifier le niveau d'accès après création, mais ne peut pas rendre un sous-dossier plus permissif que son parent.

### Upload de documents

Lors de l'upload d'un document dans un dossier, le document hérite automatiquement du niveau d'accès du dossier :

```
📁 Documents Conseil (niveau: conseil)
 └── 📄 Budget 2025.pdf (hérite: conseil)
```

### Propagation des changements

**Important** : Le changement de niveau d'accès d'un dossier NE SE PROPAGE PAS automatiquement aux sous-dossiers et documents existants.

Raison : Éviter les modifications involontaires de permissions sur un grand nombre d'éléments.

---

## Cas limites

### 1. Document sans niveau d'accès (`niveauAcces` undefined)

**Situation** : Documents créés avant l'implémentation du système d'accès, ou documents migrés.

**Comportement** : Traité comme `tous` (accès public).

```typescript
const docAccessLevel = doc.niveauAcces || 'tous';
```

**Justification** : Principe de moindre restriction pour éviter de masquer des documents existants.

---

### 2. Membre du conseil révoqué

**Situation** : Un copropriétaire est retiré du conseil syndical.

**Comportement** : Perte immédiate de l'accès aux documents `conseil`.

**Implémentation** :
- La vérification d'appartenance au conseil est faite à chaque requête
- Pas de cache de permissions
- L'utilisateur verra disparaître les documents `conseil` dès le rafraîchissement

**Code** :
```typescript
const isConseilMember = useMemo(() => {
  if (!coproprietaireId || !membres) return false;
  return membres.some((m) => m.coproprietaireId === coproprietaireId);
}, [coproprietaireId, membres]);
```

---

### 3. Nouveau membre du conseil

**Situation** : Un copropriétaire est ajouté au conseil syndical.

**Comportement** : Accès immédiat à tous les documents `conseil` existants.

**Note** : Aucune notification n'est envoyée automatiquement. Le nouveau membre découvre les documents à sa prochaine visite.

---

### 4. Dossier parent plus restrictif que sous-dossier

**Situation** : Un dossier `syndic` contient un sous-dossier `tous`.

**Comportement** : Le sous-dossier N'EST PAS visible car le parent le masque.

**Exemple** :
```
📁 Privé Syndic (niveau: syndic) ← Copropriétaire ne voit pas
 └── 📁 Public (niveau: tous)    ← Inaccessible car parent masqué
```

**Règle** : L'accès à un dossier nécessite l'accès à TOUS ses parents.

---

### 5. Document dans dossier avec accès différent

**Situation** : Un document `tous` est dans un dossier `conseil`.

**Comportement** : Le document hérite de la visibilité du dossier, pas de son propre niveau.

**Recommandation** : Le niveau d'accès du document devrait correspondre à celui du dossier. L'interface alerte si incohérence.

---

### 6. Suppression d'un dossier non vide

**Situation** : Le syndic tente de supprimer un dossier contenant des documents ou sous-dossiers.

**Comportement** :
1. Vérification du contenu (`isFolderEmpty`)
2. Si non vide : demande de confirmation avec avertissement
3. Option "forcer la suppression" qui supprime récursivement

**Dialog** :
```
⚠️ Ce dossier n'est pas vide

Il contient des documents ou sous-dossiers qui seront également supprimés.
Cette action est irréversible.

[Annuler] [Supprimer quand même]
```

---

### 7. Utilisateur non authentifié

**Situation** : Tentative d'accès sans connexion.

**Comportement** : Redirection vers la page de connexion. Aucun document n'est chargé.

**Sécurité** : Les règles Firestore bloquent tout accès non authentifié.

---

### 8. Syndic sur l'extranet

**Situation** : Le syndic accède à l'interface extranet (prévue pour les copropriétaires).

**Comportement** : Accès complet à tous les documents, comme sur l'interface syndic.

**Justification** : Le syndic doit pouvoir vérifier ce que voient les copropriétaires.

---

### 9. Profondeur maximale de dossiers

**Situation** : Tentative de créer un 4ème niveau de dossier.

**Comportement** : Le bouton "Nouveau dossier" est masqué à partir du niveau 3.

**Constante** : `MAX_FOLDER_DEPTH = 2` (0, 1, 2 = 3 niveaux)

```typescript
// Dans CreateFolderModal
const canCreateSubfolder = currentDepth < MAX_FOLDER_DEPTH;
```

---

### 10. Copropriétaire anonymisé (RGPD)

**Situation** : Un copropriétaire demande l'anonymisation de ses données.

**Comportement** :
- Son nom devient "Ancien copropriétaire"
- S'il était membre du conseil, il est automatiquement retiré
- Les documents qu'il a consultés gardent une trace anonyme

---

### 11. Changement de copropriété

**Situation** : L'utilisateur change de copropriété sélectionnée.

**Comportement** :
- Tous les hooks se réinitialisent
- Les dossiers et documents de la nouvelle copropriété sont chargés
- L'appartenance au conseil est recalculée pour la nouvelle copropriété

---

### 12. Mode test (`NEXT_PUBLIC_TEST_MODE=true`)

**Situation** : Application en mode développement/test.

**Comportement** :
- Données mock utilisées au lieu de Firebase
- Le rôle peut être changé via localStorage (`ezcopro_test_role`)
- Les membres du conseil sont simulés

```typescript
// Pour tester en tant que copropriétaire
localStorage.setItem('ezcopro_test_role', 'coproprietaire');
localStorage.setItem('ezcopro_test_coproprietaire_id', 'test-cp-1');
```

---

## Implémentation technique

### Fichiers clés

| Fichier | Responsabilité |
|---------|----------------|
| `src/types/dossier.ts` | Type `NiveauAcces` |
| `src/hooks/useFolders.ts` | Filtrage des dossiers par accès |
| `src/hooks/useExtranetDocuments.ts` | Filtrage des documents extranet |
| `src/hooks/useConseilSyndical.ts` | Gestion des membres du conseil |
| `src/lib/firebase/services/dossier.ts` | CRUD dossiers |
| `firestore.rules` | Règles de sécurité serveur |

### Flux de vérification d'accès

```
┌─────────────────────┐
│ Requête document    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Authentification    │──── Non ───▶ Redirection login
└─────────┬───────────┘
          │ Oui
          ▼
┌─────────────────────┐
│ Récupérer rôle      │
│ (useUserRole)       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Vérifier conseil    │
│ (useConseilSyndical)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Calculer niveaux    │
│ autorisés           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Filtrer documents   │
│ par niveauAcces     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Afficher résultats  │
└─────────────────────┘
```

### Règles Firestore (extrait)

```javascript
// Dossiers - lecture
match /coproprietes/{coproId}/dossiers/{dossierId} {
  allow read: if isAuthenticated() && (
    // Syndic peut tout lire
    isSyndic(coproId) ||
    // Membre du conseil peut lire conseil et tous
    (isConseilMember(coproId) && resource.data.niveauAcces in ['conseil', 'tous']) ||
    // Copropriétaire peut lire tous uniquement
    (isCoproprietaire(coproId) && resource.data.niveauAcces == 'tous')
  );
}
```

---

## Bonnes pratiques

1. **Principe du moindre privilège** : Créer les dossiers avec le niveau `syndic` par défaut, élargir si nécessaire.

2. **Organisation cohérente** : Regrouper les documents par niveau d'accès pour éviter les incohérences.

3. **Vérification régulière** : Auditer périodiquement les membres du conseil syndical.

4. **Documentation** : Nommer clairement les dossiers pour indiquer leur nature (`Privé - Contentieux`, `Public - AG`).

---

*Document généré le 2025-01-19 pour ezcopro GED v1.0*
