# Quickstart: Configuration du déploiement Vercel

Ce guide explique comment configurer le déploiement automatique d'EzCopro sur Vercel via le repo d'infrastructure.

## Architecture

```
ezcopro (push sur main)
    │
    ▼ trigger-deploy.yml
    │
    ▼ repository_dispatch (event: deploy-pwa)
    │
ezcopro-infra
    │
    ▼ vercel-deploy.yml
    │
    ▼ Vercel (production)
```

## Prérequis

- [x] Workflow `vercel-deploy.yml` dans `ezcopro-infra` (déjà configuré)
- [x] Workflow `trigger-deploy.yml` dans `ezcopro` (créé par ce plan)
- [ ] Secret `INFRA_REPO_PAT` dans le repo `ezcopro`
- [ ] Secret `VERCEL_TOKEN` dans le repo `ezcopro-infra`

## Étape 1: Créer le Personal Access Token (PAT)

1. Aller sur [github.com/settings/tokens](https://github.com/settings/tokens)
2. Cliquer **"Generate new token"** → **"Generate new token (classic)"**
3. Configurer :
   - **Note** : `ezcopro-deploy-trigger`
   - **Expiration** : 90 days (ou plus selon préférence)
   - **Scopes** : cocher `repo` (accès complet aux repos privés)
4. Cliquer **"Generate token"**
5. **Copier le token** (il ne sera plus visible après)

## Étape 2: Ajouter le secret dans ezcopro

1. Aller sur [github.com/pleymor/ezcopro/settings/secrets/actions](https://github.com/pleymor/ezcopro/settings/secrets/actions)
2. Cliquer **"New repository secret"**
3. Configurer :
   - **Name** : `INFRA_REPO_PAT`
   - **Secret** : coller le token créé à l'étape 1
4. Cliquer **"Add secret"**

## Étape 3: Vérifier le secret Vercel dans ezcopro-infra

1. Aller sur [github.com/pleymor/ezcopro-infra/settings/secrets/actions](https://github.com/pleymor/ezcopro-infra/settings/secrets/actions)
2. Vérifier que `VERCEL_TOKEN` existe
3. Si non, le créer avec un token Vercel depuis [vercel.com/account/tokens](https://vercel.com/account/tokens)

## Étape 4: Test du déploiement

1. Faire un commit sur `ezcopro` et push sur `main` :
   ```bash
   git checkout main
   git commit --allow-empty -m "test: trigger vercel deploy"
   git push
   ```

2. Vérifier sur GitHub Actions :
   - [ezcopro Actions](https://github.com/pleymor/ezcopro/actions) : `Trigger Vercel Deploy` doit être vert
   - [ezcopro-infra Actions](https://github.com/pleymor/ezcopro-infra/actions) : `Vercel Deploy` doit se déclencher

3. Vérifier le déploiement Vercel :
   - Le workflow `vercel-deploy.yml` affiche l'URL de production

## Dépannage

### Le workflow trigger-deploy échoue avec 401/403

- Le secret `INFRA_REPO_PAT` est manquant ou invalide
- Le PAT a expiré
- Le PAT n'a pas le scope `repo`

### Le workflow vercel-deploy ne se déclenche pas

- Vérifier que `event_type` correspond (`deploy-pwa`)
- Vérifier les logs du workflow `trigger-deploy` pour voir la réponse de l'API

### Le déploiement Vercel échoue

- Vérifier que `VERCEL_TOKEN` est configuré dans `ezcopro-infra`
- Vérifier les variables d'environnement Vercel (VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- Consulter les logs du workflow `vercel-deploy`

## Fichiers concernés

| Repo | Fichier | Rôle |
|------|---------|------|
| `ezcopro` | `.github/workflows/trigger-deploy.yml` | Déclenche le déploiement |
| `ezcopro-infra` | `.github/workflows/vercel-deploy.yml` | Exécute le déploiement Vercel |

## Sécurité

- Le PAT doit avoir le **minimum de permissions nécessaires** (scope `repo` uniquement)
- Configurer une **expiration** sur le PAT et le renouveler régulièrement
- Ne jamais committer de tokens dans le code
