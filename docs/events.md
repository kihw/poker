### **Événements aléatoires – Fonctionnement complet**

#### **1. Principe des événements**

- Au cours de son voyage, le joueur rencontre ponctuellement des **événements aléatoires** représentés par des nœuds spéciaux sur la carte. Ces événements offrent des **rencontres narratives** ou des situations particulières sans affrontement direct.
- Un événement se déclenche lorsque le joueur atteint un nœud de type événement sur la carte roguelike. L’écran d’événement s’ouvre, présentant une scène, un personnage ou un dilemme auquel le joueur doit faire face.
- Les événements ajoutent de la **variété** et de l’**imprévu** dans la partie. Ils peuvent accorder des bonus, des ressources, voire des cartes au joueur, ou au contraire lui imposer des coûts ou des conséquences négatives en fonction de ses choix.
- Chaque événement est unique dans son descriptif et ses options, contribuant à l’ambiance roguelike en rendant chaque partie différente. Le joueur ne sait pas à l’avance quel événement précis il rencontrera, ce qui l’encourage à s’adapter et à prendre des décisions avec un certain risque.

---

#### **2. Structure d’un événement**

- Un événement se présente généralement sous la forme d’un **texte narratif** accompagné éventuellement d’une illustration ou d’une icône symbolique. Par exemple, il peut s’agir d’un marchand ambulant, d’un sanctuaire mystique, d’un voyageur blessé, etc.
- L’événement comporte un **titre** (exemple : _« Marchand itinérant »_) et une **description** détaillant la situation rencontrée (_« Vous croisez un marchand étrange proposant des offres tentantes... »_).
- Après la description, plusieurs **choix** sont offerts au joueur, sous forme de boutons ou de propositions textuelles. Chaque choix représente une action que le joueur peut entreprendre face à la situation :
  - Un choix est libellé par un court texte explicite (ex: _« Acheter une potion mystérieuse (20 or) »_, _« Partir sans rien faire »_).
  - Certains choix peuvent comporter un **coût immédiat** indiqué entre parenthèses : par exemple, perdre de l’or (_20 or_) ou d’autres ressources pour tenter l’action.
  - La plupart des choix offrent en contrepartie une **récompense potentielle** (objet, bonus, etc.) ou un effet particulier, décrits dans l’intitulé ou implicites dans le contexte.
- Chaque choix peut également avoir une **probabilité de réussite**. Les actions audacieuses ou potentiellement lucratives ne sont pas garanties : une chance (% de réussite) peut être associée. Par exemple, _« tenter de voler l’autel (50% de réussite) »_. Si aucun pourcentage n’est mentionné, on considère que le choix réussit automatiquement.

---

#### **3. Résolution des choix et conséquences**

- Lorsque le joueur valide un choix, l’issue de l’action est calculée :
  - Si le choix impliquait un **coût**, celui-ci est immédiatement déduit (par ex., l’or est soustrait de la réserve du joueur avant de savoir si l’action réussit).
  - Si le choix a une **chance de réussite inférieure à 100%**, le jeu tire un résultat aléatoire. En cas de **réussite**, le joueur obtient la récompense ou l’effet positif annoncé. En cas **d’échec**, l’action ne produit pas l’effet désiré et peut entraîner un résultat alternatif (souvent négatif ou neutre).
- Les **conséquences positives** possibles d’un événement sont variées :
  - **Récupération de PV** : le joueur regagne de la vie (ex: un choix de se reposer chez un voyageur peut rendre des PV).
  - **Gain d’or** : obtention d’or supplémentaire (ex: trouver un trésor, voler un objet de valeur).
  - **Obtention d’objet ou de carte** : le joueur peut recevoir une potion, un objet spécial, ou même une **nouvelle carte bonus** pour sa collection.
  - **Améliorations temporaires** : certains événements confèrent des buffs pour le combat suivant, par ex. _“concentration accrue : +2 cartes lors de la prochaine pioche”_ ou un bonus de dégâts au prochain combat.
  - **Améliorations permanentes** : plus rares, un événement pourrait augmenter un attribut du joueur (ex: +5 PV max) ou octroyer un nouvel emplacement de carte bonus.
- Les **conséquences négatives** en cas d’échec ou de choix risqué peuvent comprendre :
  - **Perte de PV** : le joueur subit des dégâts ou une pénalité en santé (ex: malédiction qui coûte 10 PV).
  - **Perte d’or** : l’investissement est perdu sans gain (ex: on dépense 50 or dans une tentative infructueuse).
  - **Malus temporaire** : un effet néfaste peut s’appliquer (ex: _« malédiction : la prochaine main de combat aura 2 cartes de moins »_).
  - Dans certains cas extrêmes, un événement peut entraîner un combat imprévu ou d’autres complications, bien que les événements standards restent généralement hors combat.
- Une fois les conséquences appliquées, l’événement se termine. Le jeu affiche généralement un **texte de résultat** résumant ce qu’il s’est passé (réussite ou échec du choix et effets correspondants). Ensuite, le joueur retourne sur la carte roguelike et peut continuer sa progression vers le nœud suivant.

---

#### **4. Stratégie et considérations**

- Les événements offrent souvent un **pari** : le joueur doit décider s’il prend un risque pour obtenir un bonus précieux ou s’il reste prudent. Il est important d’évaluer sa situation (PV restants, or disponible, etc.) avant de s’engager dans un choix risqué.
- Les événements peuvent grandement aider le joueur s’ils sont réussis (soin bienvenu avant un combat de boss, gain d’or pour acheter un objet crucial, nouvelle carte bonus puissante, etc.). À l’inverse, un échec peut compliquer la suite de l’aventure.
- Il n’y a pas de bonne ou mauvaise réponse universelle : tout dépend du contexte de la partie. Par exemple, sacrifier 30 or pour un bonus de statistiques peut être judicieux si le joueur est en bonne posture financière, mais dangereux s’il a besoin de cet or pour la boutique à venir.
- Chaque événement étant unique, l’expérience acquise en jouant permettra de mieux anticiper les résultats probables. Avec le temps, le joueur apprend quels événements valent le risque et comment maximiser les bénéfices des rencontres aléatoires.
- Enfin, garder à l’esprit qu’ignorer un événement (_« partir sans rien faire »_) est toujours une option sûre : cela permet de poursuivre l’aventure sans changement, ce qui peut parfois être la meilleure décision si les autres choix semblent trop périlleux.
