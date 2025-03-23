# DELETE - Fichiers obsolètes ou inutilisés

## Fichiers redondants ou obsolètes

- **`src/components/card/ImprovedCard.jsx`**

  - Redondant avec `src/components/card/Card.jsx`
  - Les deux implémentent des fonctionnalités similaires, mais ImprovedCard n'est pas largement utilisé

- **`src/components/debug/DesignSystemDebugger.jsx`**

  - Utilitaire de débogage qui ne devrait pas être présent en production
  - Pas référencé dans les fichiers principaux de l'application

- **`src/components/map/DebugOverlay.jsx`**

  - Utilitaire temporaire pour le débogage uniquement
  - Contient des logs de débogage et n'est pas utilisé dans le code de production

- **`src/modules/combat-system-factory.js`**

  - Remplacé par les thunks Redux dans `src/redux/thunks/combatThunks.js` et `combatCycleThunks.js`
  - Les composants utilisent maintenant Redux pour la gestion du combat

- **`src/components/utils/AutoSaveHandler.jsx`**
  - Fonctionnalité désormais gérée par `src/modules/save-system.js` et les thunks Redux
  - Redondant avec les mécanismes de sauvegarde actuels

## Fichiers partiellement utilisés à nettoyer

- **`src/utils/animation.js`**

  - Contient des utilitaires dont certains ne sont pas utilisés
  - À conserver mais à nettoyer des fonctions inutilisées

- **`src/utils/handEvaluationUtils.js`**

  - Redondant avec `src/core/hand-evaluation.js`
  - Certaines fonctions sont dupliquées entre les deux fichiers

- **`src/utils/performance.js`**
  - Contient des utilitaires de développement qui ne devraient pas être présents en production
  - Nettoyer pour ne garder que les fonctionnalités essentielles

## Imports obsolètes à nettoyer dans les fichiers existants

- Dans plusieurs fichiers, des imports de composants ou utilitaires qui ne sont pas utilisés:
  - `AnimationPresets` importé mais non utilisé dans certains composants UI
  - `DESIGN_TOKENS` importé mais rarement utilisé
  - Certains hooks personnalisés importés mais jamais appelés

## Configurations et ressources inutilisées

- **`.eslintrc`**

  - Redondant avec `.eslintrc.cjs`
  - Conserver uniquement le fichier CJS qui est le format standard pour ESLint avec Vite

- **`src/TODO.md`** (vide)
  - Fichier vide qui peut être supprimé et remplacé par ce TODO.md plus complet

## Code commenté à nettoyer

- De nombreux fichiers contiennent des blocs de code commentés qui devraient être supprimés:
  - `src/components/combat/CombatInterface.jsx` contient du code de débogage commenté
  - `src/redux/middleware/bonusEffectsMiddleware.js` a plusieurs sections de code expérimental commenté
  - `src/redux/thunks/combatThunks.js` contient des approches alternatives commentées

## Ressources inutilisées

- Plusieurs fichiers dans les composants UI importent des ressources qui ne sont pas réellement utilisées
- Certains composants importent l'ensemble du Design System mais n'utilisent que quelques éléments
