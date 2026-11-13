# 2026-11-14 — Partager son assistant avec un ami

## Contexte

- Premier essai en conditions réelles : un ami a voulu scanner une bouteille. Sans clé d'API, rien ne s'est rempli.
- Demander à chaque ami de créer un compte Anthropic et d'y mettre du crédit est irréaliste.
- Livrer une clé dans l'app, même "chiffrée", est exclu : le code est public, donc quiconque ouvre l'app pourrait la déchiffrer.
- Un relais (petit serveur qui garde la clé) protégerait mieux, mais ajoute un service à créer et à maintenir. Écarté tant que l'usage reste entre amis.

## Décision

1. Dans les paramètres, celui qui a une clé peut **partager son assistant** : l'app produit un lien (et un QR code) qui contient la clé chiffrée, et un **code de 8 lettres** tiré au hasard.
2. Chiffrement AES-GCM, clé dérivée du code par PBKDF2 (600 000 itérations, SHA-256). Sans le code, le lien ne sert à rien. Huit lettres (environ 37 bits) : choix assumé pour rester facile à dicter. Quelqu'un qui intercepterait le lien pourrait retrouver le code hors ligne en quelques mois de carte graphique ; le plafond de dépense borne ce risque.
3. Le lien et le code voyagent **séparément** : le lien par message ou QR code, le code de vive voix.
4. L'ami ouvre le lien, saisit le code : la clé et le modèle choisi s'installent dans son navigateur. Depuis l'app installée, il colle le lien dans les paramètres.
5. Une clé reçue est marquée **prêtée** : l'app ne propose pas de la repartager.
6. **Les invités d'une dégustation n'héritent pas de la clé.** Ils n'en ont pas besoin (tout ce que l'assistant prépare voyage déjà dans l'invitation), et le lien d'invitation, protégé par 4 lettres et diffusé largement, n'est pas un coffre suffisant pour une clé.

## Conséquences

- C'est un partage de **confiance** : l'ami détient réellement la clé et ce qu'il consomme est facturé au propriétaire. L'écran de partage le dit sans détour.
- On ne peut pas retirer l'accès à une seule personne : il faut révoquer la clé dans la console Anthropic, ce qui la retire à tout le monde.
- Recommandation affichée : utiliser une **clé dédiée à MyWine**, dans un espace de travail de la console Anthropic avec un plafond de dépense mensuel. Le pire cas est alors borné.
- Le marquage "prêtée" est une politesse d'interface, pas une protection : quelqu'un de déterminé peut lire la clé dans son navigateur.
- La règle « aucun secret dans le dépôt » est inchangée : la clé n'est jamais dans le code, seulement dans un lien que l'utilisateur génère et envoie lui-même.
- Si l'assistant doit un jour s'ouvrir à des inconnus, ou commenter la dégustation de chaque invité, il faudra un relais ; ce sera une autre décision.
