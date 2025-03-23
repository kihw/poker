# BUGS - Analyse du code

## Problèmes Critiques

- ⚠️ Gestion incorrecte des dégâts de l'ennemi dans `combatThunks.js` - La fonction `processEnemyAttack` appelle `enemyAction` qui met à jour le journal de combat, mais n'inflige pas directement les dégâts. Une ligne distincte avec `dispatch(takeDamage(enemy.attack))` est nécessaire.
- ⚠️ Problèmes de persistance des données dans Redux - Les données de sauvegarde chargées dans certains slices comme `event` n'ont pas de handlers `LOAD_SAVED_DATA` pour restaurer correctement l'état.
- ⚠️ Fuite de mémoire dans le composant `BonusCardManager` - Les listeners d'événements et les timeouts dans les effets ne sont pas nettoyés.
- ⚠️ Références circulaires dans la gestion des effets de cartes bonus entre les modules `bonusEffectsMiddleware.js` et les thunks/slices associés.

## Problèmes Modérés

- 🚩 Incohérences dans la gestion des états entre `combat/startCombat` et `startCombatFromNode` - Des initialisations d'état différentes causent des comportements imprévisibles.
- 🚩 Code dupliqué pour la génération d'ennemis - La fonction `generateEnemy` est définie à la fois dans `combatThunks.js` et `combatCycleThunks.js`.
- 🚩 Gestion incorrecte des erreurs dans `apiUtils.js` - Les erreurs sont propagées mais certains composants ne les attrapent pas correctement.
- 🚩 Inconsistances dans les noms des actions Redux - Certaines actions utilisent le format verbe/nom, d'autres non, ce qui rend le débogage difficile.
- 🚩 Le composant `BonusCardManager` est trop volumineux et difficile à maintenir - Plus de 300 lignes avec trop de responsabilités.
- 🚩 Re-renders inutiles dans les composants UI du fait d'une utilisation incorrecte des hooks `useCallback` et `useMemo`.
- 🚩 Duplication de logique entre les différents composants de carte (`Card.jsx`, `ImprovedCard.jsx`).

## Problèmes Mineurs

- ℹ️ Messages de débogage nombreux persistants dans la production - Nombreux `console.log` devraient être supprimés ou conditionnels.
- ℹ️ Inconsistances dans l'internationalisation - Certains textes sont en français, d'autres en anglais.
- ℹ️ La gestion d'état Redux n'utilise pas de sélecteurs pour tous les composants, entraînant des abonnements inutiles au store.
- ℹ️ Le composant `Icons` dans `DesignSystem.jsx` contient un mélange d'emojis et de SVG, ce qui est incohérent.
- ℹ️ La gestion des événements manque de validation des entrées utilisateurs, particulièrement dans les modules d'événements.
- ℹ️ Utilisation inefficace de la mémoire lors du tri des cartes dans `Hand.jsx` - Les indices originaux sont stockés plutôt que les références directes.
- ℹ️ Absence de tests pour les fonctions critiques comme l'évaluation des mains de poker ou le système de combat.
- ℹ️ L'implémentation du module de sauvegarde n'a pas de gestion de versions, ce qui pourrait poser problème lors des mises à jour.
