# Research: Déploiement Vercel via GitHub Actions cross-repo

## Décision: Repository Dispatch vers ezcopro-infra

### Rationale

L'infrastructure de déploiement est centralisée dans le repo `ezcopro-infra`. Pour maintenir cette séparation des responsabilités, on utilise `repository_dispatch` pour déclencher le déploiement depuis `ezcopro`.

### Alternatives considérées

| Option | Avantages | Inconvénients | Verdict |
|--------|-----------|---------------|---------|
| **Repository Dispatch** | Centralisation infra, séparation claire | PAT requis | ✅ Choisi |
| **Intégration native Vercel** | Simple, zéro config | Pas de centralisation infra | ❌ Rejeté |
| **Workflow réutilisable** | DRY | Complexe, même PAT requis | ❌ Rejeté |

### Architecture choisie

```
┌─────────────────┐     repository_dispatch      ┌──────────────────┐
│    ezcopro      │ ────────────────────────────▶│  ezcopro-infra   │
│  (app source)   │      event: deploy-pwa       │ (infrastructure) │
└─────────────────┘                              └──────────────────┘
        │                                                 │
        │ push on main                                    │ vercel-deploy.yml
        ▼                                                 ▼
┌─────────────────┐                              ┌──────────────────┐
│ trigger-deploy  │                              │  Vercel Deploy   │
│    workflow     │                              │    workflow      │
└─────────────────┘                              └──────────────────┘
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │     Vercel       │
                                                 │   (production)   │
                                                 └──────────────────┘
```

## Configuration requise

### Secrets

| Secret | Repo | Description |
|--------|------|-------------|
| `INFRA_REPO_PAT` | ezcopro | PAT avec scope `repo` pour déclencher le workflow |
| `VERCEL_TOKEN` | ezcopro-infra | Token Vercel pour le déploiement |

### Workflows

| Workflow | Repo | Trigger | Action |
|----------|------|---------|--------|
| `trigger-deploy.yml` | ezcopro | `push` on `main` | Envoie `repository_dispatch` |
| `vercel-deploy.yml` | ezcopro-infra | `repository_dispatch` type `deploy-pwa` | Déploie sur Vercel |

## Payload transmis

Le workflow `trigger-deploy.yml` envoie :

```json
{
  "event_type": "deploy-pwa",
  "client_payload": {
    "ref": "main",
    "sha": "abc123...",
    "message": "feat: new feature"
  }
}
```

Le workflow `vercel-deploy.yml` utilise `client_payload.ref` pour checkout la bonne branche.

## Sécurité

- Le PAT doit avoir le scope minimal (`repo`)
- Configurer une expiration (90 jours recommandé)
- Le PAT est stocké comme secret GitHub (chiffré)
- Seuls les pushes sur `main` déclenchent le déploiement

## Conclusion

Cette approche respecte la séparation des responsabilités :
- `ezcopro` : code applicatif
- `ezcopro-infra` : infrastructure et déploiement

Le coût (PAT à gérer) est acceptable pour les bénéfices de centralisation.
