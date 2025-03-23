# TODO - Améliorations à implémenter

## Corrections Prioritaires

- [ ] **Corriger la gestion des dégâts ennemis**

  - Unifier la logique de dégâts dans `combatThunks.js` et `combatCycleThunks.js`
  - S'assurer que `takeDamage` est toujours appelé après `enemyAction`

- [ ] **Résoudre les fuites mémoire**

  - Ajouter un nettoyage approprié des listeners dans `BonusCardManager`
  - Vérifier tous les composants utilisant `useEffect` pour s'assurer qu'ils retournent une fonction de nettoyage

- [ ] **Implémenter les handlers manquants LOAD_SAVED_DATA**
  - Ajouter le handler pour le slice `event`
  - Standardiser le processus de chargement dans tous les slices

## Refactorisation et Améliorations

- [ ] **Repenser l'architecture des effets de cartes bonus**

  - Centraliser la logique dans un seul endroit
  - Utiliser le pattern d'inversion de dépendances pour éviter les références circulaires

- [ ] **Améliorer la gestion des états**

  - Déconstruire les gros composants comme `BonusCardManager` en composants plus petits
  - Utiliser des hooks personnalisés pour extraire la logique métier des composants

- [ ] **Unifier le système de cartes**

  - Fusionner `Card.jsx` et `ImprovedCard.jsx` en un seul composant
  - Standardiser l'API des composants de carte

- [ ] **Optimiser les performances de rendu**
  - Revoir tous les hooks `useMemo` et `useCallback` pour optimiser correctement les dépendances
  - Utiliser `React.memo` de manière cohérente sur les composants purs

## Nouvelles fonctionnalités

- [ ] **Système de progression amélioré**

  - Ajouter un système de talents ou de spécialisation pour le joueur
  - Implémentation d'un arbre de compétences

- [ ] **Internationalisation complète**

  - Extraire tous les textes dans des fichiers de localisation
  - Ajouter un sélecteur de langue dans les paramètres

- [ ] **Système de tuto interactif**

  - Refaire le tutoriel pour le rendre plus interactif
  - Ajouter des astuces contextuelles

- [ ] **Amélioration du système de quêtes**

  - Ajouter des quêtes secondaires avec des récompenses uniques
  - Implémenter un journal de quêtes

- [ ] **Nouvelles mécaniques de jeu**
  - Système de synergies entre les cartes bonus
  - Mécanismes d'affinité entre les types de cartes

## Améliorations techniques

- [ ] **Tests automatisés**

  - Ajouter des tests unitaires pour les fonctions critiques
  - Implémenter des tests d'intégration pour les flux principaux

- [ ] **Améliorer le système de sauvegarde**

  - Ajouter la gestion des versions de sauvegarde
  - Implémenter une sauvegarde cloud (optionnel)

- [ ] **Optimisations de performances**

  - Revoir les algorithmes d'évaluation de mains pour plus d'efficacité
  - Optimiser les requêtes Redux avec des sélecteurs mémorisés

- [ ] **Réorganisation du code**

  - Standardiser les noms des actions Redux
  - Clarifier la hiérarchie des dossiers
  - Documenter toutes les interfaces publiques

- [ ] **Gestion des erreurs améliorée**
  - Mettre en place un système centralisé de logging
  - Améliorer les messages d'erreur pour l'utilisateur
