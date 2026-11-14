# 2026-11-14 — Guider la dégustation à l'aveugle, niveau par niveau

## Contexte

- Premier essai à plusieurs : au niveau Débutant, l'écran Hypothèses montrait quatre cépages à cocher. Ce n'est pas une aide, c'est un quiz, et ce soir-là les propositions recoupaient les cépages de la bouteille.
- Ce qu'on veut : que l'app **guide** le joueur à partir de ce qu'il a lui-même noté ("tu as noté des tanins discrets et des fruits rouges : as-tu pensé à…"), avec un degré d'aide qui dépend de son niveau.
- Contrainte : un invité n'a pas de clé d'API, il ne fait aucun appel à l'assistant. Tout ce que l'assistant sait est préparé chez l'hôte et voyage dans l'invitation.

## Décision

1. **Quatre niveaux** : Débutant, Amateur, Confirmé, Expert. Le niveau règle le degré d'aide, il ne juge toujours pas.
2. **Raisonnement embarqué** (`web/src/utils/reasoning.js`) : l'app croise les notes du joueur (tanins, corps, acidité, arômes, maturité du fruit) avec la base de cépages, et en tire un climat probable, des styles et des cépages compatibles, chacun avec ses raisons. Il fonctionne sans clé et sans réseau, et ne peut rien révéler : il ne part que des perceptions du joueur, jamais de la bouteille.
3. **L'assistant de l'hôte complète** ce raisonnement avec des relances propres à la bouteille, par écran et par niveau (piste B). Un dialogue avec l'IA chez chaque joueur (piste C) est écarté pour l'instant : il demanderait une clé chez chacun ou un relais.
4. **Degré d'aide par écran** :

| Écran | Débutant | Amateur | Confirmé | Expert |
|---|---|---|---|---|
| Type de vin | Identique pour tous | | | |
| Perception | Consigne concrète à chaque geste, arômes par familles, piste de l'assistant | Grille complète, piste de l'assistant | Grille complète | Grille complète |
| Structure | Trois critères expliqués par la sensation | Grille complète, aides repliées | Grille complète | Grille complète |
| Hypothèses | Raisonnement guidé en trois marches : climat, style, cépage | Saisie libre, bouton "Aide-moi à raisonner" | Saisie libre, indices sur demande | Tout ouvert, aucune aide |
| Style | Deux questions simples | Complet | Complet | Complet |
| Révélation | Identique pour tous | | | |
| Comparaison | Explication pas à pas | Fiche "Pour comprendre" | Avec les écarts à la typicité | Idem |

5. **Le quiz du Débutant reste, mais en dernière marche.** Chaque proposition de cépage dit en quoi elle colle ou non avec les notes du joueur. Pour un assemblage, on ne demande que le cépage dominant, et aucun autre cépage de la bouteille ne figure parmi les leurres (y compris sous un autre nom : "Grenache noir", "Cabernet-Sauvignon").
6. **L'aide utilisée apparaît dans le résultat**, sans jugement : nombre d'indices, aide au raisonnement.
7. **Le dossier de la bouteille** est enrichi au scan par le modèle lui-même (typicité du cépage, de l'appellation, du millésime). Aucune base de vin gratuite et sérieuse n'offre d'API ; la recherche web de l'API Claude reste une option pour ce qui est propre à la cuvée, à condition de tenir le budget de 10 centimes par soirée.

## Conséquences

- Le raisonnement embarqué ne couvre que les rouges et les blancs tranquilles, et la trentaine de cépages de la base. Pour un rosé, un pétillant ou un vin orange, le Débutant garde les choix à cocher sans les marches.
- Tout ce que dit le raisonnement est une **tendance** : il propose des pistes, il ne corrige pas. Un joueur peut choisir un cépage qui "s'écarte" de ses notes.
- Nouveau champ `hypotheses.styleGuess` et drapeau `reasoningUsed` sur la fiche ; les fiches existantes se lisent sans eux.
- Les fiches de niveau `expert` déjà enregistrées gardent leur niveau ; `confirme` est une nouvelle valeur.
- Tant que l'usage reste entre amis, le risque qu'un texte de l'assistant en dise trop pendant la dégustation est accepté ; le garde-fou `revealsBottle()` reste en place.
- Mise en œuvre par étapes : (1) quatre niveaux, raisonnement embarqué, écran Hypothèses ; (2) relances de l'assistant par écran et dossier enrichi ; (3) écran Comparaison par niveau.
