**roguelike-map.md**

`````markdown
### **Carte Roguelike – Fonctionnement complet**

#### **1. Génération de la carte et structure**

- L’aventure est représentée sous forme de **carte roguelike** composée de nœuds interconnectés. Chaque carte correspond à un **étage** ou niveau de jeu.
- Au début d’un étage, un point de départ unique est généré en haut de la carte. À la fin de l’étage se trouve le **nœud de Boss**, affrontement final de ce segment.
- Entre le départ et le boss, la carte se déploie en plusieurs **niveaux de profondeur** (rangées de nœuds). Le nombre de rangées détermine la **profondeur** de l’étage (par exemple, une carte peut comporter 10 rangées de nœuds avant le boss).
- À chaque nouvelle rangée, plusieurs chemins peuvent apparaître. Les nœuds se **bifurquent** et se rejoignent de manière semi-aléatoire, formant des embranchements. Le joueur devra choisir sa route à chaque intersection, ce qui crée un parcours unique à chaque partie.
- Le générateur de carte s’assure que la progression est possible de la première à la dernière rangée : il y a toujours au moins un chemin continu du départ jusqu’au boss, avec des connexions entre nœuds adjacents en profondeur.

---

#### **2. Types de nœuds**

- Chaque nœud de la carte représente un **événement** ou une **rencontre** spécifique. Les types de nœuds principaux incluent :
  - **Combat standard** : affrontement contre un ennemi classique. C’est le nœud le plus fréquent (par exemple ~65% des nœuds). Vaincre l’ennemi permet de continuer sur la carte.
  - **Combat élite** : combat plus difficile contre un ennemi élite. Ces nœuds sont plus rares (~5%) et signalés distinctement. Les ennemis élites sont plus puissants mais offrent de meilleures récompenses (XP et or accrus, voire carte bonus garantie).
  - **Événement aléatoire** : rencontre scriptée non-combattive (~10% des nœuds). Le joueur fait face à une situation particulière et doit faire un choix (voir _Événements aléatoires_).
  - **Site de repos** : lieu pour se reposer (~15% des nœuds). Permet de se soigner, de gagner un bouclier ou d’améliorer une carte bonus (voir _Site de repos_). C’est un moment stratégique sans combat.
  - **Boutique** : rencontre avec un marchand (~5% des nœuds). Le joueur peut acheter des objets, potions ou cartes bonus contre de l’or (voir _Boutique_).
  - **Boss** : nœud final de l’étage (généralement 1 par étage). Combat majeur contre un adversaire redoutable. La victoire est nécessaire pour passer à l’étage suivant ou terminer le jeu.
- Ces nœuds sont représentés par des icônes ou dessins spécifiques sur la carte (par exemple, une épée pour un combat, un feu de camp pour un repos, un coffre ou point d’interrogation pour un événement, etc.), permettant au joueur de planifier son chemin.

---

#### **3. Progression et choix de chemin**

- Le joueur commence au **point de départ** et peut sélectionner un des nœuds accessibles directement en dessous pour entamer son périple.
- À chaque rangée, selon le nœud où se trouve le joueur, un ou plusieurs nœuds de la rangée suivante seront reliés. Le joueur ne peut se déplacer qu’along des **connexions existantes** entre nœuds. Il n’est pas possible de revenir en arrière ou de changer de chemin une fois un nœud atteint : la progression est linéaire vers le bas.
- Les embranchements offrent des **choix stratégiques**. Par exemple, un chemin peut comporter plus de combats (pour gagner plus d’XP et d’or), tandis qu’un autre offre un repos avant le boss. Le joueur doit évaluer les risques et récompenses de chaque route.
- La **difficulté** tend à augmenter en avançant dans un étage. Les ennemis des dernières rangées possèdent généralement plus de PV ou infligent plus de dégâts. Il est souvent judicieux d’alterner combats et autres nœuds (événements, repos, boutique) pour arriver au boss dans les meilleures conditions.
- Le générateur de carte inclut des ajustements pour garantir une expérience équilibrée. Par exemple, il est assuré qu’il y ait au moins **un site de repos dans l’avant-dernière rangée** de nœuds, juste avant le boss, afin de permettre au joueur de se préparer pour l’affrontement final de l’étage.

---

#### **4. Étages multiples et progression globale**

- Une fois le **boss** vaincu, le joueur peut passer à **l’étage suivant** (s’il existe). Un nouvel étage est alors généré aléatoirement, souvent avec une difficulté accrue (ennemis plus forts, fréquence accrue d’ennemis élites, etc.).
- Le jeu peut comporter plusieurs étages successifs (par exemple 3 étages principaux et un étage final). Chaque nouvel étage propose une nouvelle carte roguelike à explorer, avec son propre boss à la fin.
- La progression d’un étage à l’autre s’accompagne généralement d’une **augmentation de la difficulté** (les probabilités de nœuds élite peuvent augmenter, les récompenses aussi). Le joueur conserve bien sûr l’ensemble de son état (PV restant, cartes bonus, or, niveau, inventaire) d’un étage à l’autre.
- Atteindre et vaincre le dernier boss du dernier étage constitue l’**aboutissement de la partie** (victoire finale). Selon le jeu, il peut s’agir de la fin de la partie ou du début d’un mode infini. En cas de mode infini, les étages continuent de se générer aléatoirement avec une difficulté croissante tant que le joueur survit.

---

### 📝 **Résumé**

- La carte roguelike est un **réseau de nœuds** générés aléatoirement représentant les différentes rencontres de l’aventure (combats, événements, repos, boutique, etc.). Le joueur progresse du départ vers le boss en choisissant son chemin à chaque embranchement.
- Les **types de nœuds** incluent : combats (normaux ou élites), événements spéciaux, sites de repos, boutiques, et boss de fin d’étage. Chaque type de nœud offre des défis ou avantages spécifiques.
- Le joueur doit planifier son itinéraire en fonction de l’état de son personnage et des symboles de nœuds à venir, en équilibrant combats pour l’XP et l’or avec des arrêts stratégiques (repos, achats, événements).
- Le générateur de niveau assure une progression équilibrée (ex. un repos garanti avant un boss). Après un boss vaincu, le joueur accède à l’étage suivant avec une nouvelle carte et des ennemis plus coriaces, jusqu’à la fin de l’aventure.

```markdown

```
`````
