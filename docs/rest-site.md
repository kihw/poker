### **Site de repos – Fonctionnement complet**

#### **1. Rencontre d’un site de repos**

- Un **site de repos** est un lieu bienvenu où le joueur peut reprendre des forces et améliorer ses atouts sans affronter d’ennemi. Sur la carte roguelike, ces sites sont indiqués par une icône évoquant un campement (par exemple un feu de camp).
- Les sites de repos apparaissent à intervalles stratégiques, souvent après plusieurs combats éprouvants ou juste avant un combat de boss. Le générateur de carte garantit généralement au moins un site de repos à l’approche d’un affrontement majeur.
- Lorsque le joueur entre dans un site de repos, il accède à une **interface de camp** présentant plusieurs options de repos. Aucune limite de temps n’est imposée : le joueur peut réfléchir et choisir l’action de repos la plus adaptée à sa situation avant de poursuivre.

---

#### **2. Choix disponibles au campement**

À chaque site de repos, le joueur a généralement le choix entre **trois actions exclusives** (il ne peut en effectuer qu’une seule) :

- **Se reposer pour récupérer des PV** : Le joueur passe du temps à se reposer, ce qui lui permet de **soigner ses blessures**. Cette action restaure un certain pourcentage des points de vie **maximaux** du héros (par exemple, environ 30% de ses PV max). La guérison ne peut pas dépasser le maximum de PV du joueur. Si le héros est déjà presque au maximum de vie, le gain effectif sera moindre (uniquement jusqu’au seuil max).
- **Renforcer sa défense (méditer/pratiquer)** : Le joueur choisit de se préparer au prochain combat en se concentrant ou en s’entraînant, plutôt qu’en se soignant. Cette action confère un **bouclier temporaire** au héros. Par exemple, le joueur peut gagner _+15 points de bouclier_. Le bouclier s’ajoute aux PV actuels du joueur et absorbera les prochains dégâts subis en combat, mais il ne se régénère pas : une fois ces points de bouclier perdus, ils sont perdus jusqu’à ce qu’un nouveau bouclier soit acquis.
- **Améliorer une carte bonus** : Le joueur utilise le temps du repos pour **renforcer l’une de ses cartes bonus**. Il peut sélectionner une carte bonus de sa collection. Cette carte voit alors son **niveau d’amélioration** augmenter de +1 (jusqu’à un niveau maximal prédéfini, souvent 3). L’amélioration accroît l’efficacité de la carte en question : par exemple, si la carte confère un bonus de dégâts ou de défense, cette valeur de bonus augmentera. L’amélioration n’affecte pas la valeur de poker de la carte (sa figure reste la même), mais augmente son effet spécial. _Remarque_ : si aucune carte bonus ne peut être améliorée (soit parce que le joueur n’en possède pas, soit qu’elles sont déjà au niveau max), cette option peut ne pas être disponible.

Ces trois choix exclusifs signifient que le joueur doit **prioriser son besoin du moment** : se soigner, se protéger, ou investir dans le long terme en améliorant son équipement.

---

#### **3. Effets et mécaniques des actions de repos**

- **Récupération de PV (Repos)** :
  - Le montant de soin est généralement calculé en fonction des PV max du joueur (ex: 30%). Cela permet aux héros avec plus de PV max de récupérer davantage en valeur absolue.
  - Après l’action de repos, les PV du joueur sont augmentés immédiatement. Cette guérison peut grandement aider à aborder les prochains combats, en particulier si le joueur sort d’une série d’affrontements difficiles.
  - Le repos n’augmente pas les PV max (contrairement à certains objets de boutique), il ne fait que restaurer les PV perdus.
- **Gain de bouclier (Défense)** :
  - Le bouclier accordé se cumule aux PV actuels et est visible sur l’interface de combat sous forme de points de protection. Par exemple, si le joueur a 20/50 PV et gagne 15 de bouclier, il débutera le prochain combat avec 20 PV et 15 bouclier (équivalent à 35 PV temporaires).
  - Ce bouclier **persiste d’un combat à l’autre** tant qu’il n’est pas entièrement utilisé. Cependant, en pratique, il sert surtout au combat immédiatement suivant. Il est consommé en premier lors des dégâts reçus. S’il en reste après un combat, il sera toujours actif au combat suivant.
  - Le bouclier est utile si le joueur a ses PV assez hauts mais veut une sécurité supplémentaire pour un combat difficile (boss ou élite). C’est un pari sur le fait de ne pas avoir besoin de soins immédiats.
- **Amélioration de carte bonus** :
  - Lorsque le joueur choisit une carte bonus à améliorer, cette carte gagne un niveau. Un indicateur de niveau (par ex. **★** ou un chiffre) peut être associé à la carte dans la collection pour refléter son amélioration.
  - Chaque niveau supplémentaire **augmente de 20% environ l’effet** de la carte bonus. Par exemple, une carte bonus qui offrait +10% de chances de critique en combo peut passer à +12% ou +14% au niveau supérieur. De même, si une carte ajoutait +2 points de dégâts sur certaines attaques, elle en ajoutera +2.4 (arrondi à 3) au niveau suivant.
  - Le niveau maximum est généralement 3 : une carte de niveau 3 a atteint son plein potentiel d’amélioration. Tenter de la ré-améliorer n’aura plus d’effet.
  - L’amélioration ne change pas la rareté de la carte ni sa figure, et n’influence pas directement la valeur de combinaison en combat, mais rend le **bonus passif de cette carte plus puissant**.
  - Cette option est un investissement sur le long terme : elle n’apporte aucun avantage immédiat pour le prochain combat (contrairement au soin ou bouclier), mais elle renforce le potentiel du joueur pour tous les combats futurs.

---

#### **4. Choix stratégique du repos**

- Le joueur doit évaluer sa situation avant de décider :
  - Si les **PV du héros sont bas**, privilégier le soin est souvent vital pour éviter une mort prématurée au prochain combat. Un bonus de bouclier ne serait pas utile si le héros est à quelques points de vie de la mort – mieux vaut d’abord restaurer ses PV.
  - Si le héros est en bonne santé mais anticipe un **combat très difficile** (un boss par exemple), le bouclier peut être extrêmement précieux pour encaisser une grosse attaque initiale ou prolonger la survie sans entamer les PV.
  - Si le joueur se sent en position confortable (PV élevés, prochain combat gérable) ou souhaite préparer l’avenir, **améliorer une carte bonus** peut être le meilleur choix. Cela n’apporte rien immédiatement, mais cumulé sur plusieurs repos, le joueur peut se forger un deck de cartes bonus nettement plus puissant pour les étages avancés.
- Il est important de noter qu’on ne peut pas tout faire à la fois : par exemple, choisir de ne pas se soigner peut s’avérer risqué si un événement imprévu survient ensuite. Inversement, toujours se soigner et ne jamais améliorer ses cartes peut rendre les combats futurs plus difficiles par manque d’améliorations.
- Certains repos décisifs se situent juste avant un boss : dans ce cas, le joueur peut décider d’améliorer une carte clé pour maximiser ses chances contre le boss, ou de se soigner à fond s’il a souffert lors des combats précédents.
- Le jeu ne proposant le site de repos qu’à des moments limités, chaque décision a un poids. Apprendre à anticiper les besoins du prochain segment (combats standard vs boss, etc.) est une compétence que le joueur développera au fil des parties.

---

### 📝 **Résumé**

- Les sites de repos offrent un **répit sans combat**, où le joueur peut choisir **une** action bénéfique : se soigner d’un pourcentage de ses PV max, obtenir un bouclier protecteur pour les combats à venir, ou améliorer une de ses cartes bonus.
- Se reposer rend des PV (environ 30% des PV max), le bouclier confère une protection supplémentaire (par exemple +15 PV temporaires), et l’amélioration de carte augmente durablement l’efficacité d’une carte bonus (niveau +1, effet amplifié).
- On ne peut effectuer qu’une seule de ces actions par site de repos, il faut donc choisir en fonction de la situation du héros et des défis imminents.
- Ces choix stratégiques permettent au joueur de **gérer ses ressources de survie** (vie, défense) et de **faire progresser sa puissance** (amélioration du deck bonus) de manière équilibrée tout au long de l’aventure.

```markdown

```
