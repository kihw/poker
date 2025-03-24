### **Sauvegarde – Fonctionnement complet**

#### **1. Fonctionnalité de sauvegarde**

- Le jeu intègre un **système de sauvegarde** qui permet au joueur de suspendre sa partie et de la reprendre plus tard exactement où il l’avait laissée. La sauvegarde est essentielle dans un roguelike où une partie complète peut durer longtemps ou être interrompue.
- La sauvegarde se fait localement, en stockant les données de la partie dans le **stockage interne (localStorage)** de l’appareil/du navigateur du joueur. Il n’est pas nécessaire de gérer des fichiers manuellement : le système enregistre et charge automatiquement les informations requises.
- Le joueur peut généralement sauvegarder sa progression à tout moment hors combat via une **option de menu** (par exemple un bouton _Sauvegarder_ accessible dans l’interface). De plus, le jeu effectue souvent des sauvegardes automatiques à des moments clés (après un combat important, à l’arrivée sur la carte, etc.), minimisant la perte de progression en cas de fermeture inattendue du jeu.
- Lorsqu’on relance le jeu, une **option Continuer** apparaît si une sauvegarde existe, permettant de charger la partie sauvegardée. Si aucune sauvegarde n’est présente (première partie ou sauvegarde effacée), le jeu proposera de commencer une nouvelle partie.

---

#### **2. Données enregistrées**

La sauvegarde enregistre l’**état complet** de la partie en cours, afin de pouvoir la reconstituer fidèlement au chargement. Parmi les données sauvegardées figurent :

- **État du joueur** : Points de vie actuels et maximum, niveau, XP actuel, or possédé, et éventuel bouclier en cours. Tout ce qui concerne le personnage principal est mémorisé.
- **Progression et position** : L’étage (ou stage) actuel où se trouve le joueur, la position courante sur la carte roguelike (nœud atteint), ainsi que la structure de la carte elle-même (chemin parcouru et nœuds restants). Ainsi, en rechargeant, le joueur retrouvera la même carte avec les mêmes embranchements déjà générés, et se tiendra sur le bon nœud.
- **Carte roguelike** : La liste des nœuds de la carte en cours, avec leur type (combat, événement, etc.) et l’historique de ceux déjà complétés. Par exemple, si le joueur a déjà vaincu certains ennemis ou réalisé un événement, le jeu le sait pour ne pas les rejouer.
- **Ennemis et combat** : S’il y a un combat en cours lors de la sauvegarde (situation rare car on sauvegarde plutôt hors combat), l’état du combat (PV de l’ennemi, tour actuel) serait également enregistré. Cependant, en pratique, la sauvegarde se fait entre les combats, donc on retient surtout quel combat ou boss est le prochain sur la route.
- **Cartes bonus** : L’intégralité de la **collection de cartes bonus** du joueur est sauvegardée. Cela inclut quelles cartes bonus ont été obtenues (et lesquelles non, si le jeu suit un pool), leur niveau d’amélioration éventuel, et quelles cartes sont actuellement équipées dans le deck bonus actif du joueur. Par exemple, si le joueur possède 10 cartes bonus dans sa collection dont 4 équipées (actives), la sauvegarde stocke ces informations.
- **Inventaire d’objets** : Tous les objets et potions possédés par le joueur (quantité de potions de soin, potions de bouclier, etc.) ainsi que les améliorations permanentes déjà acquises (bien que ces dernières soient déjà reflétées dans les stats du joueur). Ceci garantit que les consommables achetés en boutique ou gagnés via des événements seront toujours là après rechargement.
- **Avancées de progression** : Les éléments comme les objets déjà achetés en boutique (pour éviter rachat illimité si on revisite la même boutique via sauvegarde), ou les événements déjà rencontrés, peuvent être consignés. Par exemple, le jeu peut conserver la liste des articles limités déjà achetés (tel ou tel pack de cartes, ou extension de slot achetée une fois) pour ne pas les reproposer abusivement.
- **Statistiques diverses** : Le système de sauvegarde peut également noter des statistiques globales (ennemis vaincus, dégâts totaux, etc.) et l’heure de sauvegarde, mais ces éléments sont surtout cosmétiques ou pour information et n’affectent pas le gameplay lors du chargement.

Toutes ces données sont sauvegardées dans une structure sérialisée (par exemple en JSON) associée à un seul **fichier de sauvegarde** (ou entrée de stockage). La taille de la sauvegarde est modeste, car il s’agit essentiellement de variables numériques et de quelques listes d’objets.

---

#### **3. Chargement et compatibilité**

- Au chargement d’une sauvegarde, le jeu lit les données stockées et restaure l’état du jeu en mémoire. Le joueur se retrouve ainsi à l’endroit exact où il avait quitté, avec les mêmes PV, ressources, progression sur la carte, etc.
- Le système de sauvegarde inclut un numéro de **version** des données (par ex. version 1.1). Cela sert à assurer la compatibilité en cas de mise à jour du jeu. Si une sauvegarde provient d’une version antérieure du jeu, le programme peut tenter de la convertir ou au moins détecter les incompatibilités (par exemple, si des nouvelles données sont attendues). Dans la plupart des cas, les mises à jour mineures du jeu n’empêchent pas de charger une ancienne sauvegarde, grâce à cette gestion de version.
- En cas de problème lors du chargement (fichier corrompu ou incompatible), le jeu affichera un message d’erreur et ne tentera pas de forcer la reprise pour éviter les comportements imprévus. Le joueur devra alors éventuellement commencer une nouvelle partie. Ces cas restent rares.
- Le système ne permet qu’une **unique sauvegarde active** à la fois (une seule « slot » de sauvegarde automatique). Cela signifie que commencer une nouvelle partie écrasera ou remplacera la sauvegarde précédente à un certain stade, sauf si le jeu propose explicitement plusieurs emplacements. Par défaut, c’est une progression unique suivie par joueur.

---

#### **4. Conseils d’utilisation**

- Il est recommandé de sauvegarder **régulièrement**, surtout avant de quitter le jeu. Même si des sauvegardes auto ont lieu, effectuer une sauvegarde manuelle avant de fermer assure que toute progression récente est bien mémorisée.
- Le joueur ne peut pas « tricher » avec la sauvegarde pour éviter un mauvais résultat d’événement ou un combat raté, car le système sauvegarde l’état tel quel. Recharger une sauvegarde ramènera le joueur au même point avant l’issue incertaine. Par exemple, si l’on sauvegarde juste avant de tenter un événement risqué, puis que l’événement tourne mal, recharger ramènera juste avant le choix de l’événement, certes, mais les éléments aléatoires seront probablement recalculés de manière identique ou similaire (selon la conception, il peut y avoir une reroll, mais ce n’est pas garanti par design).
- En cas de défaite du joueur sans sauvegarde récente, la progression depuis la dernière sauvegarde automatique sera perdue. Il faut donc être conscient que la sauvegarde n’est généralement pas possible en plein combat. Bien gérer ses sauvegardes fait partie de la stratégie globale dans les jeux roguelike si l’on souhaite interrompre et reprendre la partie sereinement.
- Les données de sauvegarde étant locales, si le joueur change d’appareil ou de navigateur, la sauvegarde ne sera pas disponible à moins d’effectuer un transfert manuel (si le jeu le permet). Il est donc conseillé de jouer sur le même support pour une campagne donnée, ou de vérifier si le jeu propose une synchronisation en ligne (dans le cas présent, ce n’est pas le cas par défaut).
- Enfin, pour commencer une nouvelle aventure sans supprimer l’ancienne, il peut être nécessaire de **supprimer ou réinitialiser** la sauvegarde existante via le menu (par exemple, “Nouvelle Partie” peut écraser la sauvegarde précédente). Assurez-vous de le faire en connaissance de cause pour ne pas perdre une progression souhaitée.

---

### 📝 **Résumé**

- Le jeu sauvegarde automatiquement et manuellement la progression du joueur en stockant toutes les données importantes (PV, niveau, or, cartes bonus, position sur la carte, inventaire, etc.) dans le stockage local. Une seule sauvegarde active est utilisée pour reprendre la partie là où elle s’est arrêtée.
- En chargeant la sauvegarde, le joueur retrouve **exactement son état** antérieur : mêmes ressources, même place sur la carte, mêmes ennemis déjà vaincus ou événements accomplis. Le système de versionnage assure que les sauvegardes restent compatibles avec les mises à jour mineures du jeu.
- Il est conseillé de sauvegarder régulièrement et de profiter du système de reprise pour jouer en plusieurs sessions. La sauvegarde garantit de ne pas perdre sa progression en cas de fermeture du jeu, mais n’offre pas de seconde chance en cas de mauvaise décision en jeu (c’est un outil de continuation, pas de retour en arrière).
- La fonctionnalité de sauvegarde offre ainsi au joueur la **flexibilité** de jouer à son rythme, dans un roguelike où la mort est définitive mais où l’on peut interrompre l’aventure et la continuer plus tard sans tout recommencer.

```markdown

```
