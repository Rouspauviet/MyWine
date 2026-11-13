# UX Workbench — MyWine

> ⚠️ **Document écrit pour l'ancienne app native (React Native).** Les principes restent valables ; les mentions de scan/OCR, de `tokens.js`, de `StyleSheet` et des écrans `.jsx` de `mobile/` sont obsolètes. Implémentation actuelle : `web/src/` — voir [docs/README.md](../README.md).

*Document de travail UX — à mettre à jour au fil des retours et des tests*

---

## 1. Intentions utilisateur

### Mode Aveugle

**Pourquoi l'utilisateur lance ce mode**
- Il veut tester et entraîner son palais — c'est un exercice de progression personnelle
- Il est en situation de dégustation délibérée (cave, dîner préparé, concours entre amis)
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
- Que la comparaison finale soit trop sévère ou décourageante — il apprend, il ne passe pas un examen

---

### Mode Mémoire

**Pourquoi il lance ce mode**
- Il est à table, il vient de goûter un vin qui lui plaît et veut en garder une trace
- Il consulte la carte des vins et veut noter une bouteille pour y revenir
- Il visite une cave, une foire — il accumule des références rapidement
- Il n'est pas en mode "exercice", il est en mode "capture rapide"

**Ce qu'il veut aller vite**
- Identifier la bouteille en quelques champs (nom, millésime, région au minimum)
- Donner une note et un sentiment en 3 secondes
- Sauvegarder et retourner à la conversation — l'app ne doit pas être le centre d'attention

**Ce qu'il est prêt à détailler**
- Si c'est un coup de cœur, il peut prendre 2 minutes pour tout remplir
- Les accords mets : il vient peut-être de vivre un accord parfait
- Un commentaire libre : l'émotion pendant qu'elle est fraîche
- Le cépage, si c'est ce qui l'a surpris

---

## 2. Rituels clés (moments forts)

### Scan avant / arrière
**Rôle UX** : acte fondateur de la session. Il matérialise l'intention.
- Mode Aveugle : le scan précède tout jugement. L'image est "mise sous scellés" — l'utilisateur la capture mais ne la lit pas encore. L'UI doit renforcer cette idée de mise en réserve.
- Mode Mémoire : le scan est optionnel mais recommandé. Il sert de mémo visuel dans le journal. L'UI peut être plus permissive (pas obligatoire pour continuer).

**Points d'attention**
- La prise de photo doit être rapide — éviter les permissions qui coupent le flux
- Permettre galerie + appareil pour les deux modes
- Proposer "passer sans photo" clairement (surtout Mode Mémoire)

---

### Écran "En sommeil" *(Mode Aveugle uniquement)*
**Rôle UX** : sas de transition psychologique entre la capture et le jugement.
- Signal fort que "l'étiquette est cachée" — pas de retour en arrière possible sans intention
- Crée une micro-anticipation avant le wizard
- Doit être court mais mémorable — c'est le seul écran purement émotionnel de l'app

**Points d'attention**
- Ne pas proposer d'options ou de formulaires ici — c'est un écran de pause
- Le CTA "Commencer la dégustation" doit être le seul choix
- Ton : poétique, pas fonctionnel

---

### Révélation *(Mode Aveugle uniquement)*
**Rôle UX** : moment de vérité — le plus fort émotionnellement. L'image de l'étiquette apparaît pour la première fois.
- L'utilisateur vient de passer par le wizard, il a des hypothèses formées
- La révélation doit être un moment, pas un formulaire
- La saisie des données réelles (producteur, millésime…) se fait immédiatement après — pendant que l'étiquette est sous les yeux

**Points d'attention**
- Afficher l'image grand format en premier, avant les champs
- Rendre la saisie optionnelle si l'utilisateur préfère juste voir le résultat
- Prévoir un état "je ne sais pas / bouteille anonyme"

---

### Comparaison *(Mode Aveugle uniquement)*
**Rôle UX** : bilan pédagogique. Clôture le rituel, offre une lecture de sa propre progression.
- Les badges (Juste / Proche / Raté) doivent être lisibles d'un coup d'œil
- Les insights sont la valeur ajoutée — ils apprennent quelque chose à l'utilisateur
- Le ton doit être encourageant, jamais condescendant

**Points d'attention**
- Ne jamais afficher "Raté" sans contexte ou explication
- Proposer un CTA clair vers le journal (pas juste "Fermer")
- Penser à la réutilisation pédagogique : peut-on voir l'évolution sur plusieurs dégustations ? (Phase 6)

---

## 3. Questions UX ouvertes

### Où placer les hints sans casser l'aveugle ?
**Problème** : les hints (tooltips sur Acidité, Tanins, Corps…) aident l'utilisateur débutant. Mais s'ils donnent trop d'informations, ils brisent l'exercice ou biaisent le jugement.

**Pistes**
- Hints disponibles "à la demande" uniquement (icône ℹ️ à tapper)
- Hints définitionnels uniquement (explication du concept, pas d'exemple de vin)
- Masquer les hints en mode compétition / sans assistance (toggle dans settings ?)
- Afficher les hints après la saisie, pas avant (mode feedback)

**Décision en attente** : la solution actuelle (tooltip toujours visible) a un bug B1. Avant de corriger le bug, décider si c'est le bon pattern.

---

### Jusqu'où guider sans biaiser ?
**Problème** : trop de guidance transforme le wizard en formulaire QCM prévisible. Pas assez de guidance et l'utilisateur débutant est perdu.

**Pistes**
- Étape 1 (Perception) : très guidée — choix fermés pour la robe, arômes par familles
- Étape 2 (Structure) : guidée avec definitions — c'est technique
- Étape 3 (Hypothèses) : champ libre + autocomplete — l'utilisateur doit se mouiller
- Étape 4 (Style) : courte, subjective — laisser la liberté

**Principe proposé** : plus on avance dans le wizard, moins l'app guide. Les premières étapes forment, les dernières libèrent.

---

### Que faire si l'utilisateur connaît déjà partiellement le vin ?
**Scénario** : l'utilisateur voit le vin au restaurant, sait que c'est un Bourgogne rouge mais veut quand même faire l'exercice sur le millésime et le producteur.

**Pistes**
- Permettre de "verrouiller" certains champs d'hypothèses (ex : "Je sais que c'est France > Bourgogne")
- Créer un mode "semi-aveugle" ou des niveaux de difficulté (Phase 6 ?)
- Simplement accepter que l'utilisateur soit honnête — l'app ne peut pas vérifier

**Pour l'instant** : ne rien faire, laisser l'utilisateur remplir ses hypothèses librement.

---

## 4. Hypothèses UX à tester

### H1 — Wizard 4 étapes vs 3
**Hypothèse** : fusionner Perception + Structure en une seule étape réduirait la friction sans perdre de valeur pédagogique.
- Pour : le wizard actuel semble long sur un téléphone
- Contre : la séparation perception / structure est une distinction œnologique importante — elle sert l'apprentissage
- **À tester** : mesurer le taux d'abandon entre étape 1 et étape 4

---

### H2 — Hints automatiques vs à la demande
**Hypothèse** : afficher les hints uniquement à la demande (icône ℹ️) est préférable à l'affichage automatique.
- Pour : moins de bruit visuel, le hint n'est lu que quand l'utilisateur en a besoin
- Contre : l'utilisateur débutant ne sait pas qu'ils existent s'ils sont cachés
- **Compromise possible** : afficher une fois au premier lancement, puis à la demande

---

### H3 — Comparaison immédiate vs différée
**Hypothèse** : permettre de voir la comparaison plus tard (ex : après avoir dormi sur le vin) pourrait être intéressant pour certains profils.
- Pour : certains utilisateurs veulent digérer la dégustation avant de voir leur score
- Contre : la comparaison immédiate est le schéma naturel et le plus satisfaisant
- **Pour l'instant** : comparaison immédiate. Différée à considérer en Phase 6.

---

### H4 — Mode Mémoire : scan obligatoire ou optionnel ?
**Hypothèse** : rendre le scan optionnel en Mode Mémoire augmenterait l'utilisation du mode (moins de friction au démarrage).
- Pour : l'utilisateur n'a pas toujours accès à l'étiquette au moment de la saisie
- Contre : la photo est une ancre mémorielle importante dans le journal
- **Compromise possible** : ajouter une option "Renseigner sans photo" dès l'accueil

---

## 5. Décisions prises — Session UX 2026-02-27

> Détail complet dans `docs/Decisions/`. Ce tableau résume les 10 décisions clés.

| # | Question | Décision | Fichier |
|---|---|---|---|
| Q1 | Photo dans Reveal | Carrefour à 3 choix (scanner / saisir / inconnu) · photo plein écran si scan | `reveal-carrefour.md` |
| Q2 | Format comparaison | Lignes côte à côte (hypothèse → badge → réalité) | `comparison-redesign.md` |
| Q3 | Scan Mode Mémoire | Optionnel — intégré dans le formulaire, pas prérequis | `memory-scan-optional.md` |
| Q4 | Stratégie hints | À la demande uniquement (icône ?) | `hints-on-demand.md` |
| Q5 | Score comparaison | Pas de score global — résumé textuel "2 justes · 1 proche · 1 à revoir" | `comparison-redesign.md` |
| Q6 | Champs Hypothèses | Entonnoir général→particulier · section "Avancé" dépliable (Appellation, Producteur, Millésime) | `hypotheses-structure.md` |
| Q7 | Reveal sans réalité | Conservé mais secondaire — "Je ne connais pas la bouteille" | `reveal-carrefour.md` |
| Q8 | Navigation Comparison | Non terminale — CTA "Voir la fiche" + "Journal" en secondaire | `comparison-redesign.md` |
| Q9 | Minimum Mode Mémoire | Nom/cuvée OU photo obligatoire pour sauvegarder | `memory-scan-optional.md` |
| Q10 | Bouton "Passer" Sleep | Supprimé — remplacé par lien "Tu connais ce vin ? → Mémorise-le" | `blind-no-scan-before-tasting.md` |

## 6. Décision majeure — Architecture Mode Aveugle

**En Mode Aveugle, aucun scan n'a lieu avant la dégustation.**

Le scan est un outil de révélation (Phase 5 = OCR), pas un point d'entrée. Le flux Aveugle ne passe plus par `scan.jsx`. `scan.jsx` reste pour le Mode Mémoire uniquement (accès alternatif avec scan en entrée).

Impact sur les routes :
- `sleep/[scanId].jsx` → `sleep/[draftId].jsx`
- `index.jsx` → CTA Aveugle crée un draft sans scan, navigue vers `/sleep/[draftId]`

---

*Mis à jour : 2026-02-27*
