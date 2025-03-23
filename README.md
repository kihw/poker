# Poker Solo RPG

Un jeu de rôle roguelike basé sur le poker et des mécanismes de cartes.

## Corrections apportées

Le projet a été corrigé pour résoudre les problèmes suivants :

1. Ajout du composant `Card` dans le fichier DesignSystem.jsx qui n'était pas exporté mais était utilisé par plusieurs composants.
2. Ajout du composant `Tooltip` dans DesignSystem.jsx.
3. Correction des importations dans CombatLog.jsx et HandCombinationDisplay.jsx pour utiliser les composants exportés correctement.
4. Définition locale de la fonction `getRarityColor` dans CollectionPreview.jsx au lieu de l'importer du DesignSystem.

Ces corrections permettent au jeu de fonctionner correctement sans erreurs JavaScript.

## Structure du projet

Le projet est organisé comme suit :

- `src/components/` : Contient tous les composants React
  - `card/` : Composants liés aux cartes (standard et bonus)
  - `combat/` : Composants pour l'interface de combat
  - `map/` : Composants pour la carte du monde
  - `ui/` : Composants d'interface utilisateur réutilisables
- `src/core/` : Logique de base du jeu
- `src/data/` : Données statiques du jeu
- `src/modules/` : Modules fonctionnels
- `src/pages/` : Pages principales de l'application
- `src/redux/` : État global avec Redux
  - `slices/` : Tranches Redux pour les différentes parties de l'état
  - `thunks/` : Fonctions thunks Redux pour la logique asynchrone
  - `selectors/` : Sélecteurs Redux
  - `middleware/` : Middlewares Redux personnalisés
- `src/utils/` : Utilitaires et fonctions helpers

## Fonctionnalités du jeu

- Combat basé sur des combinaisons de poker
- Progression roguelike avec génération procédurale de la carte
- Collection de cartes bonus avec différentes raretés
- Système de boutique et repos
- Événements aléatoires
- Sauvegarde et chargement de la progression

## Technologies utilisées

- React
- Redux Toolkit
- React Router DOM
- Framer Motion pour les animations
- TailwindCSS pour les styles
