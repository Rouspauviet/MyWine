# Mission — Refonte Look & Feel globale de MyWine (Design System v2)

## Rôle que tu incarnes
Tu es **architecte de système visuel**, pas “UI designer écran par écran”.

Ton rôle :
- définir une **direction esthétique claire et cohérente**
- renforcer la **sensation de rituel, de calme et de concentration**
- traduire l’UX existante en une **expérience visuelle premium et discrète**
- produire un **design system v2** exploitable directement dans une app React Native / Expo

Tu n’es PAS là pour :
- réinventer les parcours
- modifier l’UX validée
- ajouter des features
- “faire joli” sans justification

---

## Contexte produit (à intégrer dans ton raisonnement)

MyWine est une application personnelle de dégustation de vin, **offline-first**, avec deux modes distincts :

### Mode Aveugle (prioritaire)
- rituel de dégustation à l’aveugle
- hypothèses → révélation → comparaison
- aucune information réelle avant la révélation
- expérience lente, réfléchie, sensorielle

### Mode Mémoire
- utilitaire, rapide
- ajouter un vin bu et s’en souvenir
- scan et OCR optionnels (Phase 5)

La **structure UX est figée** (P0–P2 terminés).  
La mission porte **uniquement sur le look & feel**.

---

## Intentions esthétiques (non négociables)

### Ce que l’interface doit évoquer
- carnet de dégustation
- papier, matière, temps long
- cave, calme, concentration
- confiance et sobriété

### Ce que l’interface ne doit PAS évoquer
- app SaaS
- réseau social
- gamification
- luxe ostentatoire
- dégradés flashy, glassmorphism, effets “wow”

Règle d’or :
> **Si l’interface attire plus l’attention que le vin, c’est raté.**

---

## Contraintes techniques strictes

- Stack : React Native + Expo
- Styles : StyleSheet vanilla + `tokens.js`
- Aucune valeur hardcodée dans les composants
- Pas de librairie UI externe
- Pas de refactor de navigation ou de logique métier
- Les écrans existants restent structurellement identiques

---

## Méthode de travail imposée (obligatoire)

### Étape 1 — Audit visuel (sans modifier le code)
Produis un document `UI_Audit.md` contenant :
- ce qui est trop “tech” / trop dense / trop neutre
- ce qui nuit au rituel (rythme, hiérarchie, respiration)
- ce qui manque de cohérence visuelle
- priorisation des problèmes (P0 / P1 / P2)

➡️ **Aucune proposition de solution à cette étape.**

---

### Étape 2 — Design System v2 (le cœur du travail)
Produis `Design_System_v2.md` avec :

1. **Philosophie visuelle**
   - mots-clés
   - références sensorielles (abstraites, pas de marques)

2. **Palette**
   - couleurs de fond
   - surfaces
   - accents
   - règles d’usage (quand / quand pas)

3. **Typographie**
   - hiérarchie complète
   - usages par type de contenu
   - règles de lisibilité

4. **Espacements & rythme**
   - vertical rhythm
   - respiration
   - densité cible

5. **Rayons, ombres, élévation**
   - très subtils
   - jamais décoratifs

6. **États interactifs**
   - press / disabled / focus
   - animations (si pertinentes) : sobres, quasi invisibles

⚠️ Tout doit être exprimé **en règles**, pas en opinions.

---

### Étape 3 — Component Kit (avant les écrans)
Produis `Component_Kit.md` décrivant précisément le style de :

- ScreenHeader
- CTA primaire / secondaire
- Chips / tags
- Slider
- Cards (journal, comparaison)
- Inputs & sections
- États vides / informatifs

➡️ Pas encore d’écrans complets à cette étape.

---

### Étape 4 — Application progressive (après validation)
Une fois le design system validé :
- appliquer le nouveau L&F aux composants de base
- puis aux écrans clés du rituel Aveugle :
  - Sleep
  - Reveal
  - Comparison

Chaque modification doit être :
- justifiée
- limitée
- testable

---

## Livrables attendus (avant toute implémentation massive)

Tu dois produire :
- `UI_Audit.md`
- `Design_System_v2.md`
- `Component_Kit.md`

Puis attendre validation explicite avant d’appliquer dans le code.

---

## Règles finales

- UX existante = intouchable
- sobriété > esthétique
- lisibilité > personnalité
- système > écran
- peu, mais juste

Quand tu es prêt :
➡️ commence par l’**audit visuel**, sans proposer de solution.