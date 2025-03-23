# TODO: Implémentation du Design System de Poker Solo RPG

## Nettoyage des fichiers dupliqués ✅

- [x] Supprimer les composants "Improved" redondants et garder une seule version de chaque
  - [x] Fusionner `ImprovedCombatInterface.jsx` avec `CombatInterface.jsx`
  - [x] Fusionner `ImprovedEventEncounter.jsx` avec `EventEncounter.jsx`
  - [x] Fusionner `ImprovedCard.jsx` avec `EnhancedCard.jsx`
  - [x] Fusionner `ImprovedBonusCardManager.jsx` avec `BonusCardManager.jsx`
  - [x] Fusionner `ImprovedRoguelikeWorldMap.jsx` avec `RoguelikeWorldMap.jsx`
  - [x] Fusionner `ImprovedActionFeedback.jsx` avec `ActionFeedback.jsx`
  - [x] Fusionner `ImprovedGameInterface.jsx` avec un nouveau composant `GameInterface.jsx`
  - [x] Mettre à jour tous les imports dans les autres fichiers pour refléter ces changements

## Implémentation du Design System 🚧

- [x] Finaliser le composant `DesignSystem.jsx` pour inclure tous les éléments nécessaires:
  - [x] S'assurer que toutes les couleurs définies dans l'analyse sont présentes
  - [x] Créer les composants de base (Card, Button, Badge, ProgressBar)
  - [x] Définir les constantes pour les ombres, espacements, rayons de bordure, etc.

## Mise à jour des composants principaux 🚧

- [x] Interface de combat
  - [x] Mettre à jour la disposition verticale (ennemi en haut, joueur en bas)
  - [x] Améliorer les animations d'attaque et les effets visuels
  - [x] Ajouter des transitions fluides entre les phases de combat

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

## Hiérarchie de l'interface selon l'analyse 🚧

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

## Correction des imports 📋

- [x] Mettre à jour tous les imports dans les fichiers pour refléter les nouveaux noms
- [x] S'assurer que les composants obsolètes ne sont plus importés nulle part

## Tests et corrections 🔍

- [ ] Tester chaque page pour s'assurer qu'elle utilise correctement le Design System
- [ ] Vérifier la cohérence visuelle à travers toute l'application
- [ ] Corriger les problèmes de z-index qui pourraient apparaître

## Optimisations 🚀

- [ ] Assurer que les composants utilisent bien React.memo où c'est pertinent
- [ ] Vérifier les performances des animations complexes
- [ ] S'assurer que les transitions sont fluides entre toutes les phases de jeu

Légende:
- ✅ Terminé
- 🚧 En cours
- 📋 Planifié
- 🔍 À tester
- 🚀 Optimisation
