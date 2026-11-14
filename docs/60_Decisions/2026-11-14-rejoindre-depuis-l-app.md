# Rejoindre une dégustation depuis l'app

*2026-11-14*

## Contexte

Sur iPhone, un QR code scanné avec l'appareil photo s'ouvre toujours dans Safari, jamais dans l'app installée sur l'écran d'accueil, et les deux ont des stockages séparés. Un joueur qui a déjà MyWine installée voyait donc ses dégustations de groupe rangées dans un second journal, côté Safari, que l'iPhone peut effacer après quelques semaines sans visite. Son vrai journal ne s'enrichissait pas.

L'accueil menait directement à la création d'une invitation : rien ne permettait de rejoindre une dégustation depuis l'app.

## Décision

- Le bouton "Dégustation à plusieurs" de l'accueil ouvre un écran de choix `/group` : **Faire deviner une bouteille** (hôte) ou **Rejoindre une dégustation** (invité). L'accueil garde ses trois boutons.
- "Rejoindre" ouvre `/join` : un lecteur de QR code intégré (caméra arrière), et un champ pour coller le lien en secours. Le lien lu mène à l'écran d'arrivée habituel `/join/:token`.
- La lecture du QR code utilise la bibliothèque `jsqr`, chargée seulement à l'ouverture de cet écran. Safari ne fournit pas de lecteur natif.
- L'écran d'arrivée ouvert dans un navigateur affiche une ligne discrète invitant ceux qui ont l'app à passer par elle. Elle n'apparaît pas dans l'app installée.

## Conséquences

- Un joueur équipé range sa fiche dans son journal, à condition d'ouvrir l'app avant de scanner : c'est un réflexe à prendre, que la ligne de l'écran d'arrivée rappelle.
- Un clic de plus pour l'hôte entre l'accueil et la fiche bouteille.
- Le lecteur demande l'autorisation de l'appareil photo ; refusée ou indisponible, le collage du lien reste possible.
- Le lecteur accepte aussi le QR code d'un assistant prêté.
- Non traité : rapatrier dans l'app une fiche déjà créée côté Safari. À faire si le cas revient souvent.
- Vue des réponses de la tablée chez l'hôte : **écartée**. Le suivi en direct demanderait un serveur relais ou une liaison directe entre téléphones passant par un service tiers de mise en relation ; dans les deux cas, les invités seraient exposés à un tiers (adresses réseau, surface d'attaque) pour un simple confort. Le scan du résultat en fin de partie, seule voie sans tiers, n'apporte pas assez. À ne rouvrir que si une voie sans exposition des invités apparaît.
