Après avoir analysé les fichiers de code fournis, voici une liste des tâches à accomplir pour implémenter le nouveau design tout en simplifiant la structure des fichiers et en éliminant les fichiers "Improved" redondants:

# TODO: Implémentation du Design System de Poker Solo RPG

## Nettoyage des fichiers dupliqués

- [ ] Supprimer les composants "Improved" redondants et garder une seule version de chaque
  - [ ] Fusionner `ImprovedCombatInterface.jsx` avec `CombatInterface.jsx`
  - [ ] Fusionner `ImprovedEventEncounter.jsx` avec `EventEncounter.jsx`
  - [ ] Fusionner `ImprovedCard.jsx` avec `EnhancedCard.jsx`
  - [ ] Fusionner `ImprovedBonusCardManager.jsx` avec `BonusCardManager.jsx`
  - [ ] Fusionner `ImprovedRoguelikeWorldMap.jsx` avec `RoguelikeWorldMap.jsx`
  - [ ] Fusionner `ImprovedActionFeedback.jsx` avec `ActionFeedback.jsx`
  - [ ] Fusionner `ImprovedGameInterface.jsx` avec un nouveau composant `GameInterface.jsx`
  - [ ] Mettre à jour tous les imports dans les autres fichiers pour refléter ces changements

## Implémentation du Design System

- [ ] Finaliser le composant `DesignSystem.jsx` pour inclure tous les éléments nécessaires:
  - [ ] S'assurer que toutes les couleurs définies dans l'analyse sont présentes
  - [ ] Créer les composants de base (Card, Button, Badge, ProgressBar)
  - [ ] Définir les constantes pour les ombres, espacements, rayons de bordure, etc.

## Mise à jour des composants principaux

- [ ] Interface de combat

  - [ ] Mettre à jour la disposition verticale (ennemi en haut, joueur en bas)
  - [ ] Améliorer les animations d'attaque et les effets visuels
  - [ ] Ajouter des transitions fluides entre les phases de combat

- [ ] Carte du monde

  - [ ] Ajouter des styles distinctifs pour chaque type de nœud
  - [ ] Améliorer l'animation des chemins disponibles
  - [ ] Ajouter des tooltips détaillés au survol des destinations

- [ ] Système de cartes

  - [ ] Implémenter des effets visuels différents selon la rareté
  - [ ] Ajouter une prévisualisation des combinaisons possibles
  - [ ] Améliorer les animations de tirage et de sélection

- [ ] Interface utilisateur générale
  - [ ] Mettre en place un header cohérent sur toutes les pages
  - [ ] Créer un footer unifié avec les contrôles de navigation
  - [ ] Assurer la cohérence des couleurs et styles à travers l'application

## Hiérarchie de l'interface selon l'analyse

- [ ] Structurer les éléments critiques (toujours visibles)

  - [ ] Barre d'état du joueur avec PV, bouclier, or et niveau
  - [ ] Indicateur de phase et progression d'étage
  - [ ] Accès rapide aux fonctions essentielles

- [ ] Organiser les éléments centraux (spécifiques à chaque phase)

  - [ ] Combat: Ennemi, main de cartes, cartes bonus
  - [ ] Exploration: Carte du monde avec chemins et nœuds
  - [ ] Boutique, Repos, Événement: Contenus spécifiques

- [ ] Intégrer les éléments secondaires
  - [ ] Journal de combat
  - [ ] Aperçu de la collection
  - [ ] Navigation entre sections

## Correction des imports

- [ ] Mettre à jour tous les imports dans les fichiers pour refléter les nouveaux noms
- [ ] S'assurer que les composants obsolètes ne sont plus importés nulle part

## Tests et corrections

- [ ] Tester chaque page pour s'assurer qu'elle utilise correctement le Design System
- [ ] Vérifier la cohérence visuelle à travers toute l'application
- [ ] Corriger les problèmes de z-index qui pourraient apparaître

## Optimisations

- [ ] Assurer que les composants utilisent bien React.memo où c'est pertinent
- [ ] Vérifier les performances des animations complexes
- [ ] S'assurer que les transitions sont fluides entre toutes les phases de jeu
