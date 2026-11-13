# Parcours Dégustation à plusieurs

*Source de vérité du parcours "Dégustation à plusieurs" et des niveaux. Implémentation : `web/src/screens/` (HostNew, HostSession, Join, Reveal) + `web/src/utils/session.js`. Décision : [2026-11-13](../../60_Decisions/2026-11-13-degustation-a-plusieurs.md).*

> Intention de l'hôte : "J'ai acheté cette bouteille, je veux la faire deviner à mes invités."
> Intention de l'invité : "Je déguste à l'aveugle à mon niveau, puis je découvre ce que c'était."

```
Hôte    : Accueil → /host/new (bouteille) → /host/:id (QR code, puis code de révélation)
Invité  : lien ou QR → /join/:token (niveau) → /tasting/:id → /reveal/:id (code) → /comparison/:id → fiche
```

Aucun serveur : la bouteille voyage **chiffrée dans le lien**. Chaque participant garde sa fiche dans son propre journal.

---

## Les trois niveaux

Choisis par chaque dégustateur (invité, ou en solo sur l'écran Sommeil). Le dernier choix est proposé par défaut la fois suivante. Le niveau adapte le formulaire, il ne juge pas.

| | Débutant | Amateur | Expert |
|---|---|---|---|
| Perception | Couleur, arômes, notes | + intensité aromatique | idem Amateur |
| Structure | 2 à 3 champs clés par type, aides affichées d'office | Grille complète, aides `?` à la demande | idem Amateur |
| Hypothèses | Choix à cocher : cépage, région ou pays, tranche d'âge | Cépages, pays, région en saisie libre ; section avancée repliée | Section avancée toujours ouverte : appellation, millésime, producteur, climat, sol |
| Style | Note, coup de cœur, impression | Grille complète | idem Amateur |

**Choix à cocher du Débutant**

- À plusieurs : pour le cépage et l'origine, 4 propositions préparées par l'app de l'hôte : la bonne réponse + 3 leurres **plausibles** (cépages qu'on confond réellement, régions ou pays voisins), complétés au hasard si la base de connaissances n'en a pas assez. L'origine porte sur la région si le vin est français, sinon sur le pays.
- En solo (pas de vérité connue) : les cépages les plus courants pour le type supposé, et la liste des pays.
- L'âge : toujours les 4 mêmes tranches de millésime, calculées sur l'année en cours.

---

## Côté hôte

### 1. Bouteille `/host/new`

Prénom de l'hôte (mémorisé) + formulaire bouteille habituel, photos comprises.

- Minimum : nom du vin, producteur ou appellation.
- Cépage, région (ou pays) et millésime alimentent les choix multiples : un bandeau le rappelle.
- **Ton mot pour la révélation** (optionnel, 280 caractères) : une anecdote, un avis. Chiffré avec la bouteille, lu par les invités à la révélation.
- Avec une clé d'API : la fiche se remplit toute seule dès qu'une photo est ajoutée, et l'interrupteur "Préparer l'accompagnement des invités" (activé par défaut) demande à l'assistant une piste d'attention par niveau, deux indices sur mesure, des propositions plausibles pour le quiz et ce qu'on attend de ce vin.
- "Créer l'invitation" → la bouteille est enregistrée dans le journal de l'hôte (fiche de type Souvenir) et l'invitation est générée.

### 2. Invitation `/host/:id`

Trois cartes, dans l'ordre de la soirée :

1. **Invite tes convives** — QR code + bouton "Partager le lien" (feuille de partage du téléphone).
2. **Laisse-les déguster** — rappel : servir sans montrer la bouteille.
3. **Révèle la bouteille** — le code de révélation (4 lettres) est **masqué par défaut** ; l'hôte l'affiche quand tout le monde a fini et l'annonce à voix haute.

L'écran se rouvre depuis la fiche de la bouteille ("Rouvrir l'invitation et le code").

L'hôte ne déguste pas à l'aveugle : il connaît la bouteille.

---

## Côté invité

### 1. Arrivée `/join/:token`

"{Hôte} t'invite à déguster à l'aveugle" + choix du niveau + "Commencer la dégustation".

- Rouvrir le même lien sur le même appareil reprend la dégustation en cours (ou ouvre la fiche si elle est terminée) : pas de doublon.
- Lien abîmé → message clair, pas de plantage.

### 2. Dégustation `/tasting/:id`

Le wizard du mode Aveugle, adapté au niveau. L'en-tête rappelle "Organisée par {Hôte}".

**Indices à la demande.** À l'étape Hypothèses, l'invité peut demander jusqu'à trois indices, du plus vague au plus précis :

1. le climat d'origine ("Ce vin vient d'un climat plutôt frais.") ;
2. le style du cépage ("C'est un cépage qui donne des rouges puissants et épicés.") ;
3. Débutant : deux cépages sont écartés des propositions. Autres niveaux : l'initiale de la région (ou du pays).

Si l'hôte a activé l'assistant, les deux premiers indices sont ceux qu'il a rédigés pour cette bouteille ; le troisième reste le même.

**Piste d'attention.** Avec l'assistant, un bandeau en haut des étapes Perception et Structure dit au Débutant et à l'Amateur sur quoi se concentrer avec ce vin ("Regarde la finesse des bulles…"), sans rien révéler. L'Expert n'en reçoit pas.

Un indice n'apparaît que si la bouteille permet de le calculer. Le nombre d'indices demandés figure dans le résultat et dans le texte partagé : ce n'est pas une pénalité, c'est une information.

### 3. Révélation `/reveal/:id`

Pas de formulaire bouteille : un champ "code de révélation". Code faux → message, on peut réessayer. Code juste → la bouteille est déchiffrée, la comparaison calculée, la fiche enregistrée.

### 4. Comparaison

Identique au mode Aveugle, **sans score ni classement**, avec en plus le mot de l'hôte et la fiche "Pour comprendre" (profil typique du cépage et de la région, rapproché de ce que l'invité a perçu, plus le texte de l'assistant si l'hôte en a joint un). Bouton "Partager mon résultat" : résumé texte à envoyer dans la messagerie du groupe, par exemple :

```
Ma dégustation à l'aveugle — Les Vignes de Test
3 justes · 1 proche · niveau Débutant
✔ Type : Rouge
✔ Cépage(s) : Syrah
✔ Région : Rhône
≈ Millésime : 2021 à 2023
```

---

## Règle anti-révélation

- Chez l'invité, la vraie bouteille n'existe que chiffrée jusqu'à la saisie du code.
- Les propositions de choix multiples et les codes d'indices sont en clair dans le lien : c'est voulu, ils ne disent rien de plus que ce que l'invité peut voir en jouant.
- Le mot de l'hôte et le texte de l'assistant sont chiffrés avec la bouteille.
- Le code de 4 lettres protège de la curiosité, pas d'un tricheur déterminé.

## Limites connues

- Pas de salle d'attente, pas de révélation simultanée, pas de vue de groupe : il faudrait un serveur.
- Les photos de l'hôte ne sont pas transmises aux invités.
- Modifier la bouteille après avoir créé l'invitation ne met pas à jour le lien déjà partagé.
- Nécessite HTTPS : ne fonctionne pas sur l'adresse de test en Wi-Fi local.
- Un invité qui scanne le QR code arrive dans Safari, pas dans l'app installée : sa fiche est rangée dans le stockage de Safari, que l'iPhone peut effacer après quelques semaines sans visite. S'il veut la garder, il exporte son journal ou installe l'app et l'y importe.
