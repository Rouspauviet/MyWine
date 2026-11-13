# Design System — MyWine
**v1.0 · Mobile-first · Offline PWA**
*2026-02-26*

---

## 1. Direction Visuelle

**Positionnement** : Minimalisme organique. L'app évoque la matière, le papier, la cave, une lumière tamisée, une étiquette sobre.

**À éviter** : dégradés flashy, glassmorphism, skeuomorphisme, icônes trop illustratives, gamification, codes "réseau social".

**Ambiance cible** : calme, concentration, mémoire, sensualité discrète.

---

## 2. Palette de Couleurs

### Neutres fondamentaux

| Variable | Clair | Sombre |
|---|---|---|
| `--color-bg` | `#F6F4EF` (blanc cassé chaud) | `#121212` (noir profond chaud) |
| `--color-surface` | `#FFFFFF` | `#1A1A1A` |
| `--color-surface-raised` | `#FAFAF7` | `#222222` |
| `--color-border` | `#E8E4DC` | `#2E2E2E` |
| `--color-text-primary` | `#1C1C1C` | `#F2F2F2` |
| `--color-text-secondary` | `#6B6B6B` | `#B5B5B5` |
| `--color-text-disabled` | `#ADADAD` | `#555555` |

### Couleur primaire (identité)

| Variable | Clair | Sombre |
|---|---|---|
| `--color-primary` | `#6E2C2C` (rouge vin désaturé) | `#8C3A3A` |
| `--color-primary-hover` | `#5A2323` | `#7A3030` |
| `--color-primary-subtle` | `#F5ECEC` | `#2A1A1A` |

> Le rouge primaire est utilisé uniquement pour les CTA, accents actifs et sélections. Il n'est jamais utilisé comme fond de grande surface.

### Couleurs secondaires — types de vin

Utilisées **uniquement** pour badges, pastilles et tags. Jamais en fond de carte.

| Type | Variable | Valeur |
|---|---|---|
| 🔴 Rouge | `--wine-red` | `#7A3E3E` |
| ⚪ Blanc | `--wine-white` | `#C9B98E` |
| 🌸 Rosé | `--wine-rose` | `#D8A7A7` |
| 🍷 Clairet | `--wine-clairet` | `#A0646A` |
| 🟠 Orange | `--wine-orange` | `#C47A3A` |
| ✨ Pétillant | `--wine-sparkling` | `#9FAF8F` |
| ⚫ Autre | `--wine-other` | `#8A8A7A` |

### Couleurs fonctionnelles

| Usage | Variable | Valeur |
|---|---|---|
| Succès | `--color-success` | `#2E7D5A` |
| Erreur | `--color-error` | `#B23A3A` |
| Information | `--color-info` | `#3A5A7A` |
| Warning | `--color-warning` | `#A06B2A` |

---

## 3. Typographie

**Stratégie** : Playfair Display (titres) + Inter (corps). Chargées via Google Fonts sur l'installation initiale de la PWA, puis mises en cache par le Service Worker — aucune dépendance réseau au runtime.

```css
/* Import Google Fonts (dans index.html — mis en cache SW) */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500;600&display=swap');
```

> **Alternative ultra-simple** : Inter uniquement si Playfair Display alourdit trop le bundle.

### Variables typographiques

```css
--font-display: 'Playfair Display', Georgia, serif;
--font-body:    'Inter', system-ui, sans-serif;

/* Échelle mobile-first */
--text-xs:   12px;  /* Caption, labels discrets */
--text-sm:   14px;  /* Body small, metadata */
--text-base: 16px;  /* Body principal */
--text-lg:   20px;  /* H3, sous-titres */
--text-xl:   24px;  /* H2 */
--text-2xl:  28px;  /* H1, nom du vin */

--leading-tight:  1.3;
--leading-normal: 1.5;
--leading-loose:  1.7;

--weight-regular:  400;
--weight-medium:   500;
--weight-semibold: 600;
```

---

## 4. Tokens CSS Complets

```css
:root {
  /* === Couleurs === */
  --color-bg:              #F6F4EF;
  --color-surface:         #FFFFFF;
  --color-surface-raised:  #FAFAF7;
  --color-border:          #E8E4DC;
  --color-text-primary:    #1C1C1C;
  --color-text-secondary:  #6B6B6B;
  --color-text-disabled:   #ADADAD;

  --color-primary:         #6E2C2C;
  --color-primary-hover:   #5A2323;
  --color-primary-subtle:  #F5ECEC;

  --color-success: #2E7D5A;
  --color-error:   #B23A3A;
  --color-info:    #3A5A7A;
  --color-warning: #A06B2A;

  /* Types de vin */
  --wine-red:       #7A3E3E;
  --wine-white:     #C9B98E;
  --wine-rose:      #D8A7A7;
  --wine-clairet:   #A0646A;
  --wine-orange:    #C47A3A;
  --wine-sparkling: #9FAF8F;
  --wine-other:     #8A8A7A;

  /* === Espacements (base 4px) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* === Rayons (organiques, angles doux) === */
  --radius-sm: 6px;   /* Tags, chips, inputs */
  --radius-md: 12px;  /* Cartes WineCard */
  --radius-lg: 18px;  /* Boutons */
  --radius-xl: 24px;  /* Bottom sheet, modales */
  --radius-full: 9999px; /* Pastilles couleur, badges ronds */

  /* === Ombres (subtiles) === */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.08);

  /* === Transitions === */
  --transition-fast:   120ms ease;
  --transition-normal: 220ms ease;
  --transition-slow:   380ms ease;

  /* === Layout mobile === */
  --bottom-nav-height: 64px;
  --header-height:     56px;
  --safe-area-bottom:  env(safe-area-inset-bottom, 0px); /* iOS notch */
}

/* === Mode Sombre === */
[data-theme="dark"] {
  --color-bg:              #121212;
  --color-surface:         #1A1A1A;
  --color-surface-raised:  #222222;
  --color-border:          #2E2E2E;
  --color-text-primary:    #F2F2F2;
  --color-text-secondary:  #B5B5B5;
  --color-text-disabled:   #555555;

  --color-primary:        #8C3A3A;
  --color-primary-hover:  #7A3030;
  --color-primary-subtle: #2A1A1A;

  /* Ombres réduites en dark (élévations lumineuses subtiles) */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.20);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.25);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.30);
}
```

---

## 5. États Interactifs

| État | Règle |
|---|---|
| **Hover** | Légère variation de luminosité (`filter: brightness(0.94)`) |
| **Active / Press** | Réduction d'échelle subtile (`transform: scale(0.98)`) |
| **Focus** | Outline fin couleur primaire (`outline: 2px solid var(--color-primary)`, `offset: 2px`) |
| **Disabled** | Opacité réduite (`opacity: 0.45`), cursor `not-allowed` |

---

## 6. Composants Clés — Règles d'application

### WineCard (liste)
- Fond : `--color-surface` + `--shadow-sm`
- Rayon : `--radius-md`
- Pastille couleur : `--radius-full`, couleur `--wine-{type}`
- Padding : `--space-4`

### Bouton principal (CTA)
- Fond : `--color-primary`
- Rayon : `--radius-lg`
- Typo : `--font-body`, `--weight-semibold`, `--text-base`
- État hover : `--color-primary-hover`

### Chips de sélection (couleur, arômes)
- Fond inactif : `--color-surface-raised`, border `--color-border`
- Fond actif : `--color-primary-subtle`, border `--color-primary`
- Rayon : `--radius-sm`

### Sliders (structure en bouche)
- Track : `--color-border`
- Fill : `--color-primary`
- Thumb : cercle 18px, `--color-primary`

### Bottom Navigation
- Hauteur : `--bottom-nav-height` + `--safe-area-bottom`
- Fond : `--color-surface` + `--shadow-sm` (inversé, au-dessus)
- Item actif : `--color-primary`
- Item inactif : `--color-text-secondary`

### Bottom Sheet (filtres, confirmation)
- Fond : `--color-surface`
- Rayon haut : `--radius-xl`
- Poignée : 32px × 4px, `--color-border`, `--radius-full`

---

## 7. Stratégie Dark Mode

- Détection automatique via `prefers-color-scheme: dark` au premier lancement
- Sauvegarde du choix utilisateur dans `localStorage`
- Application via l'attribut `data-theme="dark"` sur `<html>`
- Le mode sombre évoque : cave, nuit, ambiance dégustation — jamais une simple inversion

---

---

## 8. Parcours Utilisateurs — Deux Modes

> Cette section documente l'architecture UX de l'app. Elle est distincte des tokens visuels mais en est inséparable : les deux modes doivent se distinguer à l'écran sans rupture de cohérence.

### Philosophie

MyWine couvre deux **intentions fondamentalement différentes** que l'interface doit rendre immédiatement lisibles.

---

### Mode A — "Mémoire" · *J'ai bu ce vin, je veux m'en souvenir*

**Contexte** : la bouteille est bue (ou en cours). L'étiquette est visible. L'utilisateur veut noter rapidement avant d'oublier.

**Principe** : scan → identité connue → impression subjective → sauvegarde. **L'ordre naturel.**

**Flux cible :**
1. Home → CTA "Mémoriser un vin"
2. Scan étiquette (visible, normale)
3. Formulaire "La bouteille" — pré-rempli par OCR (Phase 5) : producteur, cuvée, appellation, région, millésime, cépages, degré
4. Formulaire "Mon impression" — court : note ★ (1–5), coup de cœur, accords, commentaire libre
5. Sauvegarde → Journal

**Durée cible** : 1–2 minutes.

**Ce que ce mode ne contient pas** : wizard hypothèses, sleeping screen, étape de révélation, comparaison.

---

### Mode B — "Aveugle" · *Je fais une dégustation à l'aveugle*

**Contexte** : le vin est inconnu du dégustateur (versé ou scanné par quelqu'un d'autre, étiquette cachée). Il s'agit de tester et d'éduquer son palais.

**Principe** : hypothèses d'abord → réalité ensuite → comparaison. **L'ordre inversé.**

**Flux cible :**
1. Home → CTA "Dégustation à l'aveugle" (primaire)
2. Scan étiquette (caché au dégustateur — l'app garde la photo sans l'afficher)
3. Écran "En sommeil" — invitation à commencer sans regarder l'étiquette
4. Wizard 4 étapes : Perception → Structure → Hypothèses → Style
5. Révélation — bouton "Révéler", photo étiquette dévoilée
6. Formulaire "La réalité" — producteur, cuvée, appellation, etc.
7. Comparaison — badges "Juste ✓ / Proche ~ / Raté" + insights
8. Journal

**Durée cible** : 5–10 minutes (dégustation complète).

**Ce que ce mode ne contient pas** : label visible avant la révélation.

---

### Évolution de l'écran Home

| Actuel | Cible |
|---|---|
| 1 CTA "Scanner une bouteille" | 2 CTAs distincts |
| Tagline "Avant de découvrir, devine." (Mode B only) | Tagline inclusive des deux modes |

**Structure Home cible :**
- CTA primaire : **"Dégustation à l'aveugle"** (icône œil ou camera)
- CTA secondaire : **"Mémoriser un vin"** (icône bookmark ou crayon)
- Lien tertiaire : "Mon journal"

Le CTA primaire reste l'aveugle (intention premium, différenciante). Le CTA secondaire est utilitaire, mais accessible sans friction.

---

### Distinction visuelle dans le Journal

- Les fiches **Mode Aveugle** portent un badge discret `À l'aveugle` (couleur neutre, fond `surfaceAlt`)
- Les fiches **Mode Mémoire** sont sans badge (cas plus simple, par défaut visuel)
- Le ❤️ coup de cœur et la note ★ s'affichent dans les deux cas
- La section "Mes hypothèses" et la "Comparaison" n'apparaissent que pour le Mode Aveugle

---

### Impact sur le Data Model

| Champ | Mode Mémoire | Mode Aveugle |
|---|---|---|
| `userInputs.mode` | `'memory'` | `'blind'` |
| `userInputs.perception` | vide | rempli |
| `userInputs.structure` | vide | rempli |
| `userInputs.hypotheses` | vide | rempli |
| `userInputs.style` | note + coup de cœur + accords + commentaire | idem |
| `reality` | rempli immédiatement (OCR + form) | rempli à la révélation |
| `comparison` | absent (null ou `{}`) | calculé |

---

### Nouvelles routes (Mode Mémoire)

| Route | Écran |
|---|---|
| `/memory/[scanId]` | Formulaire combiné : réalité + impression → sauvegarde directe |

Le paramètre de mode peut être passé via la route de scan ou stocké dans le `BottleScan`.

---

*Ce document fait autorité pour tous les choix visuels et stylistiques de MyWine.*
*Les tokens JS (`tokens.js`) sont la source de vérité — aucune valeur en dur dans les composants.*
