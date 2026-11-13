# Component Kit — MyWine

> ⚠️ **Document écrit pour l'ancienne app native (React Native).** Les principes restent valables ; les mentions de scan/OCR, de `tokens.js`, de `StyleSheet` et des écrans `.jsx` de `mobile/` sont obsolètes. Implémentation actuelle : `web/src/` — voir [docs/README.md](../README.md).

> Spécifications de composants directement actionnables.
> Chaque composant est décrit par : objectif, composition, tokens, états, Do / Don't.
> Ce document ne contient pas de code. Il est la référence de conception avant implémentation.

Référence : [Design_System_v2.md](Design_System_v2.md) · [UI_Audit.md](UI_Audit.md)

---

## 1. ScreenHeader

### Objectif
Signaler la position de l'utilisateur dans l'app et fournir la navigation retour. Présent sur tous les écrans non-héros.

### Composition

```
[ BtnRetour 36×36 ]   [ Titre centré flex:1 ]   [ ActionDroite 36×36 ou Spacer ]
```

- Fond : `surface`
- Séparateur bas : `borderBottomWidth: 1`, `borderBottomColor: border`
- Hauteur totale : 52px (padding vertical `spacing[2]` de chaque côté)
- Padding horizontal : `spacing[4]`

**BtnRetour :**
- `ArrowLeft` 20px, couleur `text`
- Fond `surfaceAlt`, `radius.md` (6px)
- `accessibilityLabel: "Retour"`, `accessibilityRole: "button"`
- `hitSlop: 12`

**Titre :**
- `fontSize.lg` (17px), `fontWeight.semibold`, `colors.text`
- `textAlign: 'center'`, `flex: 1`
- `numberOfLines: 1` (tronqué si trop long)

**ActionDroite :**
- Si présente : icône 20px, `colors.textSecondary`, même gabarit 36×36 que BtnRetour
- Si absente : `View { width: 36 }` (spacer pour centrer le titre)

### Tokens
`colors.surface` · `colors.border` · `colors.surfaceAlt` · `colors.text` · `colors.textSecondary` · `fontSize.lg` · `fontWeight.semibold` · `spacing[4]` · `spacing[2]` · `radius.md`

### États
- **Standard** : BtnRetour + Titre + Spacer
- **Avec action** : BtnRetour + Titre + BtnAction (ex : Trash2 dans Entry)
- **Sans retour** : Spacer + Titre + Spacer (journal uniquement)

### Do / Don't
| Do | Don't |
|---|---|
| Titre en sentence case | Titre en UPPERCASE |
| Icône unique à droite si nécessaire | Deux icônes à droite |
| Spacer si pas d'action droite | Titre décalé si pas de spacer |
| `accessibilityLabel` sur le bouton retour | Icône retour sans label d'accessibilité |

---

## 2. FooterAction

### Objectif
Ancrer les actions principales en bas d'écran. Toujours visible, jamais scrollable.

### Composition

```
[ BtnSecondaire ou BtnRetour ]   [ BtnPrimaire flex:1 ]
```

- Fond : `surface`
- Séparateur haut : `borderTopWidth: 1`, `borderTopColor: border`
- Padding : `spacing[4]` sur les côtés, `spacing[3]` bas + `insets.bottom`
- Gap entre boutons : `spacing[3]`

**Variante mono-bouton (Memory, Reveal sauvegarder) :**
```
[ BtnPrimaire flex:1 ]
```

**Variante avec Retour (Tasting, Reveal manual) :**
```
[ BtnRetour w:auto ]   [ BtnPrimaire flex:1 ]
```

### Tokens
`colors.surface` · `colors.border` · `spacing[4]` · `spacing[3]`

### États
- **Standard** : un ou deux boutons actifs
- **Saving** : BtnPrimaire en état `disabled` + texte "Sauvegarde…"

### Do / Don't
| Do | Don't |
|---|---|
| BtnPrimaire toujours à droite | BtnPrimaire à gauche |
| BtnRetour discret (bordure seule) | Deux boutons primaires |
| Texte d'action précis ("Sauvegarder au journal") | Texte générique ("OK", "Valider") |

---

## 3. ButtonPrimary

### Objectif
Action principale unique par écran / footer. Masse visuelle forte.

### Composition
```
[ Icône 20px optionnelle ]   [ Label semibold ]
```

- Fond : `colors.primary` (#6B2D3E)
- Texte : `colors.textOnPrimary`, `fontSize.base` (15px), `fontWeight.semibold`
- Hauteur : 56px (`paddingVertical: spacing[4]` + hauteur ligne texte)
- `radius.lg` (10px)
- **Aucune ombre**
- `activeOpacity: 0.82`
- `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'center'`, `gap: spacing[2]`

### Tokens
`colors.primary` · `colors.textOnPrimary` · `fontSize.base` · `fontWeight.semibold` · `spacing[4]` · `radius.lg`

### États
| État | Rendu |
|---|---|
| Default | Fond `primary`, texte `textOnPrimary` |
| Pressed | `activeOpacity: 0.82` (assombrissement natif) |
| Disabled | `opacity: 0.40` |
| Loading | Label "Sauvegarde…" + `disabled: true` |

### Do / Don't
| Do | Don't |
|---|---|
| Un seul par écran / footer | Deux ButtonPrimary sur le même écran |
| Label court et précis (≤ 5 mots) | Shadow / elevation |
| Icône uniquement si elle ajoute du sens | Icône purement décorative |
| `radius.lg` (10px) | `radius.full` (pilule) |

---

## 4. ButtonSecondary

### Objectif
Action alternative ou complémentaire, moins prioritaire que ButtonPrimary.

### Composition
- Fond : `colors.primarySubtle` (#F5EAEC)
- Bordure : `borderWidth: 1`, `colors.primaryBorder`
- Texte : `colors.primary`, `fontSize.base`, `fontWeight.medium`
- Hauteur : 48px (`paddingVertical: spacing[3]`)
- `radius.lg` (10px)
- `activeOpacity: 0.75`

### Do / Don't
| Do | Don't |
|---|---|
| Utilisé en complément d'un ButtonPrimary | Seul bouton sur l'écran (utiliser Primary) |
| Même `radius` que Primary | `borderWidth: 1.5` ou plus |
| | Shadow ou elevation |

---

## 5. ButtonTertiary (lien textuel)

### Objectif
Action secondaire de navigation, sans importance structurelle (ex : "Retour au journal", lien vers autre mode).

### Composition
- Pas de fond, pas de bordure
- Texte : `colors.textSecondary`, `fontSize.sm` (13px), `fontWeight.medium`
- Padding vertical : `spacing[3]` pour surface pressable suffisante
- `activeOpacity: 0.60`

### Do / Don't
| Do | Don't |
|---|---|
| Sentence case | UPPERCASE |
| Centré si seul en bas d'écran | Underline (non supporté natif proprement) |
| `hitSlop: 12` si le texte est court | Texte tronqué (doit être lisible en entier) |

---

## 6. Chip (ChipGroup)

### Objectif
Sélection d'option(s) dans un ensemble fini. Single-select ou multi-select.

### Composition
```
[ Label sm ]
```
- Fond non sélectionné : `colors.surface`
- Fond sélectionné : `colors.primarySubtle`
- Bordure : `borderWidth: 1`, `colors.border` (inactif) / `colors.primaryBorder` (actif)
- Texte inactif : `colors.textSecondary`, `fontSize.sm`, `fontWeight.medium`
- Texte actif : `colors.primary`, `fontSize.sm`, `fontWeight.medium`
- Padding : `spacing[3]` horizontal, `spacing[2]` vertical
- `radius.full` (999) — conservé pour les chips (petits éléments)
- `activeOpacity: 0.70`

### Tokens
`colors.surface` · `colors.primarySubtle` · `colors.border` · `colors.primaryBorder` · `colors.textSecondary` · `colors.primary` · `fontSize.sm` · `fontWeight.medium` · `spacing[3]` · `spacing[2]` · `radius.full`

### États
| État | Fond | Bordure | Texte |
|---|---|---|---|
| Inactif | `surface` | `border` | `textSecondary` |
| Actif | `primarySubtle` | `primaryBorder` | `primary` |
| Pressed | `activeOpacity: 0.70` | — | — |

### Do / Don't
| Do | Don't |
|---|---|
| Label court (1–3 mots max) | Label de plus de 4 mots |
| `borderWidth: 1` | `borderWidth: 1.5` |
| `radius.full` | `radius.md` (les chips ont toujours radius full) |
| Wrap automatique (multi-lignes) | Scroll horizontal si > 6 chips |

---

## 7. Tag (TagInput)

### Objectif
Valeur saisie par l'utilisateur, rappelable et supprimable (cépages, accords).

### Composition
```
[ Label sm ]   [ × 13px ]
```
- Fond : `colors.primarySubtle`
- Bordure : `borderWidth: 1`, `colors.primaryBorder`
- Texte : `colors.primary`, `fontSize.sm`, `fontWeight.medium`
- Icône `×` : 13px, `colors.primary`
- Padding : `spacing[3]` horizontal, `spacing[1]+2` vertical
- `radius.full`

### Do / Don't
| Do | Don't |
|---|---|
| `hitSlop: 8` sur le bouton `×` | Icône `×` sans `hitSlop` |
| `accessibilityLabel: "Supprimer ${tag}"` sur le `×` | Icône `×` sans label d'accessibilité |
| Tag identique au chip actif visuellement | Style différent du chip actif |

---

## 8. Slider

### Objectif
Saisie d'une valeur numérique sur une échelle 1–5 (intensité aromatique, confiance).

### Composition
- Composant : `@react-native-community/slider`
- `minimumTrackTintColor: colors.primary`
- `maximumTrackTintColor: colors.border`
- `thumbTintColor: colors.primary`
- Labels extrémités : `fontSize.xs` (11px), `colors.textDisabled`, `flexDirection: 'row'`, `justifyContent: 'space-between'`

### Règles
- Toujours afficher la valeur courante dans le label du champ parent (ex : "Intensité aromatique — 3/5")
- Les labels d'extrémité sont obligatoires (ex : "Discret" / "Explosif")
- Hauteur de zone tactile : native (suffisante par défaut sur iOS/Android)

### Do / Don't
| Do | Don't |
|---|---|
| Valeur affichée dans le label du Field | Valeur uniquement via la position du thumb |
| Labels textuels aux extrémités | Icônes seules aux extrémités |

---

## 9. Card (Journal)

### Objectif
Représenter une entrée de journal dans une liste scrollable.

### Composition
```
[ Thumb 80px ]   [ Titre lg — 1 ligne  ]   [ ❤ optionnel ]
                 [ Sous-titre sm — 1 ligne ]
                 [ Date xs ]   [ Badge mode + Rating xs ]
```

- Fond : `colors.surface`
- Bordure : `borderWidth: 1`, `colors.border`
- `radius.lg` (10px)
- `shadow.sm`
- `flexDirection: 'row'`
- `activeOpacity: 0.85`

**Thumb (80px) :**
- Fond vide : `colors.surfaceAlt`
- Image : `StyleSheet.absoluteFillObject`, `resizeMode: 'cover'`
- Placeholder vide : `🍾` 28px centré (seul emoji toléré dans l'UI — indicateur de contenu, pas de décoration)
- `alignSelf: 'stretch'`, `overflow: 'hidden'`

**Contenu :**
- `flex: 1`, `padding: spacing[3]`, `justifyContent: 'space-between'`
- Titre : `fontSize.base`, `fontWeight.semibold`, `colors.text`
- Sous-titre : `fontSize.sm`, `colors.textSecondary`
- Date : `fontSize.xs`, `colors.textDisabled`

**Badge mode "À l'aveugle" :**
- Fond `surfaceAlt`, bordure `border`, `radius.full`
- Texte `fontSize.xs`, `colors.textSecondary`, `fontWeight.medium`

### Do / Don't
| Do | Don't |
|---|---|
| `numberOfLines: 1` sur titre et sous-titre | Titre sur 2 lignes |
| `shadow.sm` sur la card | Shadow sur le thumb |
| Hauteur déterminée par le contenu | Hauteur fixe hardcodée |
| `nestedScrollEnabled` sur le FlatList parent | `height: '100%'` sur les enfants du thumb |

---

## 10. Card (Comparaison — CompRow)

### Objectif
Afficher côte à côte hypothèse et réalité pour un champ de comparaison.

### Composition
```
[ Label xs uppercase letterSpacing ]
[ Hypothèse sm · flex:1 ]   [ Badge ]   [ Réalité sm · flex:1 · right ]
```

- Fond conteneur : `colors.surface`, `radius.lg`, `borderWidth: 1`, `border`
- Padding ligne : `spacing[3]` horizontal, `spacing[3]` vertical
- Séparateur de ligne : `borderBottomWidth: 1`, `borderBottomColor: border`
- Colonne badge : `width: 76`, `alignItems: 'center'`

**Label de champ :**
- `fontSize.xs`, `colors.textSecondary`, `fontWeight.medium`
- UPPERCASE, `letterSpacing: 0.3` — exception documentée (indicateur de catégorie)

**Valeur hypothèse / réalité :**
- `fontSize.sm`, `colors.text`, `fontWeight.medium`
- Valeur absente : `—`, `colors.textDisabled`, `fontWeight.regular`

### Do / Don't
| Do | Don't |
|---|---|
| `—` pour valeur manquante | Cellule vide |
| Badge uniquement si hypothèse ET réalité existent | Badge sur une hypothèse sans réalité |
| Header de colonnes ("Mes hypothèses / La réalité") si réalité présente | Header si réalité absente |

---

## 11. Input (TextInput)

### Objectif
Saisie de texte simple (une ligne) ou multiligne dans les formulaires.

### Composition (une ligne)
- Hauteur : 48px
- Fond : `colors.surfaceSunken`
- Bordure : `borderWidth: 1`, `borderColor: colors.border`
- Bordure focus : `borderColor: colors.primary` (via `onFocus` / `onBlur`)
- `radius.md` (6px)
- Padding horizontal : `spacing[3]`
- `fontSize.base`, `colors.text`
- Placeholder : `colors.textPlaceholder`

### Composition (multiligne)
- `minHeight: 80px`, `paddingTop: spacing[3]`, `textAlignVertical: 'top'`
- Même fond, bordure, radius que la version une ligne

### États
| État | Fond | Bordure |
|---|---|---|
| Default | `surfaceSunken` | `border` |
| Focused | `surfaceSunken` | `primary` |
| Disabled | `surfaceAlt` | `border` · `opacity: 0.40` |

### Do / Don't
| Do | Don't |
|---|---|
| `autoCorrect={false}` pour les noms de vins | `autoCorrect={true}` sur cépage, producteur |
| Placeholder descriptif (ex : "Ex : Puligny-Montrachet") | Placeholder = label (redondant) |
| `colors.textPlaceholder` pour le placeholder | `colors.textDisabled` pour le placeholder |
| `keyboardShouldPersistTaps="handled"` sur le ScrollView parent | — |

---

## 12. Badge (Comparaison)

### Objectif
Qualifier le résultat d'une comparaison hypothèse/réalité.

### Composition
```
[ Texte xs uppercase semibold letterSpacing:0.4 ]
```
- Padding : `spacing[2]` horizontal, `3` vertical
- `radius.full`
- Fond et texte selon résultat :

| Résultat | Label | Fond | Texte |
|---|---|---|---|
| `match` | JUSTE | `matchSubtle` (#E8F2EB) | `match` (#2E6B4F) |
| `close` | PROCHE | `closeSubtle` (#F5EAD8) | `close` (#8C5A1A) · `fontWeight.semibold` |
| `miss` | À REVOIR | `missSubtle` (#EDE8E0) | `miss` (#6E5E52) |
| Réalité absente | INCOMPLET | `missSubtle` | `miss` |

### Règles
- Toujours accompagné d'un label texte lisible (ne jamais informer par couleur seule)
- `fontWeight.semibold` obligatoire sur tous les badges (lisibilité à xs)
- Jamais de badge sur un champ dont la réalité est totalement inconnue

---

## 13. EmptyState

### Objectif
Indiquer l'absence de contenu sans dramatiser ni surcharger visuellement.

### Composition
```
[ Titre lg · semibold · centré ]
[ Corps sm · textSecondary · centré · lineHeight 22 ]
[ CTA Tertiary optionnel ]
```

- Conteneur : `flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`, `padding: spacing[8]`
- Gap entre éléments : `spacing[4]`
- **Pas d'illustration, pas d'emoji standalone**

### Do / Don't
| Do | Don't |
|---|---|
| Titre ≤ 8 mots | Titre > 8 mots |
| Corps ≤ 20 mots | Corps long et explicatif |
| CTA Tertiary ou Secondary | CTA Primary (trop insistant) |
| Texte neutre et factuel | "Rien à voir ici !" (ton gamifié) |
| Proposer une action claire | Laisser l'utilisateur bloqué |

---

## 14. HeroBlock (Sleep, Reveal — choice)

### Objectif
Zone centrale des écrans de seuil rituel. Remplace l'`iconCircle` SaaS de la v1.

### Composition
```
[ Icône 24–32px · textSecondary ]
[ Titre 2xl · bold ]
[ Corps base · textSecondary · centré · lineHeight 24 ]
[ Pill indicateur optionnel ]
```

- Icône : 24–32px, `colors.textSecondary` — **pas de cercle de fond**
- Titre : `fontSize.2xl` (24px), `fontWeight.bold`, `colors.text`
- Corps : `fontSize.base`, `colors.textSecondary`, `textAlign: 'center'`, `lineHeight: 24`
- Conteneur : `flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`, `gap: spacing[8]`
- Padding horizontal : `spacing[8]` (32px) — respiration maximale

**Pill indicateur (ex : "○ Tu révèleras les vraies infos à la fin") :**
- Fond `surfaceAlt`, `radius.full`
- Texte `fontSize.xs`, `colors.textSecondary`
- Padding : `spacing[4]` horizontal, `spacing[2]` vertical

### Règles
- L'icône n'a **pas** de fond circulaire coloré (suppression du pattern `iconCircle` v1)
- L'icône est `textSecondary` au repos — elle guide sans dominer
- La Pill indicateur est réservée aux messages de règle du jeu (Sleep, Reveal)

### Do / Don't
| Do | Don't |
|---|---|
| Icône sans fond de couleur | `iconCircle` avec `primarySubtle` et `primaryBorder` |
| `spacing[8]` de gap | `spacing[5]` (trop compressé pour un écran de rituel) |
| Icône `textSecondary` | Icône `primary` (domine l'espace) |
| Titre en sentence case | Titre en UPPERCASE |

---

## 15. SectionCard

### Objectif
Regrouper des champs liés dans un conteneur identifiable. Utilisé dans Entry, Memory, Comparison.

### Composition
```
[ En-tête : Label sm · semibold · sentence case · surfaceAlt ]
[ Corps : champs / rows · surface · padding spacing[4] ]
```

- Fond global : `colors.surface`
- Bordure : `borderWidth: 1`, `colors.border`, `radius.lg` (10px)
- `overflow: 'hidden'`

**En-tête :**
- Fond : `colors.surfaceAlt`
- Bordure bas : `borderBottomWidth: 1`, `colors.border`
- Padding : `spacing[3]` tous côtés
- Texte : `fontSize.sm`, `fontWeight.semibold`, `colors.text`, sentence case
- **Pas d'emoji dans l'en-tête**

**Corps :**
- Padding : `spacing[4]`
- Gap entre items : `spacing[3]` (InfoRow) ou `spacing[4]` (champs de formulaire)

### Do / Don't
| Do | Don't |
|---|---|
| Titre de section en sentence case | Titre en UPPERCASE |
| Titre de section sans emoji | 🍾 "La bouteille", 💭 "Mes hypothèses" |
| `overflow: 'hidden'` sur le conteneur | Radius visible mais contenu débordant |
| Gap `spacing[4]` entre champs | Gap `spacing[2]` (trop dense) |

---

## OCRConfidenceIndicator (Phase 5.x)

### Objectif
Signaler à l'utilisateur qu'un champ a été pré-rempli par l'OCR, et indiquer le niveau de fiabilité de la valeur détectée.

### Dot (état actuel Phase 5 — non interactif)

Petit cercle de 8×8 px affiché à droite du label du champ, uniquement si la valeur a été pré-remplie.

| Couleur | Token | Condition |
|---|---|---|
| Vert `#2E6B4F` | `confidenceHigh` | `confidence === 'high'` |
| Orange `#8C5A1A` | `confidenceMed` | `confidence === 'medium'` ou `candidates` présents (conflit) |
| Absent | — | `confidence === 'low'` ou champ non détecté |

```
[ Label champ ]  ●   ← dot vert ou orange
[ TextInput pré-rempli ]
```

Composition du label row :
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: spacing[2]`
- Dot : `width: 8`, `height: 8`, `borderRadius: 4`
- Fond dot : `confidenceHigh` ou `confidenceMed`

### Bannière autofill
Affichée en haut du formulaire si `hasAutofill === true` (au moins 1 champ pré-rempli) :

```
┌──────────────────────────────────────────────┐
│  Certains champs ont été pré-remplis depuis   │
│  l'étiquette. Vérifie ceux en orange.         │
└──────────────────────────────────────────────┘
```

- Fond : `primarySubtle`
- Bordure : `primaryBorder`
- Radius : `radius.md`
- Texte : `fontSize.sm`, couleur `primary`, `lineHeight: 20`

### Dot tappable (Phase 5.x Lot B — interactif)

Le dot devient un `Pressable`. Au tap, affiche un overlay léger (Modal ou Alert simple) :

**Contenu overlay :**
```
[ Millésime ]
Détecté sur : Étiquette avant
Confiance : Haute

[Si candidates présents :]
Autres valeurs détectées : 2018, 2020
```

- Si `confidence === 'high'` : "Confiance haute — valeur fiable"
- Si `confidence === 'medium'` : "Confiance moyenne — vérifie cette valeur"
- Si `candidates` présent : lister les alternatives

**Implémentation suggérée (Lot B) :**
- `Pressable` wrapper autour du dot avec `hitSlop: 12`
- `Alert.alert(label, details)` en première itération (simple, zero dépendance)
- Évoluer vers `BottomSheet` si la liste de candidats est longue

### Do / Don't

| Do | Don't |
|---|---|
| Dot uniquement si champ pré-rempli par OCR | Dot sur les champs saisis manuellement |
| Orange pour conflit (candidates) | Dot rouge visible (low = absent = pas de dot) |
| Bannière sobre au sommet du formulaire | Pop-up bloquant au scan |
| Tappable pour plus de détails | Forcer l'utilisateur à confirmer chaque champ |

---

*Ce document est la référence de composition avant toute implémentation.*
*Prochaine étape : application progressive (Étape 4) après validation du Component Kit.*
*Ordre d'application suggéré : tokens.js → composants de base → écrans du rituel Aveugle.*
