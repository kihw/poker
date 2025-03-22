# BUGS - Analyse du code

## Problèmes Critiques

- [ ] ⚠️ Fuite de mémoire dans le composant `UserList` (listeners non nettoyés).
- [ ] ⚠️ Mauvaise gestion des erreurs API (absence de try/catch sur certaines requêtes).

## Problèmes Modérés

- [ ] 🚩 Composant `ProductCard` trop volumineux, nécessite un découpage.
- [ ] 🚩 Re-renders inutiles à cause de `props` non mémorisées.
- [ ] 🚩 Duplication de logique entre plusieurs composants (ex : `fetchData`).

## Problèmes Facultatifs

- [ ] ℹ️ Optimisation possible avec `React.memo` sur certains composants.
- [ ] ℹ️ Absence de typage stricte sur certaines props (si TypeScript).
- [ ] ℹ️ Manque de cohérence dans la structure des dossiers (mélange vues / composants).
