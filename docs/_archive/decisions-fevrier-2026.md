# Archive — Décisions structurantes — Février 2026

*Archivé 2026-03-02. Toutes ces décisions sont ✅ implémentées et stables.*
*Elles ne sont plus actives dans `60_Decisions/` mais constituent la référence historique des choix UX fondateurs de l'app.*

---

## Mode Aveugle — scan à la révélation, jamais avant
*Tranchée le 2026-02-27 · ✅ Implémentée Phase 4*

### Contexte
Le mode Aveugle était conçu avec un scan obligatoire en entrée de parcours. Cette décision le supprime.

### Décision
**En Mode Aveugle, aucun scan n'a lieu avant la dégustation.**

L'étiquette entre dans le parcours uniquement à l'étape Révélation, et seulement si l'utilisateur le choisit. Le scan est un outil de révélation / complétion, pas un point d'entrée.

### Flux aveugle
```
Home
  → crée TastingDraft (bottleScanId = null)
  → /sleep/[draftId]
  → /tasting/[draftId]
  → /reveal/[draftId]      ← carrefour
  → /comparison/[recordId]
```

### Conséquences
- L'écran Sleep ne reçoit plus de `scanId`, seulement le `draftId`
- Le bouton "Passer et révéler directement" supprimé
- Lien discret "Tu connais déjà ce vin ? → Mémorise-le" → Mode Mémoire
- Route `sleep/[scanId].jsx` → renommé `sleep/[draftId].jsx`
- `db.createTastingDraft()` accepte `bottleScanId = null`

---

## Révélation — écran carrefour, pas un formulaire
*Tranchée le 2026-02-27 · ✅ Implémentée Phase 4*

### Contexte
L'écran Reveal était un formulaire administratif. Il devient le moment fort du parcours Aveugle.

### Décision
**L'écran Révélation est un carrefour à 3 choix.**

| Option | Comportement |
|---|---|
| Scanner l'étiquette | Photo plein écran → formulaire pré-rempli (OCR) ou vide |
| Saisir manuellement | Formulaire direct |
| Je ne connais pas la bouteille | Sauvegarde sans réalité, "Comparaison impossible" |

### Conséquences
- `reveal/[draftId].jsx` : état `step = 'choice' | 'scanning' | 'manual' | 'unknown'`
- OCR Phase 5 : scan = point d'injection naturel
- `handleSkip` actuel → chemin "Je ne connais pas la bouteille"

---

## Comparaison — format lignes, non terminale
*Tranchée le 2026-02-27 · ✅ Implémentée Phase 4*

### Décision
**Chaque champ comparable sur une ligne unique. Pas de score global.**

```
Cépage(s)    Pinot Noir   [Juste ✓]   Pinot Noir
Région       Bourgogne    [Proche ~]   Côte de Nuits
```

- Résumé textuel : *"2 justes, 1 proche, 1 à revoir"*
- Insights : max 2, ton pédagogique
- Footer : "Voir la fiche complète" → `/entry/[recordId]` + "Retour au journal"

### Conséquences
- `comparison/[recordId].jsx` : `ComparisonRow` remplace `HypoRow`/`RealityRow`
- Pas de jauge ni note numérique

---

## Hints wizard — à la demande uniquement
*Tranchée le 2026-02-27 · ✅ Implémentée Phase 4 (résout B1)*

### Décision
**Les hints sont affichés uniquement à la demande**, via une icône `?` à côté du label.

- Tap → bloc contextuel inline, max 1-2 phrases définitionnelles
- Étape 2 (Structure) : priorité. Étape 3 (Hypothèses) : pas de hints.
- `activeHint` état local dans `StepStructure`

---

## Hypothèses — entonnoir général → particulier
*Tranchée le 2026-02-27 · ✅ Implémentée Phase 4*

### Décision
**Ordre des champs** : Cépage(s) → Confiance → Pays → Région → Climat → Sol

**Section dépliable "Pour aller plus loin"** (fermée par défaut) :
- Appellation / AOC · Producteur · Millésime

### Conséquences
- `StepHypotheses` : `isAdvancedOpen` état local
- Data model inchangé (mêmes champs)

---

## Mode Mémoire — scan optionnel, minimum requis
*Tranchée le 2026-02-27 · ✅ Implémentée Phase 4.5*

### Décision
**Scan optionnel.** Le Mode Mémoire démarre directement sur le formulaire.

Champ minimum pour sauvegarder : **au moins UN** — Cuvée OU Photo.

- `[scanId].jsx` accepte `scanId = 'new'` comme valeur spéciale
- Photo picker intégrée dans le formulaire (pas d'écran séparé)
- `db.createBottleScan()` appelé à la sauvegarde uniquement si photo existe

---

## Changement de type en cours de dégustation — reset partiel
*Tranchée le 2026-02-27 · ✅ Implémentée Phase 4*

### Décision
**Le changement de type réinitialise uniquement les champs liés au type.**

| Champ | Comportement |
|---|---|
| `perception.robe[]` | Effacé |
| `perception.aromaFamilies[]` | Effacé |
| `perception.aromaIntensity` | Conservé |
| `perception.notes` | Conservé |
| `structure` | Effacé |
| `hypotheses` | Conservé |
| `style` | Conservé |

- Alerte uniquement si données type-spécifiques existantes
- Formulaire redémarre à l'étape 0 (TypeSelector)
