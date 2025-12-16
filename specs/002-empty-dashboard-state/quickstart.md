# Quickstart: État vide du dashboard

## Contexte

Le dashboard actuel affiche "Chargement..." indéfiniment quand un utilisateur n'a pas de copropriété. Cette feature ajoute un état vide adapté.

## Fichiers à modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/components/dashboard/EmptyState.tsx` | CREATE | Composant réutilisable pour états vides |
| `src/app/(dashboard)/dashboard/page.tsx` | MODIFY | Ajouter condition pour état vide |
| `tests/e2e/dashboard-empty.spec.ts` | CREATE | Tests E2E |

## Hook existant

```typescript
const { coproprietes, loading, error, refresh } = useCopropriete();
```

- `coproprietes`: tableau des copropriétés de l'utilisateur
- `loading`: true pendant le chargement
- `error`: message d'erreur si échec
- `refresh`: fonction pour recharger

## Condition à ajouter

```typescript
// Après le loading, si pas de copropriété
if (!loading && coproprietes.length === 0) {
  return <EmptyState ... />;
}

// Gestion erreur
if (error) {
  return <ErrorState message={error} onRetry={refresh} />;
}
```

## Workflow TDD

1. Écrire test E2E (RED)
2. Créer composant EmptyState (GREEN)
3. Modifier dashboard (GREEN)
4. Vérifier tests passent
5. Refactor si nécessaire
