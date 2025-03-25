### **Combat – Fonctionnement complet**

#### **1. Phases de combat**

- Un combat se déroule en plusieurs **tours successifs** jusqu’à la défaite de l’ennemi ou du joueur. Chaque tour comporte plusieurs étapes :
  - **Phase de pioche** : distribution de cartes au joueur depuis un **deck standard de 52 cartes** mélangé en début de combat. Le joueur reçoit une main initiale (par exemple 5 cartes).
  - **Phase de sélection** : le joueur peut éventuellement **échanger une partie de ses cartes**. Il peut défausser jusqu’à **2 cartes** de sa main pour en piocher de nouvelles depuis le deck. Cette étape permet de tenter d’améliorer la main.
  - **Phase de combinaison** : une fois la main finale constituée, la meilleure **combinaison de poker** réalisable avec ces cartes est déterminée (paire, brelan, etc.).
  - **Phase de résolution** : les **dégâts** infligés à l’ennemi sont calculés en fonction de la combinaison obtenue, puis soustraits aux points de vie de l’adversaire.
  - **Riposte de l’ennemi** : après l’action du joueur, l’ennemi agit à son tour (attaque ou effet), ce qui peut réduire les points de vie du joueur.
- Le tour suivant commence tant que les deux combattants sont en vie, en répétant pioche, éventuel échange, combinaison et résolution. Le combat s’achève quand l’un des deux n’a plus de points de vie.

---

#### **2. Combinaisons et calcul des dégâts**

- La puissance de l’attaque du joueur dépend de la **combinaison de poker** formée avec la main finale. Une combinaison plus rare correspond à des dégâts de base plus élevés.
- Les combinaisons sont classées des plus faibles aux plus fortes : **Carte Haute**, **Paire**, **Double Paire**, **Brelan** (Trois of a kind), **Suite** (Quinte), **Couleur** (Flush), **Full** (Full House), **Carré** (Four of a Kind), **Quinte Flush**, et enfin **Quinte Flush Royale**.
- Chaque rang de combinaison produit des dégâts de base approximativement **deux fois plus élevés** que le rang précédent. Par exemple, une Paire inflige des dégâts modestes, alors qu’une Quinte Flush Royale octroie des dégâts extrêmement importants.
- Le jeu applique ce calcul de manière exponentielle : une combinaison haute procure un avantage considérable, reflétant la rareté de cette main.
- _Exemple_ : si une **Double Paire** inflige, disons, 4 points de dégâts de base, un **Brelan** en infligera environ 8, et un **Carré** plus de 100 (valeurs indicatives illustrant l’échelle croissante).

---

#### **3. Statistiques de combat et états**

- Chaque combattant possède des **points de vie (PV)**. Le joueur peut également avoir un **bouclier** temporaire qui absorbe des dégâts avant d’entamer ses PV (voir _Site de repos_ pour l’obtention du bouclier).
- Il existe une notion de **coup critique** : certaines améliorations peuvent augmenter le taux de critique du joueur. Un coup critique multiplie généralement les dégâts infligés (par exemple x2) lorsqu’il se produit.
- Les **effets temporaires** en combat (buffs et debuffs) peuvent influencer l’issue du tour. Par exemple, un bonus de dégâts sur la prochaine attaque ou une invulnérabilité temporaire peuvent s’appliquer selon les actions du joueur (voir _Fusion des cartes bonus_).
- Les actions de l’ennemi peuvent inclure des attaques directes, des effets spéciaux ou des altérations d’état (comme un affaiblissement du joueur pour le prochain tour). La nature exacte des attaques ennemies dépend de leur type (ennemi standard, élite, boss) et du niveau du jeu.

---

#### **4. Issue du combat et récompenses**

- **Victoire** : lorsque le joueur vainc l’ennemi, le combat se termine et des récompenses sont accordées. Typiquement, le joueur gagne des **points d’expérience (XP)** pour progresser en niveau (voir _Progression_), et une somme d’**or**. La quantité d’XP et d’or peut être plus élevée pour des ennemis élites ou des boss.
- Il est possible d’obtenir des **butins supplémentaires** après certaines victoires (par exemple, obtenir une **carte bonus** en récompense d’un combat important ou l’ouverture d’un coffre). Lorsqu’une carte bonus est gagnée de cette manière, sa valeur (sa figure de carte à jouer) n’est révélée qu’après l’obtention.
- **Défaite** : si le joueur tombe à 0 PV, la partie s’achève. Le joueur peut alors charger sa dernière sauvegarde ou recommencer une nouvelle partie. La progression non sauvegardée sera perdue en cas de défaite.
- Après un combat, que ce soit une victoire ou une défaite, le jeu retourne à la phase d’exploration sur la carte roguelike si l’aventure continue. En cas de victoire, le joueur peut généralement **choisir le prochain nœud** sur la carte pour poursuivre son parcours.
