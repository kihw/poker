### **Boutique – Fonctionnement complet**

#### **1. Accès aux boutiques**

- Les **boutiques** sont des lieux spéciaux où le joueur peut échanger de l’or contre divers objets ou améliorations. Elles apparaissent à certains points du parcours, typiquement lorsqu’un nœud de type boutique est atteint sur la carte roguelike.
- En début de partie, le joueur dispose d’une certaine quantité d’or de départ (généralement obtenue via les récompenses de niveau ou de victoire). Gérer cet or est crucial, car les boutiques sont relativement rares.
- Lorsqu’il entre dans une boutique, le joueur accède à l’**interface du marchand**. Le jeu présente la liste des articles disponibles à l’achat, chacun avec son nom, sa description et son prix en or affiché.
- Le stock du marchand est **limité et aléatoire** : à chaque nouvelle boutique rencontrée, une sélection aléatoire d’articles est proposée. Ainsi, deux visites de boutique dans des parties différentes n’offriront pas exactement les mêmes produits, bien que les catégories d’objets restent similaires.
- Une fois les achats effectués (ou si le joueur choisit de ne rien acheter), il quitte la boutique et poursuit son chemin sur la carte. Les boutiques ne peuvent pas être revisitées une fois dépassées.

---

#### **2. Types d’articles disponibles**

- Les boutiques proposent généralement plusieurs catégories d’articles, couvrant à la fois des **consommables pour le combat immédiat** et des **améliorations durables** pour renforcer le personnage sur le long terme :
  - **Potions de soin** : objets consommables réutilisables une fois, permettant de **récupérer des PV** en combat. Par exemple, une _Petite potion_ rend 15 PV, une _Potion moyenne_ rend 30 PV, etc. Le joueur peut utiliser ces potions pendant un combat pour se soigner instantanément.
  - **Potions de bouclier** : consommables conférant un **bouclier temporaire**. Par exemple, une potion de bouclier peut donner +10 points de bouclier (protections qui absorberont les prochains dégâts).
  - **Potions de puissance** : consommables offrant un **bonus de dégâts temporaire**. Par ex., une potion de force augmente les dégâts de la prochaine attaque du joueur de +10.
  - **Améliorations permanentes de statut** : ces objets, une fois achetés, appliquent un bonus **définitif** au personnage. Par exemple, le _Cristal de vie_ augmente les PV maximum du héros de +10 de façon permanente. Ces améliorations se déclenchent immédiatement à l’achat et n’ont pas besoin d’être utilisées en combat.
  - **Extension d’équipement** : un article spécial _Porte-cartes amélioré_ permet d’**équiper une carte bonus supplémentaire**. Chaque achat de cet objet augmente de +1 le nombre de cartes bonus que le joueur peut placer dans son deck actif (dans la limite fixée par le jeu, généralement jusqu’à 5). Ce type d’amélioration est souvent **limité en quantité** (par exemple, n’apparaît que deux fois maximum, pour passer de 3 à 5 emplacements de cartes bonus).
  - **Packs de cartes bonus** : le marchand peut vendre des _lots de cartes bonus_. Acheter un pack ajoute immédiatement un certain nombre de nouvelles cartes bonus aléatoires à la collection du joueur. Par exemple, un _Pack basique_ peut contenir 2 cartes bonus communes ou peu communes, tandis qu’un _Pack avancé_ garantit au moins une carte rare parmi 2 cartes bonus. Ces packs permettent d’étoffer la collection de cartes bonus du joueur sans attendre les butins aléatoires.
- Chaque article a un **prix en or** fixé. Les prix des améliorations permanentes et des packs de cartes sont plus élevés que ceux des consommables, reflétant leur impact plus durable ou puissant sur la progression.
- Certains objets peuvent avoir une **quantité d’achat limitée**. Par exemple, si le joueur achète un _Porte-cartes amélioré_, il se peut qu’il n’apparaisse plus en boutique une fois la limite atteinte (le jeu garde en mémoire les achats uniques déjà effectués).

---

#### **3. Fonctionnement des achats**

- Pour acheter un objet, le joueur sélectionne l’article souhaité dans l’interface de la boutique, puis confirme l’achat.
- **Déduction de l’or** : immédiatement, le montant en or correspondant est soustrait de la trésorerie du joueur. Si le joueur n’a pas assez d’or, l’achat est refusé (le bouton d’achat peut être grisé ou un message d’erreur apparaît).
- **Acquisition de l’objet** :
  - S’il s’agit d’une potion ou d’un consommable, l’objet est ajouté à l’**inventaire** du joueur. Le joueur pourra le retrouver dans son inventaire (ou une interface dédiée en combat) et l’utiliser ultérieurement, au moment opportun.
  - S’il s’agit d’un objet à effet permanent (amélioration de stat, extension d’emplacement), l’effet s’applique **immédiatement** : la stat du personnage est augmentée sur-le-champ (et persistera pour le reste de la partie) ou l’emplacement supplémentaire est débloqué. Ces objets n’apparaissent pas dans l’inventaire car leur effet est instantané et permanent.
  - Pour un pack de cartes bonus, l’ouverture du pack est automatique à l’achat : le contenu (les cartes bonus) vient s’ajouter à la collection du joueur. Un message ou une animation peut indiquer quelles nouvelles cartes ont été obtenues.
- **Inventaire et utilisation** : en dehors des boutiques, le joueur dispose d’un inventaire accessible (par exemple via le menu ou l’interface de combat pour les potions). Il peut y voir les consommables achetés et les utiliser au moment voulu (les potions étant typiquement utilisables durant les combats via une action dédiée).
- Les achats sont **définitifs** : on ne peut ni revendre un objet au marchand ni annuler un achat une fois confirmé. Il n’y a pas de système de revente d’équipement dans le jeu, l’or doit donc être dépensé judicieusement.
- Lorsque le joueur a terminé ses achats (ou s’il ne souhaite rien acheter), il quitte l’interface du marchand. Généralement, cela se fait en fermant l’écran de boutique, ce qui renvoie sur la carte roguelike pour choisir le prochain nœud.

---

#### **4. Stratégie d’achat**

- La gestion de l’or est une composante stratégique importante. Le joueur doit évaluer quels achats auront le plus grand impact sur sa survie et sa progression. Par exemple :
  - Investir dans des **potions de soin** peut sécuriser les combats à court terme en garantissant des soins d’urgence.
  - Acheter des **améliorations permanentes** (comme des PV max supplémentaires ou un emplacement de carte bonus) peut s’avérer moins immédiatement utile qu’une potion, mais offre un avantage cumulatif sur le long terme, surtout avant un boss ou pour les étages suivants.
  - Les **packs de cartes bonus** sont un pari intéressant pour enrichir sa collection : ils peuvent donner des cartes puissantes, mais l’aléatoire fait que le résultat n’est pas garanti. Si le joueur recherche une combinaison particulière de cartes bonus, il peut tenter sa chance avec un pack.
- Il est conseillé de garder une réserve d’or pour les besoins critiques. Par exemple, arriver fauché chez un marchand et ne pas pouvoir acheter un _Cristal de vie_ ou une potion majeure peut rendre la suite de l’aventure plus ardue. À l’inverse, thésauriser trop d’or sans l’utiliser peut priver le joueur de bonus précieux qui auraient facilité des combats.
- Chaque visite de boutique étant unique, le joueur doit s’adapter : acheter tout ce qui est utile quand l’occasion se présente, car la prochaine boutique pourrait être loin (ou proposer d’autres objets). Il est aussi avisé de vérifier l’**état de son inventaire** avant une boutique (combien de potions reste-t-il ? un slot de carte bonus supplémentaire est-il nécessaire maintenant ?) pour cibler les achats prioritaires.

---

### 📝 **Résumé**

- Les boutiques permettent au joueur de dépenser l’or accumulé pour acheter des potions, des améliorations permanentes et des packs de cartes bonus. Elles apparaissent à des moments clés du parcours et offrent un stock d’articles aléatoires.
- **Articles en vente** : potions de soin, potions de bouclier ou de puissance (usage en combat), objets augmentant durablement les statistiques du héros (PV max, emplacement de carte bonus), ainsi que des packs ajoutant des cartes bonus à la collection.
- Lors d’un achat, l’or est consommé et l’objet est acquis : les potions vont dans l’inventaire pour être utilisées plus tard, les bonus permanents s’appliquent immédiatement, les packs de cartes distribuent de nouvelles cartes instantanément.
- Le joueur doit gérer son or de façon stratégique, équilibrant les besoins court terme (survie via potions) et long terme (puissance via améliorations). Chaque boutique est une opportunité limitée d’améliorer ses chances avant de poursuivre l’aventure.

```markdown

```
