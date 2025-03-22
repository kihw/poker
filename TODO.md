# TODO - Migration Redux

## 1. Initialisation Redux

- [ ] Installer les packages Redux & React-Redux.
- [ ] Créer le dossier `store/`.
- [ ] Configurer le `store` centralisé.

## 2. Création des reducers

- [ ] Créer un reducer pour la gestion des utilisateurs.
- [ ] Créer un reducer pour la gestion des produits.
- [ ] Prévoir un reducer pour les erreurs ou les notifications.

## 3. Actions

- [ ] Créer les actions pour :
  - [ ] Charger les données (fetch).
  - [ ] Ajouter, modifier, supprimer des entités (CRUD).
  - [ ] Gérer les états de chargement et d'erreur.

## 4. Adaptation des composants

- [ ] Connecter les composants à Redux via `useSelector` et `useDispatch`.
- [ ] Supprimer l'état local inutile dans les composants.
- [ ] Refactoriser les appels d'API pour passer par Redux (thunks ou middlewares).

## 5. Tests & Debug

- [ ] Tester l'intégration Redux sur chaque composant connecté.
- [ ] Vérifier l'absence de régressions.
