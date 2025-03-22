# Poker Solo RPG - Plan de Développement

Ce document détaille les tâches requises pour finaliser le projet Poker Solo RPG, un jeu combinant mécaniques de poker avec des éléments RPG et roguelike.

## Tâches Prioritaires (Haute)

- [ ] **Implémenter le système d'itinéraire roguelike**

  - Fichiers: `src/modules/combat.js`, `src/context/GameContext.jsx`
  - Description: Compléter la génération d'itinéraire et la logique de progression entre les différents types de nœuds (combat, boutique, repos, événement)
  - Estimation: 3-4 jours

- [ ] **Implémenter le gestionnaire d'événements aléatoires**

  - Fichiers: `src/components/event/EventEncounter.jsx`, `src/context/GameContext.jsx`
  - Description: Finaliser la logique pour générer et gérer les événements aléatoires
  - Estimation: 2-3 jours

- [ ] **Corriger les erreurs dans le système de combat**

  - Fichiers: `src/components/combat/CombatInterface.jsx`, `src/modules/combat.js`
  - Description: Résoudre les incohérences dans la gestion des cartes sélectionnées
  - Estimation: 1-2 jours

- [ ] **Compléter le système de sauvegarde**
  - Fichiers: `src/context/GameContext.jsx`
  - Description: Implémenter la sauvegarde/chargement de la progression

## Tâches Importantes (Moyenne)

- [ ] **Finaliser l'interface de la boutique**

  - Fichiers: `src/pages/ShopPage.jsx`, `src/modules/progression.js`
  - Description: Compléter la logique pour utiliser les objets achetés
  - Estimation: 2 jours

- [ ] **Développer la page de collection de cartes bonus**

  - Fichiers: `src/components/card/BonusCardManager.jsx`
  - Description: Améliorer la gestion et la visualisation des cartes bonus
  - Estimation: 2 jours

- [ ] **Implémenter complètement le système de repos**

  - Fichiers: `src/components/rest/RestSite.jsx`
  - Description: Finaliser les mécanismes de repos (guérison, amélioration de cartes)
  - Estimation: 1-2 jours

- [ ] **Intégrer le mode de jeu roguelike complet**
  - Fichiers: `src/components/map/RoguelikeWorldMap.jsx`
  - Description: Développer le système de progression de niveaux, de difficulté croissante
  - Estimation: 3-4 jours

## Améliorations et Raffinements (Basse)

- [ ] **Ajouter des effets visuels pour les combats**

  - Fichiers: `src/components/combat/CombatInterface.jsx`
  - Description: Ajouter des animations pour les attaques, dégâts, etc.
  - Estimation: 2-3 jours

- [ ] **Implémenter le système de sons et musique**

  - Fichiers: Nouveaux fichiers à créer
  - Description: Ajouter des effets sonores et de la musique d'ambiance
  - Estimation: 2-3 jours

- [ ] **Optimiser les performances**

  - Fichiers: Divers fichiers React, particulièrement `src/components/map/RoguelikeWorldMap.jsx`
  - Description: Améliorer le rendu et optimiser les mises à jour d'état
  - Estimation: 2 jours

- [ ] **Améliorer la documentation et les commentaires**

  - Fichiers: Tous les fichiers
  - Description: Ajouter plus de documentation et nettoyer les commentaires existants
  - Estimation: 1-2 jours

- [ ] **Ajouter des tests unitaires et d'intégration**
  - Fichiers: Création de nouveaux fichiers de test
  - Description: Renforcer la couverture des tests pour garantir la stabilité
  - Estimation: 3-4 jours

## Corrections de bugs (Moyenne)

- [ ] **Corriger les problèmes d'internationalisation**

  - Fichiers: `src/modules/bonus-cards.js` et autres fichiers avec textes en français/anglais
  - Description: Uniformiser la langue utilisée dans l'application
  - Estimation: 1 jour

- [ ] **Corriger les problèmes de rendu SVG dans la carte du monde**

  - Fichiers: `src/components/map/RoguelikeWorldMap.jsx`
  - Description: Résoudre les problèmes de redimensionnement et d'affichage
  - Estimation: 1 jour

- [ ] **Résoudre les problèmes de référence circulaire**
  - Fichiers: `src/modules/bonus-cards.js`, `src/modules/combat.js`, `src/core/game-state.js`
  - Description: Refactoriser les modules qui se référencent mutuellement
  - Estimation: 1-2 jours

## Améliorations architecturales (Basse)

- [ ] **Adopter un pattern plus clair pour la gestion d'état**

  - Description: Refactoriser vers Redux ou une approche plus cohérente
  - Estimation: 3-4 jours

- [ ] **Implémenter un système de plugins pour les cartes bonus**

  - Description: Créer un système plus modulaire pour les effets des cartes bonus
  - Estimation: 2 jours

- [ ] **Séparer la logique métier de l'interface**

  - Description: Déplacer la logique des composants React vers les modules/classes
  - Estimation: 3 jours

- [ ] **Créer un système d'événements centralisé**
  - Description: Remplacer les callbacks et props drilling par un système d'événements
  - Estimation: 2-3 jours

## Notes techniques

Le projet utilise React, React Router, TailwindCSS et Framer Motion. L'architecture est décomposée en:

- **Core**: Logique centrale (deck, état du jeu, évaluation des mains)
- **Modules**: Systèmes spécifiques (cartes bonus, combat, progression)
- **Composants**: Interface utilisateur React
- **Pages**: Différentes vues (combat, carte, repos, etc.)
  #   p o k e r 
   
   
