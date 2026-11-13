# 2026-11-13 — Dégustation à plusieurs et niveaux de dégustateur

## Contexte

- Cas d'usage : l'hôte connaît la bouteille qu'il a achetée, ses invités la dégustent à l'aveugle, chacun sur son téléphone.
- Les invités n'ont pas tous le même bagage : la grille complète décourage un débutant, et une grille simplifiée frustre un connaisseur.
- Contraintes : pas de compte, pas de coût, pas de clé d'API à gérer. L'IA (lecture d'étiquette, profil attendu) est reportée.

## Décision

1. **Trois niveaux**, choisis par chaque dégustateur : Débutant, Amateur, Expert. Le niveau adapte le formulaire, il ne juge pas.
   - Débutant : moins de questions, aides affichées d'office, hypothèses en choix multiples.
   - Amateur : la grille actuelle.
   - Expert : grille complète, section avancée ouverte (appellation, producteur, millésime, climat, sol).
   Le niveau s'applique aussi à la dégustation à l'aveugle en solo.
2. **Dégustation à plusieurs sans serveur.** L'hôte saisit la bouteille ; l'app produit :
   - un **lien d'invitation** (affiché en QR code, partageable) qui contient la bouteille **chiffrée** et les propositions de choix multiples ;
   - un **code de révélation** de 4 lettres, que l'hôte annonce à la fin.
   L'invité ouvre le lien, choisit son niveau, déguste, puis saisit le code : sa comparaison s'affiche et la fiche rejoint son propre journal.
3. **Comparaison bienveillante, sans score ni classement.** Chacun peut partager un résumé texte de son résultat (messagerie du groupe).
4. **Pas d'IA pour l'instant.** L'hôte saisit la bouteille à la main.

## Conséquences

- La règle « données locales » tient toujours : aucune donnée ne passe par un serveur. La bouteille voyage dans le lien que l'hôte choisit de partager.
- « Mono-utilisateur » devient « un journal par appareil » : plusieurs personnes utilisent l'app ensemble, sans compte ni journal commun.
- La règle anti-révélation s'étend aux invités : la vérité reste chiffrée sur leur appareil jusqu'à la saisie du code. Les choix multiples (bonne réponse + 3 leurres) sont en clair dans le lien, c'est voulu.
- Le chiffrement (AES-GCM, clé dérivée du code) protège de la curiosité, pas d'un tricheur déterminé : 4 lettres se devinent par force brute. Acceptable entre amis.
- Le chiffrement exige HTTPS : la dégustation à plusieurs ne fonctionne pas en test local par Wi-Fi (HTTP).
- Limites assumées de la version sans serveur : pas de salle d'attente, pas de révélation simultanée déclenchée par l'hôte, pas de vue de groupe (consensus de la table). Elles demanderaient un serveur et feront l'objet d'une nouvelle décision.
- Les photos de l'hôte ne sont pas transmises aux invités (trop lourdes pour un lien).
- Modèle de données : champs `level` et `session` sur les fiches, `hypotheses.vintageRange` pour les réponses en tranche. Voir `docs/30_Engineering/Data_Model.md`.
