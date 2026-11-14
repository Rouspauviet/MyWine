# Parcours Aveugle

*Source de vérité du parcours "Dégustation à l'aveugle". Implémentation : `web/src/screens/` (Sleep, Tasting, Reveal, Comparison).*

> Intention : "Je veux déguster sans savoir ce que je bois, puis découvrir si j'ai deviné juste."

```
Accueil
  → /sleep                 rituel de transition
  → /tasting/:id  étape 0  type de vin (hypothèse)
  → /tasting/:id  étapes 1-4  Perception · Structure · Hypothèses · Style
  → /reveal/:id            moment de vérité, puis saisie de la bouteille
  → /comparison/:id        hypothèses vs réalité
  → /entry/:id             fiche complète au journal
```

**Règle anti-révélation** : aucun écran avant `/reveal` n'affiche ni ne demande une information réelle sur la bouteille (pas de photo, pas de nom, pas de prix).

---

## 1. Accueil `/`

- Bouton primaire "Dégustation à l'aveugle" → `/sleep`.
- Si une dégustation est en cours, une carte "Reprendre la dégustation en cours" (type, étape, date) ramène au wizard.

## 2. Sommeil `/sleep`

Rituel : "Avant de découvrir ce vin… Ne regarde pas l'étiquette." En solo, l'app ne connaît pas la bouteille : le texte s'adresse au dégustateur, il ne prétend pas qu'elle est cachée quelque part.

- Choix du **niveau** (Débutant / Amateur / Confirmé / Expert) : il règle le degré d'aide à chaque étape — voir [Group.md](Group.md#les-quatre-niveaux). Le dernier niveau choisi est proposé par défaut.
- "Commencer la dégustation" → **crée le brouillon** (`mode: 'blind'`, `status: 'draft'`) puis ouvre le wizard. Le brouillon n'est pas créé avant ce clic : pas de brouillon orphelin.
- Lien "Tu connais déjà ce vin ? → Mémorise-le" → `/memory/new`.

## 3. Type de vin — étape 0

Rouge · Blanc · Rosé · Pétillant · Orange · Clairet · Autre.

- Le type est une **hypothèse**, jamais une vérité : il pilote le contenu des étapes Perception et Structure (voir [Tasting_Grammars.md](../Tasting_Grammars.md)).
- Changer de type après avoir saisi robe, arômes ou structure demande confirmation et efface ces trois éléments. Hypothèses et style sont conservés.
- Clairet et Autre n'ont pas de grammaire dédiée : l'étape Structure passe en saisie libre (corps, longueur, notes).
- Retour depuis l'étape 0 sans type choisi → le brouillon vide est supprimé.

## 4. Wizard — étapes 1 à 4

Le tableau décrit le niveau **Amateur**. Débutant : moins de champs et hypothèses en choix à cocher. Expert : section avancée toujours ouverte.

| Étape | Contenu |
|---|---|
| 1 · Perception | Robe sur un **nuancier** de pastilles colorées · intensité aromatique 1–5 · familles aromatiques sur une **roue des arômes** à toucher · notes libres |
| 2 · Structure | Une grammaire par type : tanins (rouge), tension (blanc), fraîcheur (rosé), effervescence (pétillant), phénolique (orange). Les échelles ordonnées (tanins, acidité, corps, longueur…) se saisissent sur une **jauge**, les choix non ordonnés restent des pastilles. Aides `?` à la demande. Champs conditionnels (ex : texture des tanins seulement si tanins présents). |
| 3 · Hypothèses | Cépage(s) avec autocomplétion · confiance 1–5 · pays · région. Section dépliable "Tu veux pousser l'exercice ?" : climat, sol, appellation, producteur, millésime. |
| 4 · Style | Style · note · coup de cœur · accords · impression globale · occasion |

Comportements :

- **Saisie sensorielle** : on désigne ce qu'on voit et sent plutôt que de choisir un mot. Les valeurs enregistrées sont inchangées — décision [`2026-11-14`](../../60_Decisions/2026-11-14-experience-visuelle.md).
- **Tout est optionnel** : on peut avancer sans rien remplir.
- **Autosave** : chaque modification est enregistrée (délai 400 ms) et à chaque changement d'étape. Fermer l'app ne perd rien.
- "Abandonner" demande confirmation et **supprime** le brouillon. Pour faire une pause, on quitte simplement l'écran.
- "Terminer" à l'étape 4 → `/reveal/:id`.

## 5. Révélation `/reveal/:id`

*Dégustation à plusieurs : l'invité ne voit pas ces deux états mais un champ "code de révélation" — voir [Group.md](Group.md).*

**État A — Le moment de vérité.** L'app ne sait rien de la bouteille : elle invite à aller la regarder et à la photographier, sans laisser croire qu'elle va la révéler elle-même. Quatre actions :

- "Photographier l'étiquette" (bouton principal) → ouvre l'appareil photo, puis état B avec la photo déjà ajoutée (et la fiche remplie par l'assistant s'il est activé).
- "Saisir la bouteille sans photo" → état B.
- "Je ne connais pas la bouteille" → après confirmation, la fiche est enregistrée sans réalité (comparaison impossible, complétable plus tard).
- "Revenir à mes notes" → retour au wizard.

**État B — La réalité.** Formulaire bouteille partagé avec le mode Mémoire : photos, type, cuvée, producteur, appellation (autocomplétion → région et pays déduits), région, pays, millésime, alcool, cépages, prix, lieu d'achat, vignerons.

"Comparer et enregistrer" → calcule la comparaison, passe la fiche en `status: 'done'`, ouvre la comparaison sur la mise en scène.

**État C — La mise en scène.** Les réponses se dévoilent une à une, de la plus large à la plus précise (type, pays, région, appellation, cépage, millésime, producteur), puis la bouteille (nom, photo). Chaque carte rappelle l'hypothèse puis montre la réalité et son badge. On avance au toucher ; "Tout révéler" saute la séquence. Elle ne joue qu'une fois : rouvrir la comparaison ou la fiche montre directement le résultat. Vaut aussi pour l'invité d'une dégustation à plusieurs, après le code.

## 6. Comparaison `/comparison/:id`

- Résumé : "3 justes · 1 proche · 1 à revoir" + confiance annoncée.
- Tableau côte à côte **Mes hypothèses | badge | La réalité** pour : type, cépages, pays, région, appellation, millésime, producteur.
- Carte "D'où il vient" : carte de France avec la région de la bouteille et, si elle diffère, la région supposée reliée par un trait. Absente pour un vin étranger ou une région hors de la base.
- Carte "Pour comprendre" : en tête, **le profil comparé** — une glissière par axe (tanins, corps, acidité) avec un repère "Toi" et un repère "Typique du cépage", puis les arômes typiques, ceux qui ont été sentis mis en avant (rouges et blancs dont le cépage est dans la base). Suivent le profil typique du cépage et de la région, et rapprochement avec la perception. Une perception identique au profil est confirmée ("Des tanins marqués : c'est typique du cépage Syrah"), une perception opposée est expliquée sans jugement, une perception voisine n'est pas commentée.
- Carte "À retenir" : jusqu'à 2 indices déduits de la structure perçue, plus climat et sol perçus.

Règles de comparaison (`web/src/utils/comparison.js`) :

| Champ | Juste | Proche | À revoir |
|---|---|---|---|
| Type | identique | — | différent |
| Cépages | au moins un cépage commun | un nom en contient un autre | aucun |
| Pays, région, appellation, producteur | identique (sans casse ni accents) | l'un contient l'autre | sinon |
| Millésime | identique | écart ≤ 2 ans | sinon |
| Millésime en tranche (Débutant) | la réalité est dans la tranche | à 2 ans de la tranche | sinon |

Un champ n'est comparé que si l'hypothèse **et** la réalité sont renseignées. Pas de score global chiffré.

"Partager mon résultat" (en solo comme à plusieurs) envoie une **image** : nom du vin, réponses et verdicts, niveau. Si le téléphone ne sait pas partager une image, le résumé texte est envoyé.

## 6 bis. Mon palais `/palate`

Ouvert depuis l'accueil et le journal. Un portrait calculé à l'affichage, sans score ni classement :

- **Ce que je bois** : répartition par type, cépages les plus goûtés.
- **Mon tour de France** : la carte, un point par région goûtée, plus gros avec le nombre de bouteilles ; toucher une région donne son détail et un lien vers ses bouteilles. Vins étrangers listés par pays.
- **Ce que j'aime** : cépages et régions les mieux notés (à partir de deux vins notés).
- **Ce que je reconnais à l'aveugle** : juste / proche / à revoir, champ par champ.
- **Mes penchants** : "Tu perçois souvent les tanins plus marqués que le profil typique" — affiché à partir de trois dégustations et d'un écart moyen d'un demi-niveau.

## 7. Fiche `/entry/:id`

Photos, bouteille, impression, puis résumé + tableau de comparaison, perception et structure.

Modifier une fiche à l'aveugle ne permet de corriger que **la réalité et l'impression** : les notes et hypothèses restent figées, et la comparaison est recalculée.
