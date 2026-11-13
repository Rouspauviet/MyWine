# UX Workbench — MyWine

*Document de travail UX : intentions, rituels, questions ouvertes. Les parcours tels qu'ils sont construits sont décrits dans [`Flows/`](Flows/).*

---

## 1. Intentions utilisateur

### Mode Aveugle

**Pourquoi l'utilisateur lance ce mode**
- Il veut tester et entraîner son palais — c'est un exercice de progression personnelle
- Il est en situation de dégustation délibérée (cave, dîner préparé, soirée entre amis)
- Il veut objectiver son ressenti avant d'être influencé par l'étiquette ou le prix
- Il cherche la satisfaction de la découverte : "est-ce que j'avais raison ?"

**Ce qu'il accepte comme friction**
- Remplir un wizard multi-étapes — c'est l'exercice, pas un obstacle
- Attendre avant de voir l'étiquette — le délai est intentionnel
- Noter des perceptions fines (robe, arômes, structure) — il est en mode concentration
- Une progression linéaire et guidée — il délègue la structure à l'app

**Ce qu'il ne veut surtout pas**
- Voir des informations qui trahissent le vin avant d'avoir fini ses hypothèses
- Être interrompu par des questions non pertinentes à mi-parcours
- Perdre ses saisies en cas de mauvaise navigation
- Que la comparaison finale soit sévère ou décourageante — il apprend, il ne passe pas un examen

### Mode Mémoire

**Pourquoi il lance ce mode**
- Il est à table, il vient de goûter un vin qui lui plaît et veut en garder une trace
- Il visite une cave, une foire — il accumule des références rapidement
- Il n'est pas en mode "exercice", il est en mode "capture rapide"

**Ce qu'il veut faire vite**
- Identifier la bouteille : une photo de l'étiquette peut suffire
- Donner une note et un sentiment en quelques secondes
- Sauvegarder et retourner à la conversation — l'app ne doit pas être le centre d'attention

**Ce qu'il est prêt à détailler**
- Si c'est un coup de cœur : le prix, où l'acheter, l'accord qui a fonctionné
- Un commentaire libre : l'émotion pendant qu'elle est fraîche

### Dégustation à plusieurs

**L'hôte**
- Il a choisi la bouteille et veut voir ses invités chercher — le plaisir est dans leur surprise
- Il ne veut ni installer quoi que ce soit chez les autres, ni gérer des comptes
- Il veut garder la main sur le moment de la révélation

**L'invité**
- Il n'a pas forcément de vocabulaire du vin et ne veut pas se sentir jugé
- Il veut une réponse à "qu'est-ce que je suis censé remarquer ?" — d'où les niveaux et les aides
- Il veut comparer avec les autres, pour rire et pour apprendre, pas pour être classé

---

## 2. Rituels clés (moments forts)

### Écran "En sommeil" *(Aveugle)*
**Rôle** : sas psychologique entre la vie de table et la concentration.
- Signal fort que "l'étiquette est mise de côté"
- Court mais mémorable ; ton poétique, pas fonctionnel
- Seul contrôle admis : le choix du niveau, parce qu'il conditionne tout le wizard

### Révélation *(Aveugle)*
**Rôle** : le moment de vérité, le plus fort émotionnellement.
- Un moment d'abord, un formulaire ensuite : l'écran "Le moment de vérité" précède la saisie
- En solo, on retourne la bouteille et on la saisit pendant qu'on l'a sous les yeux
- À plusieurs, c'est l'hôte qui déclenche en annonçant le code : la révélation devient un geste collectif
- Toujours prévoir "je ne connais pas la bouteille"

### Comparaison *(Aveugle)*
**Rôle** : bilan pédagogique, clôture du rituel.
- Badges lisibles d'un coup d'œil : Juste / Proche / À revoir
- Les indices sont la valeur ajoutée : ils relient ce qui a été perçu à ce que c'est
- Ton encourageant, jamais condescendant ; pas de score, pas de classement

---

## 3. Principes acquis

- **Guidance décroissante** : plus on avance dans le wizard, moins l'app guide. Perception et Structure sont fermées (chips), Hypothèses demande de se mouiller, Style est libre.
- **Aides à la demande** : icône `?` par champ, texte définitionnel uniquement (un concept, jamais un exemple de vin). Exception : au niveau Débutant, les aides sont affichées d'office.
- **Le type de vin est une hypothèse** : le formulaire suit ce que l'utilisateur croit boire, et ne le corrige jamais en cours de route.
- **Tout est optionnel** dans le wizard : on peut passer une étape sans rien cocher.
- **Rien ne se perd** : autosave continu, reprise depuis l'accueil.
- **Le niveau adapte, il ne juge pas** : il change le nombre et la forme des questions, pas le regard porté sur les réponses.

---

## 4. Questions ouvertes

### Que faire si l'utilisateur connaît déjà partiellement le vin ?
Au restaurant, il sait que c'est un Bourgogne rouge mais veut jouer sur le millésime et le producteur.
- Piste : pouvoir "verrouiller" des hypothèses déjà connues, exclues de la comparaison
- Aujourd'hui : on le laisse remplir librement ; l'app ne peut pas vérifier

### Le débutant apprend-il vraiment quelque chose avec des choix à cocher ?
Les quatre propositions rendent l'exercice accessible, mais le hasard donne une bonne réponse sur quatre.
- Fait : la fiche "Pour comprendre" explique le cépage après la révélation, et les leurres sont plausibles
- À observer : la fiche est-elle lue ? Trop longue, trop savante ?

### Comment faire exister le groupe sans serveur ?
Aujourd'hui chacun partage son résumé dans la messagerie. Il manque la vue d'ensemble : sur quoi la table était d'accord.
- Piste sans serveur : chaque invité montre un QR code de son résultat, l'hôte les scanne
- Piste avec serveur : session en direct (voir [Roadmap](../70_Backlog/Roadmap.md))

### L'étiquette ne dit pas le goût
La comparaison porte sur des faits (cépage, région, millésime), pas sur la perception (acidité, tanins).
- Fait : le profil typique du cépage est rapproché de la perception ; l'assistant IA peut rédiger un profil attendu pour le vin précis
- À observer : les rapprochements sonnent-ils juste face à de vrais vins ?
- Piste : le consensus de la table comme seule vraie référence du goût de cette bouteille-là

---

## 5. Hypothèses à tester

### H1 — Wizard 4 étapes vs 3
Fusionner Perception et Structure réduirait la friction.
- Contre : la distinction est œnologique, elle sert l'apprentissage
- À observer : où les gens décrochent pendant une vraie dégustation

### H2 — Comparaison immédiate vs différée
Certains voudraient digérer la dégustation avant de voir le résultat.
- Aujourd'hui : immédiate. C'est le schéma le plus satisfaisant, à confirmer.

### H3 — Trois niveaux suffisent-ils ?
- À observer : un invité hésite-t-il entre deux niveaux ? Change-t-il d'avis en cours de route ?
- Le niveau n'est pas modifiable une fois la dégustation commencée : est-ce un manque ?
