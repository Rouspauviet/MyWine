# Expérience visuelle (v3)

*2026-11-14 — développée sur la branche `v3-visuel`, la 2.5 reste en ligne sur `main`.*

## Contexte

MyWine sert à **apprendre à goûter en s'amusant, avec d'autres** : relier ce qu'on perçoit dans le verre à ce qu'il y a dans la bouteille. La boucle tient en quatre temps : percevoir, parier, découvrir, comprendre.

La mécanique de la 2.5 est juste, mais l'expérience reste celle d'un formulaire :

- la récompense (découvrir, comprendre) est un tableau de badges et des paragraphes ;
- "Progresse", promis sur l'accueil, n'est tenu nulle part : le journal est une liste ;
- percevoir passe par des mots à cocher ("rubis") plutôt que par ce qu'on voit.

### Ce que font les autres

| App | Ce qu'on en retient |
|---|---|
| Vinote | Un radar superpose le profil de référence du vin et la note du dégustateur ; sessions à l'aveugle à plusieurs |
| Tasting Notebook | Parcours à l'aveugle : notes, roue des arômes, révélation à la fin |
| Wine Visuals | On note en coloriant la roue des arômes |
| WSET Tasting Notes | Grille officielle, arômes primaires / secondaires / tertiaires |
| Vivino | "Taste profile" : ce qu'on boit par style, région, cépage |
| Spotify Wrapped | Un bilan personnel fonctionne quand il parle de soi (se connaître, se montrer, appartenir) et que le partage est proposé au moment fort |

Constat : la roue des arômes et la comparaison "moi / le profil typique" sont des standards du genre ; le bilan personnel et la révélation mise en scène sont ce qui donne envie de revenir et de partager.

## Décision

Six chantiers, sans toucher au modèle de données ni aux règles du projet (données locales, pas de score, anti-révélation, tendances pas vérités).

### 1. Révélation mise en scène

> En tant que dégustateur, je veux découvrir la bouteille réponse après réponse, pour vivre le moment de vérité au lieu de lire un tableau.

- À l'arrivée sur la Comparaison, les réponses se dévoilent une à une, de la plus large à la plus précise : type, pays, région, appellation, cépage, millésime, producteur, puis la bouteille (nom, photo).
- Chaque carte rappelle l'hypothèse, puis montre la réalité et son badge. Le dégustateur avance au toucher ; "Tout révéler" saute la séquence.
- La séquence ne joue qu'une fois, à la sortie de la Révélation. Rouvrir la fiche montre directement le résultat.
- Mouvement réduit (réglage d'accessibilité du téléphone) : pas d'animation, même déroulé.

### 2. Ma perception face au profil typique

> En tant que dégustateur, je veux voir d'un coup d'œil où ma perception rejoint ou quitte le profil du cépage, pour comprendre sans lire.

- Une glissière par axe (tanins, corps, acidité) : un repère "Toi", un repère "Typique". Des glissières plutôt qu'un radar : les données ont trois niveaux et un blanc n'a que deux axes.
- Les arômes typiques du cépage, ceux que le dégustateur a sentis mis en avant.
- Rouges et blancs tranquilles dont le cépage est dans la base ; sinon la carte n'apparaît pas.

### 3. Carte

> En tant que dégustateur, je veux voir où je situais le vin et d'où il vient ; et, au fil du temps, les régions que j'ai goûtées.

- Carte de France stylisée, dessinée dans l'app (aucun fond de carte tiers) : les quatorze régions viticoles de la base.
- Comparaison : la région réelle, la région supposée, un trait entre les deux.
- "Mon palais" : la taille du point suit le nombre de bouteilles ; toucher une région donne son détail. Les vins étrangers sont listés par pays sous la carte.

### 4. Mon palais

> En tant qu'utilisateur régulier, je veux un portrait de ce que je bois, de ce que j'aime et de ce que je reconnais, pour me connaître et voir que j'avance.

- Nouvel écran `/palate`, ouvert depuis l'accueil et le journal. Calculé à l'affichage à partir du journal, rien n'est stocké.
- Ce que je bois (types, cépages, carte), ce que j'aime (styles et cépages les mieux notés), ce que je reconnais à l'aveugle (juste / proche / à revoir par champ), mes penchants (écart moyen entre ma perception et le profil typique).
- Pas de score ni de classement : ni pourcentage global, ni niveau, ni comparaison avec d'autres. Un penchant n'est affiché qu'à partir de trois dégustations qui vont dans le même sens.

### 5. Saisie sensorielle

> En tant que dégustateur, verre en main, je veux désigner ce que je vois et sens plutôt que choisir un mot dans une liste.

- Robe : un nuancier de pastilles colorées.
- Arômes : une roue à toucher, une part par famille.
- Structure : des jauges pour les échelles ordonnées (tanins, acidité, corps, longueur…). Les choix non ordonnés restent des pastilles de texte.
- Les valeurs enregistrées sont les mêmes qu'avant : fiches et sauvegardes existantes restent lisibles.

### 6. Carte de résultat en image

> En tant que joueur, je veux envoyer mon résultat dans le groupe sous une forme qu'on a envie de regarder.

- "Partager mon résultat" produit une image (nom du vin, réponses, niveau), en solo comme à plusieurs. Si le téléphone ne sait pas partager une image, le texte actuel est envoyé.

### 7. Carte des saveurs

> En tant que dégustateur, je veux voir à quels cépages ressemble ce que je perçois, pour raisonner avec les yeux.

- Inspirée de la méthode du "napping" (article *Learning to Taste*, DTU et Vivino, 2023) : sur un plan, deux vins proches se ressemblent en bouche. Leurs données ne sont pas réutilisables (licence non commerciale, sans œuvre dérivée) : la carte est calculée avec la base de l'app.
- Horizontal : la matière (tanins et corps pour un rouge, corps pour un blanc). Vertical : la fraîcheur (acidité). Une carte pour les rouges, une pour les blancs.
- Pendant la dégustation (Débutant : avant le choix du cépage ; Amateur : dans "Aide-moi à raisonner") : "Voici où tes notes te placent". Elle ne montre que la base de connaissances, jamais la bouteille.
- À la comparaison : le cépage de la bouteille et l'endroit où la perception plaçait le vin, reliés par un trait.
- Dans "Mon palais" : les cépages goûtés, plus gros avec le nombre de bouteilles.

### 8. Fiche cépage

> En tant que curieux, je veux ouvrir la fiche d'un cépage pour savoir à quoi il ressemble, avec qui on le confond et où il pousse.

- Écran `/grape/:name`, ouvert en touchant un cépage (comparaison, cartes des saveurs, entraînement).
- Profil sur cinq crans, arômes précis, voisins sur la carte des saveurs, régions sur la carte de France, pays hors de France, et ses bouteilles dans le journal.
- Forme inspirée des fiches de Winography ; aucun contenu repris, la base est rédigée pour l'app.

### 9. Base de cépages affinée, arômes précis

- Chaque cépage reçoit un profil de 1 à 5 (tanins, corps, acidité), quatre arômes précis, ses régions françaises et ses pays (`data/grapeProfiles.js`). Les profils à trois niveaux de `wineKnowledge.js` restent en place pour le raisonnement, les indices et les leurres.
- Les échelles de saisie ne changent pas : une saisie à trois niveaux est placée à 1,5 · 3 · 4,5, et on compare par bande (faible, moyen, fort).
- Confirmé et Expert : sous la roue, les arômes précis des familles touchées ("Plus précisément"). Nouveau champ `perception.aromaNotes`, absent des anciennes fiches.

### 10. Comparer plutôt que décrire

> En tant que débutant, je situe plus facilement un vin par rapport à un autre que sur une échelle.

- À l'étape Structure, le Débutant peut placer le corps du vin par rapport à sa dernière dégustation à l'aveugle du même type : "Plus léger / Pareil / Plus ample". La réponse règle la jauge. Sans dégustation antérieure, rien ne s'affiche.

### 11. Entraînement

> Entre deux bouteilles, je veux m'exercer à reconnaître un cépage à son profil.

- Écran `/quiz`, ouvert depuis "Mon palais" et les fiches cépage : un profil, quatre propositions dont les cépages qu'on confond avec lui, puis l'explication et le lien vers la fiche.
- Ni score, ni série, ni compteur.

### Écartés pour l'instant

- La note libre lue par l'assistant : demande une clé chez chaque dégustateur.
- La "nappe" (placer les vins d'une soirée les uns par rapport aux autres) : suppose la soirée à plusieurs bouteilles, qui est un chantier à part.

## Conséquences

- Aucune dépendance ajoutée : graphiques, carte et roue sont en SVG écrits dans l'app, l'image de partage passe par un canvas.
- Nouvelles couleurs dans `tokens.css` (robes, familles aromatiques) : elles restent la seule source des valeurs visuelles.
- La carte ne couvre que la France ; les vins étrangers n'ont pas de carte.
- "Mon palais" n'a d'intérêt qu'avec quelques fiches : en dessous, l'écran dit ce qu'il montrera.
- Le Design System v2 est à compléter avec ces composants une fois l'ensemble validé sur iPhone.
- Retour arrière possible : `main` reste en 2.5 tant que la branche n'est pas fusionnée.
