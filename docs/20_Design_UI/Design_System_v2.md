# Design System v2 — MyWine

> ⚠️ **Document écrit pour l'ancienne app native (React Native).** Les principes restent valables ; les mentions de scan/OCR, de `tokens.js`, de `StyleSheet` et des écrans `.jsx` de `mobile/` sont obsolètes. Implémentation actuelle : `web/src/` — voir [docs/README.md](../README.md).

> Tout ce document est exprimé en règles, pas en opinions.
> Aucune valeur ne peut être contournée dans un composant — tout passe par `tokens.js`.

---

## 1. Philosophie visuelle

### Mots-clés du système (ordre de priorité)

1. **Matière** — l'interface a une texture, pas une brillance
2. **Silence** — ce qui n'est pas là compte autant que ce qui est là
3. **Précision** — chaque élément a une fonction, pas un rôle décoratif
4. **Sédimentation** — le journal accumule, il ne performe pas

### Règle d'or (rappel)
> Si l'interface attire plus l'attention que le vin, c'est raté.

### Références sensorielles (abstraites)

| Sensation | Traduction visuelle |
|---|---|
| Papier de carnet de dégustation légèrement jauni | Fonds crème chauds, pas blanc pur |
| Encre sur papier — noir légèrement sépia | Texte `#1C1512`, pas `#000000` |
| Cave à vin — pénombre douce, surfaces rugueuses | Contrastes doux, pas de blanc éblouissant |
| Le poids d'un verre dans la main | Boutons avec masse visuelle, sans flottement |
| Temps long, patience | Espaces généreux, pas de compression |

### Ce que le système ne fait jamais

- Aucun dégradé (ni linéaire, ni radial)
- Aucune ombre décorative sur les CTAs
- Aucun `radius` > 14px sur un conteneur
- Aucune animation de transition (sauf navigation Stack native)
- Aucun emoji dans les textes d'interface
- L'uppercase est réservé aux badges courts (≤ 4 mots) et aux indicateurs numériques

---

## 2. Palette

### 2.1 Fonds & surfaces

```
bg:             #F8F5F0   ← papier crème, fond de toutes les vues
surface:        #FDFCF9   ← blanc chaud, fond des cards et sections
surfaceAlt:     #EDE8E0   ← sable chaud, fond des headers de section
surfaceSunken:  #F2EDE6   ← légèrement plus foncé que bg — pour les zones de saisie
```

**Règles d'usage :**
- `bg` : fond de l'écran entier. Jamais utilisé comme fond d'une card.
- `surface` : card, section, modal, footer fixe. Créé un léger soulèvement sur `bg`.
- `surfaceAlt` : headers de section (intérieur d'une card), zone d'info neutre, header de navigation.
- `surfaceSunken` : fond des inputs TextInput. Donne la sensation que le champ est "en creux" dans la surface.

### 2.2 Texte

```
text:            #1C1512   ← presque noir, légèrement sépia — encre sur papier
textSecondary:   #6E5E52   ← brun-gris chaud — annotations, sous-titres
textDisabled:    #B5A898   ← taupe pâle — placeholders, éléments inactifs
textOnPrimary:   #FDFCF9   ← blanc chaud — texte sur fond bordeaux
textOnDark:      #FDFCF9   ← identique à textOnPrimary (alias sémantique)
```

**Règle :** Ne jamais utiliser `#000000` ni `#FFFFFF` pur dans les composants.

### 2.3 Couleur d'accent (primaire)

```
primary:         #6B2D3E   ← bordeaux profond et mat
primaryMid:      #8F3E52   ← bordeaux moyen — états intermédiaires
primarySubtle:   #F5EAEC   ← rose poudré très pâle — fond chips actifs, tags
primaryBorder:   #D9B0B8   ← bordeaux pâle — bordures des éléments actifs
```

**Justification du choix `#6B2D3E` :**
- Référence au vin sans être littérale (ce n'est pas la couleur du vin dans un verre)
- Lue comme sérieuse et artisanale, pas comme tech
- Contraste suffisant sur `#F8F5F0` (ratio ≥ 4.5:1 pour AA)
- Fonctionne aussi bien en CTA plein qu'en icône sur fond clair

**Règles d'usage de `primary` :**
- CTA primaire (fond plein)
- Icône ou chip sélectionné (couleur du texte ou de l'icône)
- Barre de progression du wizard
- Slider (thumb + track gauche)
- **Jamais** comme couleur de fond d'un conteneur entier

### 2.4 Bordures

```
border:          #DDD5CB   ← sable moyen — bordures de cards, sections, inputs
borderStrong:    #C4B8AE   ← sable foncé — séparateurs forts, header navbar
borderLight:     #EDE8E0   ← sable clair (= surfaceAlt) — séparateurs très discrets
```

**Règle :** `borderWidth` maximum de `1` partout. Jamais `1.5` ni `2`. Les bordures signalent la structure, pas l'importance.

### 2.5 Feedback & résultats comparaison

```
match:           #2E6B4F   ← vert forêt profond
matchSubtle:     #E8F2EB   ← vert très pâle
close:           #8C5A1A   ← ocre brûlé
closeSubtle:     #F5EAD8   ← crème pêche
miss:            #6E5E52   ← identique à textSecondary (pas de couleur dédiée)
missSubtle:      #EDE8E0   ← identique à surfaceAlt

error:           #8B1A2A   ← rouge bordeaux profond (cohérent avec primary)
errorSubtle:     #F5E6E8   ← rose pâle
```

**Règle pour `miss` :** Une hypothèse non confirmée n'est pas pénalisée visuellement. Elle est rendue dans le registre "neutre-discret", identique au texte secondaire.

#### Vocabulaire des badges de comparaison

Deux systèmes selon le contexte, jamais mélangés dans le même écran :

**Option A — Réalité connue (cas standard)**
- `JUSTE` → `match` (vert forêt)
- `PROCHE` → `close` (ocre brûlé)
- `À REVOIR` → `miss` (neutre gris-brun)

**Option B — Réalité partiellement absente**
- `JUSTE` → `match`
- `PROCHE` → `close`
- `INCOMPLET` → `miss` (remplace "À REVOIR" quand la réalité du champ est manquante)

**Règles absolues :**
- Si la réalité du vin est totalement inconnue : aucun badge de comparaison
- `INCOMPLET` ne signifie pas "erreur" — il signifie "données insuffisantes pour comparer"
- Un badge négatif n'est affiché que si l'hypothèse existe ET que la réalité la contredit
- Jamais "RATÉ", "FAUX", "INCORRECT" dans l'interface

### 2.6 Types de vin — représentation

Les types de vin (rouge, blanc, rosé, effervescent, mutuel) sont représentés par :
- **Pastille couleur** : cercle de 10–12px, couleur définie ci-dessous
- **Label texte** : `fontSize.sm`, `textSecondary`, sentence case

```
Rouge :        #8B2C2C   ← bordeaux/brique (distinct de primary)
Blanc :        #C8A84B   ← doré paille
Rosé :         #D4748A   ← rose pâle-moyen
Effervescent : #8B9BAD   ← bleu-gris argenté
```

**Règles absolues :**
- Jamais d'emoji pour représenter un type de vin
- Jamais une couleur de type utilisée comme fond d'une zone > 48px
- La pastille est un indicateur, pas un identifiant unique — le label texte doit toujours l'accompagner
- Sur fond `surfaceAlt` ou `surface`, la pastille est posée sans bordure

### 2.6 Overlay

```
overlay:         rgba(28, 21, 18, 0.55)   ← noir chaud, pas noir pur
```

---

## 3. Typographie

### 3.1 Famille de fontes

**Règle générale :** Le système utilise deux registres typographiques.

| Registre | Usage | Famille |
|---|---|---|
| **Interface** | Labels, CTAs, navigation, badges | Police système sans-serif (par défaut) |
| **Contenu** | Nom du vin, valeurs saisies, impressions libres | À envisager Phase 6 : une serif (Lora ou équivalent via expo-font) |

**Au MVP (Phase 4–5) :** Police système uniquement. La distinction interface/contenu se fait par le poids et la taille, pas par la famille.

**Règle Phase 6 optionnelle :** Si expo-font est ajouté, la serif s'applique uniquement aux éléments "data" (titre d'une fiche, valeur de cuvée affichée, impression libre). Les labels UI restent en sans-serif.

### 3.2 Échelle de taille (inchangée, usage redéfini)

```
xs:   11px  → caption : dates, badges courts, indicateurs numériques
sm:   13px  → label : labels de champs, métadonnées de card, annotations
base: 15px  → body : valeurs saisies, descriptions, texte de lecture
lg:   17px  → title : titres de screens, titres de cards dans le journal
xl:   20px  → display-sm : nom de l'étape dans le wizard, titres de modals
2xl:  24px  → display : titres des écrans hero (Sleep, Reveal)
3xl:  30px  → display-lg : nom de l'application (Home uniquement)
```

### 3.3 Poids et usage

```
regular:  400  → valeurs saisies (ce que l'utilisateur écrit), textes de lecture
medium:   500  → labels de champs, sous-titres, annotations actives
semibold: 600  → titres de section, titres de screen, labels CTA
bold:     700  → display uniquement (home appName, hero title Sleep/Reveal)
```

**Règle :** `bold` est réservé aux titres de taille `2xl` et `3xl`. Au-delà, `semibold` suffit.

### 3.4 Règles de casse (reformulation complète)

**UPPERCASE est interdit sauf dans ces 4 cas précis :**
1. Badges comparaison (ex : "JUSTE", "PROCHE", "RATÉ") — ≤ 4 mots, `xs`
2. Indicateur de progression wizard ("2 / 4") — `xs`
3. Labels de colonnes dans la table de comparaison — `xs`, `letterSpacing: 0.4`
4. Mode indication en header de screen (ex : "DÉGUSTATION À L'AVEUGLE") — `xs`

**Tous les autres textes :** sentence case. Cela inclut les labels de champs, les titres de section, les headers de navigation.

### 3.5 Italique

Réservé à deux usages :
- Tagline de l'app sur Home
- Sous-titre de l'étape du wizard ("Ce que tu ressens en bouche")

Ne jamais utiliser l'italique pour indiquer une valeur manquante ou optionnelle.

### 3.6 `letterSpacing`

- `0` par défaut
- `0.3–0.5` uniquement pour les textes uppercase (badges, indicateurs)
- Jamais utilisé sur les textes de corps ou les labels

### 3.7 `lineHeight`

```
Corps / descriptions : 22–24px (selon fontSize.base = 15px)
Labels : pas de lineHeight explicite (valeur native)
Textes multi-lignes longs : 22px
```

---

## 4. Espacements & rythme vertical

### 4.1 Grille de référence

Rappel de l'échelle actuelle (conservée) :
```
1: 4px    2: 8px    3: 12px   4: 16px   5: 20px
6: 24px   8: 32px   10: 40px  12: 48px  16: 64px
```

### 4.2 Règles d'espacement par contexte

**Entre deux cards / sections dans un scroll :**
→ `spacing[4]` (16px)

**Padding interne d'une card (haut, bas, gauche, droite) :**
→ `spacing[4]` (16px) — jamais en-dessous de `spacing[3]`

**Entre deux champs dans un formulaire :**
→ `spacing[5]` (20px) — les champs sont des entités distinctes, pas des lignes de tableau

**Entre un label et son input :**
→ `spacing[2]` (8px)

**Entre deux chips dans un ChipGroup :**
→ `spacing[2]` (8px)

**Padding horizontal des écrans principaux :**
→ `spacing[5]` (20px) — légèrement plus généreux que les 16px actuels

**Padding horizontal des écrans rituels (Sleep, Reveal choice) :**
→ `spacing[8]` (32px) — les écrans de rituel respirent plus

**Entre l'icône hero et le titre (Sleep, Reveal) :**
→ `spacing[8]` (32px) minimum

**Hauteur des inputs :**
→ 48px (au lieu de 44px) — plus facile à cibler sur mobile

**Hauteur des CTAs principaux :**
→ 56px (paddingVertical `spacing[4]` + fontSize.lg) — masse visuelle physique

### 4.3 Densité cible par type d'écran

| Écran | Densité | Justification |
|---|---|---|
| Home | Faible | Seul écran de "départ" — air |
| Sleep | Très faible | Moment de préparation mentale |
| Tasting wizard | Moyenne | Formulaire actif mais contemplatif |
| Reveal (choice) | Faible | Moment de vérité — espace |
| Reveal (form) | Moyenne | Saisie utilitaire |
| Comparison | Moyenne-haute | Lecture d'information structurée |
| Entry | Moyenne | Consultation — pas d'action |
| Journal | Moyenne | Liste navigable |
| Memory/new | Moyenne | Saisie rapide |

---

## 5. Rayons, ombres, élévation

### 5.1 Rayons

```
sm:   4px    → badges inline, chips, tags, très petits éléments
md:   6px    → inputs TextInput, champs de saisie
lg:   10px   → cards, sections (conteneurs de contenu)
xl:   14px   → modals, bottom sheets
full: 999    → pills (badges de comparaison), séparateurs ronds
```

**Changements par rapport à v1 :**
- `sm` : 6 → 4 (badges moins mous)
- `md` : 8 → 6 (inputs moins rebondis)
- `lg` : 12 → 10 (cards légèrement plus angulaires)
- `xl` : 16 → 14 (modals plus sérieuses)

**Règle :** Les CTAs primaires et secondaires utilisent `radius.lg` (10px), pas `radius.xl`. Un bouton de 56px de haut avec radius 14px crée un effet "pilule mobile" générique.

### 5.2 Ombres

```js
shadow.sm: {
  shadowColor: '#1C1512',     // ← noir chaud (sépia)
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 1,
}
shadow.md: {
  shadowColor: '#1C1512',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.09,
  shadowRadius: 8,
  elevation: 3,
}
shadow.lg: {
  shadowColor: '#1C1512',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.13,
  shadowRadius: 16,
  elevation: 6,
}
```

**Règles d'usage des ombres :**

| Usage | Ombre |
|---|---|
| Cards dans un scroll (journal, entry, comparison) | `shadow.sm` |
| Modal / bottom sheet | `shadow.lg` |
| Dropdown autocomplete (TagInput) | `shadow.md` |
| CTAs primaires | **Aucune ombre** |
| Sections dans une card | **Aucune ombre** |
| Footer fixe | Bordure seule (`borderTopWidth: 1`) |

**Règle fondamentale :** Une ombre sur un CTA dit "je flotte au-dessus de l'interface". Le bouton doit avoir du poids, pas de la flottaison. La couleur et la masse visuelle suffisent.

---

## 6. États interactifs

### 6.1 Press / activeOpacity

```
CTA primaire :     activeOpacity: 0.82
CTA secondaire :   activeOpacity: 0.75
Lien tertaire :    activeOpacity: 0.60
Chip / tag :       activeOpacity: 0.70
Card (journal) :   activeOpacity: 0.85  ← moins de compression, plus physique
```

**Règle :** `activeOpacity` plus bas = feedback plus physique. On ne "survole" pas une carte en papier, on l'appuie.

### 6.2 Disabled

```
opacity: 0.40
```

**Règle :** 0.40 (et non 0.60) rend l'état disabled clairement inactif. 0.60 est trop ambigu sur des fonds clairs.

### 6.3 Input focus

Pas de `ring` de focus possible en RN sans librairie. Règle : le focus est signalé uniquement par `borderColor: primary` (bordeaux profond). Pas de shadow de focus, pas de `backgroundColor` change.

```js
// État normal
{ borderColor: tokens.colors.border }

// État focus (géré via onFocus/onBlur)
{ borderColor: tokens.colors.primary }
```

### 6.4 Chip / tag — état sélectionné vs non sélectionné

```js
// Non sélectionné
{
  borderColor: tokens.colors.border,          // sable moyen
  backgroundColor: tokens.colors.surface,     // blanc chaud
}
// label : textSecondary

// Sélectionné
{
  borderColor: tokens.colors.primaryBorder,   // bordeaux pâle
  backgroundColor: tokens.colors.primarySubtle, // rose poudré
}
// label : primary (bordeaux)
```

**Changement v1 → v2 :** `borderWidth` passe de `1.5` à `1`. L'état actif se lit par la couleur, pas l'épaisseur.

### 6.5 Animations

**Principe général : aucune animation décorative ou "satisfaisante".**
Une animation n'est autorisée que si elle communique un changement d'état utilitaire que l'utilisateur doit percevoir.

#### Cas autorisés — transitions d'état utilitaires

| Interaction | Animation | Durée | Easing |
|---|---|---|---|
| Ouverture d'un hint (icône `?`) | `LayoutAnimation.easeInEaseOut` | 150ms | ease-in-out |
| Fermeture d'un hint | idem | 120ms | ease-in-out |
| Ouverture section "Avancé" | `LayoutAnimation.easeInEaseOut` | 180ms | ease-in-out |
| Fermeture section "Avancé" | idem | 150ms | ease-in-out |

**Implémentation RN :**
```js
import { LayoutAnimation, Platform, UIManager } from 'react-native'

// Android nécessite l'activation explicite
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

// Avant le setState qui modifie la hauteur
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
```

#### Cas interdits (liste exhaustive)

- Spring / bounce sur tout élément
- Scale au press des CTAs ou chips
- Fade-in au montage d'un écran ou d'un composant
- Animations de "célébration" (résultat de comparaison, sauvegarde)
- Transitions entre étapes du wizard (le Stack navigator gère la navigation, pas les steps)
- Tout `Animated.timing` > 200ms
- Séquences d'animations enchaînées

#### Règle pour les transitions de navigation

Les transitions de navigation (Stack) restent en `animation: 'slide_from_right'` natif.
Aucune modification de ces animations n'est autorisée dans les composants.

---

## 7. Règles de composition

### 7.1 Le header de navigation — pattern unique

Un seul pattern de header acceptable pour tous les écrans non-héros :

```
[ Retour ]   [ Titre screen centré ]   [ Action ou spacer ]
  36×36                                     36×36
```

- **Retour** : ArrowLeft dans un carré 36×36 `surfaceAlt`, `radius.md`
- **Titre** : `fontSize.lg`, `fontWeight.semibold`, centré, `flex: 1`
- **Action droite** : icône de même taille (si nécessaire) ou `View { width: 36 }` (spacer)
- **Fond** : `surface`, `borderBottomWidth: 1`, `borderBottomColor: border`

Exceptions documentées :
- Home : pas de header (écran d'entrée, pas de navigation parent)
- Sleep : pas de header (écran de seuil, volontairement ouvert)
- Reveal (choice) : pas de header (moment de vérité, volontairement immersif)

### 7.2 Le footer d'action — pattern unique

```
[ Secondaire / Retour ]   [ CTA Principal ]
  44px de hauteur              flex: 1, 56px
```

- Fond `surface`
- `borderTopWidth: 1`, `borderTopColor: border`
- Padding `spacing[4]` sur les côtés
- CTA principal : `radius.lg`, `backgroundColor: primary`, `activeOpacity: 0.82`
- Retour : `borderWidth: 1`, `borderColor: border`, `radius.lg`, texte `textSecondary`

### 7.3 Les sections dans une card

```
[ En-tête de section ]   ← surfaceAlt, border bottom, sentence case, semibold, sm
[ Corps de section   ]   ← surface, padding spacing[4]
```

Les emojis sont interdits dans les en-têtes de section.

### 7.4 Inputs de saisie

```js
{
  height: 48,
  borderWidth: 1,
  borderColor: tokens.colors.border,
  borderRadius: tokens.radius.md,         // 6px
  paddingHorizontal: tokens.spacing[3],   // 12px
  fontSize: tokens.fontSize.base,         // 15px
  color: tokens.colors.text,
  backgroundColor: tokens.colors.surfaceSunken,  // en creux
}
```

### 7.5 Badges de comparaison

```js
// Structure commune
{
  paddingHorizontal: tokens.spacing[2],
  paddingVertical: 3,
  borderRadius: tokens.radius.full,
}

// Texte : xs (11px), uppercase, medium, letterSpacing: 0.4
```

---

## 8. Référence rapide — tokens.js v2 (valeurs à implémenter)

```js
// Colors
bg:              '#F8F5F0'
surface:         '#FDFCF9'
surfaceAlt:      '#EDE8E0'
surfaceSunken:   '#F2EDE6'
border:          '#DDD5CB'
borderStrong:    '#C4B8AE'
text:            '#1C1512'
textSecondary:   '#6E5E52'
textDisabled:    '#B5A898'
textOnPrimary:   '#FDFCF9'
primary:         '#6B2D3E'
primaryMid:      '#8F3E52'
primarySubtle:   '#F5EAEC'
primaryBorder:   '#D9B0B8'
error:           '#8B1A2A'
errorSubtle:     '#F5E6E8'
success:         '#2E6B4F'
successSubtle:   '#E8F2EB'
match:           '#2E6B4F'
matchSubtle:     '#E8F2EB'
close:           '#8C5A1A'
closeSubtle:     '#F5EAD8'
miss:            '#6E5E52'         // = textSecondary
overlay:         'rgba(28, 21, 18, 0.55)'

// Radius
sm:   4
md:   6
lg:   10
xl:   14
full: 999

// Shadows → shadowColor devient '#1C1512' partout

// Spacing → inchangé
```

---

---

## 8. Iconographie

### 8.1 Tailles standard

| Taille | Usage |
|---|---|
| **16px** | Icône inline dans un texte ou un badge, chevron de navigation, indicateur dans un chip |
| **20px** | Icône dans un header de navigation, icône accompagnant un label dans un input ou CTA secondaire |
| **24px** | Icône dans un CTA primaire, icône standalone dans un header d'écran de rituel |

Les tailles 28px, 32px, 48px sont **interdites** en dehors des contextes hero (Sleep, Reveal) où elles signalent un moment de seuil. Ces contextes sont documentés explicitement dans [Component_Kit.md](Component_Kit.md).

### 8.2 Stroke width

La librairie Lucide utilise un stroke de `2` par défaut.
Règle : ne jamais modifier le `strokeWidth`. L'uniformité est une propriété systémique.

### 8.3 Couleur par défaut

```
Icône de navigation / label secondaire :  textSecondary (#6E5E52)
Icône dans un CTA primaire :              textOnPrimary (#FDFCF9)
Icône d'action active / confirmée :       primary (#6B2D3E)
Icône d'état d'erreur :                   error (#8B1A2A)
```

**Règle :** `primary` est utilisé pour une icône **uniquement si** elle représente une action déjà engagée (hint actif, chip sélectionné, favori coché). Une icône de navigation au repos est toujours `textSecondary`.

### 8.4 Icônes interdites

- Icônes **illustratives** (remplaçant une image ou une illustration)
- Icônes **décoratives** (présentes uniquement pour l'esthétique)
- Icônes dans les titres de section ou les headers de card (règle anti-emoji étendue aux icônes)
- Icônes **animées** (rotation, pulse, clignotement)

---

## 9. Contraste & accessibilité

### 9.1 Paires à risque

Ratios estimés pour la palette v2 (WCAG 2.1 — AA normal text : 4.5:1 ; large text 18px+ bold : 3:1).

| Paire texte / fond | Ratio estimé | Risque | Usage concerné |
|---|---|---|---|
| `text` (#1C1512) / `bg` (#F8F5F0) | ~16:1 | Aucun | Corps, titres |
| `text` (#1C1512) / `surface` (#FDFCF9) | ~17:1 | Aucun | Cards, modals |
| `textSecondary` (#6E5E52) / `bg` (#F8F5F0) | ~5.2:1 | **Faible** | Labels sm, sous-titres |
| `textSecondary` (#6E5E52) / `surface` (#FDFCF9) | ~5.4:1 | **Faible** | InfoRow, annotations |
| `textSecondary` (#6E5E52) / `surfaceAlt` (#EDE8E0) | ~4.6:1 | **Moyen** (xs) | Labels uppercase xs |
| `textDisabled` (#B5A898) / `bg` (#F8F5F0) | ~2.4:1 | **Élevé** | Placeholders |
| `primary` (#6B2D3E) / `primarySubtle` (#F5EAEC) | ~6.8:1 | **Faible** | Chips actifs |
| `close` (#8C5A1A) / `closeSubtle` (#F5EAD8) | ~4.1:1 | **Moyen** (xs) | Badge PROCHE |
| `match` (#2E6B4F) / `matchSubtle` (#E8F2EB) | ~5.1:1 | **Faible** | Badge JUSTE |
| `miss` (#6E5E52) / `missSubtle` (#EDE8E0) | ~4.6:1 | **Moyen** (xs) | Badge À REVOIR |

### 9.2 Corrections

**Cas `textDisabled` sur fonds clairs (risque élevé)**
Problème : utilisé pour les placeholders des TextInput. À 2.4:1, un placeholder est illisible pour des utilisateurs avec déficit visuel.

- **Option A :** Utiliser `#8C7B6E` (taupe foncé) pour les placeholders — ratio ~4.2:1. Trade-off : perd l'effet "discret", peut être confondu avec une valeur saisie.
- **Option B (retenue) :** Garder `textDisabled` pour les états réellement désactivés, et définir `textPlaceholder: '#9A8A7E'` (~3.2:1) pour les placeholders. Différence sémantique claire. Trade-off : un token de plus.

**Cas badges xs sur fonds colorés (risque moyen)**
Problème : `close` (#8C5A1A) sur `closeSubtle` (#F5EAD8) à 11px uppercase = ~4.1:1 (sous le seuil AA normal text).

- **Option A :** Assombrir `close` → `#7A4E17` → ratio ~5.0:1. Trade-off : la teinte ocre devient plus sombre, moins "chaud".
- **Option B (retenue) :** Utiliser `fontWeight.semibold` sur tous les textes de badge. Le poids renforce la lisibilité perçue sans modifier la couleur. Trade-off : solution perceptuelle, pas mathématique.

### 9.3 Ajout au token `textPlaceholder`

```
textPlaceholder: '#9A8A7E'   ← taupe neutre — placeholders uniquement
```
`textDisabled` (#B5A898) reste pour les états disabled (label, icône, bouton inactif).

### 9.4 Règles React Native — accessibilité

**1. Zones pressables ≥ 44×44px**
Toute zone `TouchableOpacity` doit avoir une surface minimale de 44×44px.
Si l'élément visuel est plus petit (icône 16px, badge), utiliser `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`.

```js
// Correct
<TouchableOpacity hitSlop={12} onPress={...}>
  <ArrowLeft size={20} />
</TouchableOpacity>

// Interdit
<TouchableOpacity style={{ width: 20, height: 20 }} onPress={...}>
  <ArrowLeft size={20} />
</TouchableOpacity>
```

**2. Icônes cliquables — accessibilityLabel obligatoire**
Toute icône interactive doit avoir `accessibilityLabel` et `accessibilityRole`.

```js
<TouchableOpacity
  accessibilityLabel="Retour"
  accessibilityRole="button"
  onPress={goBack}
>
  <ArrowLeft size={20} />
</TouchableOpacity>
```

**3. Ne jamais transmettre une information uniquement par la couleur**
Les badges de comparaison (JUSTE / PROCHE / À REVOIR) communiquent par texte **ET** couleur.
Si un badge n'a pas de label lisible, il est invalide. La couleur seule ne suffit pas.

**4. Focus input = borderColor primary**
```js
// Géré via onFocus / onBlur sur chaque TextInput
const [focused, setFocused] = useState(false)

<TextInput
  style={[styles.input, focused && styles.inputFocused]}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>

// styles
input:        { borderColor: tokens.colors.border }
inputFocused: { borderColor: tokens.colors.primary }
```

---

## 10. Dark mode — principes

> Valeurs exactes hors scope Phase 4–5. Cette section définit les contraintes de conception pour la Phase 6.

### 10.1 Intention

Le dark mode de MyWine n'est pas une "inversion" du light mode.
Il évoque la **pénombre d'une cave** : surfaces sombres et chaudes, texte clair mais jamais blanc pur, contrastes lisibles mais jamais crus.

### 10.2 Règles de composition

**Ce que le dark mode ne fait pas :**
- Inverser `#F8F5F0` → `#070A05` (inversion froide)
- Utiliser du blanc `#FFFFFF` comme couleur de texte principale
- Reproduire un fond noir pur

**Ce que le dark mode fait :**
- Les fonds deviennent des bruns très sombres et chauds (~`#1A1410`, `#221C18`)
- Les surfaces sont légèrement plus claires que le fond (~`#2A211B`)
- Le texte principal est un blanc cassé chaud (~`#F0EBE3`)
- Le texte secondaire reste dans les mêmes teintes brun-gris, mais plus claires
- L'accent `primary` (bordeaux) est légèrement éclairci pour rester lisible sur fond sombre
- Les bordures sont quasi invisibles (très proches de la surface)

### 10.3 Contrainte d'implémentation

Le dark mode sera implémenté via un doublement des tokens (`colorsDark`) et le hook `useColorScheme()` de React Native.
Aucune valeur de couleur ne sera hardcodée dans les composants — le switch light/dark doit être possible par un seul changement de référence token.

---

## 11. États UI

### 11.1 Empty state

**Règle de composition :**
- Texte court : 1 titre (max 8 mots) + 1 corps explicatif (max 20 mots)
- CTA discret : secondaire ou tertiaire, jamais CTA primaire plein couleur
- Jamais d'illustration, d'image décorative ou d'emoji standalone
- L'état vide n'est pas un échec — ne pas dramatiser

**Exemples de copy :**
```
Journal vide :
  Titre : "Aucune dégustation pour l'instant"
  Corps : "Lance ta première dégustation ou mémorise un vin depuis l'accueil."
  CTA   : "Retour à l'accueil" (tertiaire)

Recherche sans résultat :
  Titre : "Aucun résultat pour «{query}»"
  (pas de CTA — l'utilisateur sait quoi faire)
```

### 11.2 Loading state

Uniquement pertinent pour l'OCR Phase 5. Règle de composition :
- Indicateur natif (`ActivityIndicator`) sobrement dimensionné
- Message textuel court, présent tense
- Jamais de barre de progression indéterminée avec animation décorative

**Exemple de copy :**
```
Analyse de l'étiquette en cours…
```

### 11.3 Error state

**Règle de composition :**
- Message clair et non dramatique : expliquer ce qui s'est passé, proposer une action
- Couleur `error` uniquement pour le texte ou l'icône, jamais comme fond de surface
- Pas de symbole d'alerte rouge clignotant

**Exemple de copy :**
```
Erreur de sauvegarde :
  "Impossible de sauvegarder. Vérifie l'espace disponible sur l'appareil."
  CTA : "Réessayer" (secondaire)

Fiche introuvable :
  "Cette fiche n'existe plus."
  CTA : "Retour au journal" (tertiaire)
```

---

## 12. Référence aux documents liés

- **[UI_Audit.md](UI_Audit.md)** — diagnostic visuel initial, problèmes priorisés
- **[Component_Kit.md](Component_Kit.md)** — spécifications par composant, directement actionnables
- **`tokens.js`** — source de vérité unique pour toutes les valeurs

---

*Amendements appliqués : contraste & accessibilité, iconographie, animations (nuancées), badges (vocabulaire), types de vin, dark mode, états UI.*
*Version : Design System v2.1*
