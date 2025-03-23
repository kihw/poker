# BUGS - Analyse du code

## Problèmes Critiques

- [x] ⚠️ Fuite de mémoire dans le composant `UserList` (listeners non nettoyés).
- [x] ⚠️ Mauvaise gestion des erreurs API (absence de try/catch sur certaines requêtes).

## Problèmes Modérés

- [x] 🚩 Composant `ProductCard` trop volumineux, nécessite un découpage.
- [x] 🚩 Re-renders inutiles à cause de `props` non mémorisées.
- [x] 🚩 Duplication de logique entre plusieurs composants (ex : `fetchData`).

## Problèmes Facultatifs

- [x] ℹ️ Optimisation possible avec `React.memo` sur certains composants.
- [ ] ℹ️ Absence de typage stricte sur certaines props (si TypeScript).
- [ ] ℹ️ Manque de cohérence dans la structure des dossiers (mélange vues / composants).
