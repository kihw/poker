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

## Implémentation du Design System ✅

- [x] Finaliser le composant `DesignSystem.jsx` pour inclure tous les éléments nécessaires:
  - [x] S'assurer que toutes les couleurs définies dans l'analyse sont présentes
  - [x] Créer les composants de base (Card, Button, Badge, ProgressBar)
  - [x] Définir les constantes pour les ombres, espacements, rayons de bordure, etc.

## Mise à jour des composants principaux ✅

- [x] Interface de combat
  - [x] Mettre à jour la disposition verticale (ennemi en haut, joueur en bas)
  - [x] Améliorer les animations d'attaque et les effets visuels
  - [x] Ajouter des transitions fluides entre les phases de combat
  - [x] Intégrer le journal de combat

- [x] Carte du monde
  - [x] Ajouter des styles distinctifs pour chaque type de nœud
  - [x] Améliorer l'animation des chemins disponibles
  - [x] Ajouter des tooltips détaillés au survol des destinations

- [x] Système de cartes
  - [x] Implémenter des effets visuels différents selon la rareté
  - [x] Ajouter une prévisualisation des combinaisons possibles
  - [x] Améliorer les animations de tirage et de sélection

- [x] Interface utilisateur générale
  - [x] Mettre en place un header cohérent sur toutes les pages
  - [ ] Créer un footer unifié avec les contrôles de navigation
  - [x] Assurer la cohérence des couleurs et styles à travers l'application

## Hiérarchie de l'interface selon l'analyse ✅

- [x] Structurer les éléments critiques (toujours visibles)
  - [x] Barre d'état du joueur avec PV, bouclier, or et niveau
  - [x] Indicateur de phase et progression d'étage
  - [x] Accès rapide aux fonctions essentielles

- [x] Organiser les éléments centraux (spécifiques à chaque phase)
  - [x] Combat: Ennemi, main de cartes, cartes bonus
  - [x] Exploration: Carte du monde avec chemins et nœuds
  - [x] Boutique, Repos, Événement: Contenus spécifiques

- [x] Intégrer les éléments secondaires
  - [x] Journal de combat
  - [x] Aperçu de la collection
  - [x] Navigation entre sections

## Correction des imports 📋

- [x] Mettre à jour tous les imports dans les fichiers pour refléter les nouveaux noms
- [x] S'assurer que les composants obsolètes ne sont plus importés nulle part

## Tests et corrections 🔍

- [ ] Tester chaque page pour s'assurer qu'elle utilise correctement le Design System
- [ ] Vérifier la cohérence visuelle à travers toute l'application
- [ ] Corriger les problèmes de z-index qui pourraient apparaître

## Optimisations 🚀

- [x] Assurer que les composants utilisent bien React.memo où c'est pertinent
- [ ] Vérifier les performances des animations complexes
- [ ] S'assurer que les transitions sont fluides entre toutes les phases de jeu

Légende:
- ✅ Terminé
- 🚧 En cours
- 📋 Planifié
- 🔍 À tester
- 🚀 Optimisation
