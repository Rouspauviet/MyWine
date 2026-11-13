# Structure du formulaire de dégustation — MyWine
*État au 2026-02-26 — reflet fidèle de l'implémentation actuelle*

Ce document décrit le formulaire tel qu'il est implémenté dans `app/src/pages/AddPage.jsx`.
Il est destiné à guider une amélioration UX/design du formulaire.

---

## Vue d'ensemble

Le formulaire est organisé en **sections fixes obligatoires** puis en **accordéons optionnels**.
Le type de vin sélectionné conditionne certains champs (voir tableau récapitulatif en fin de doc).

---

## 1. Champs obligatoires (toujours visibles)

### Nom du vin
- Type : `text`
- Obligatoire
- Placeholder : `ex : Gevrey-Chambertin`

### Couleur (type de vin)
- Type : grille de boutons toggle (7 options, une seule sélection)
- Options :
  - 🔴 Rouge
  - ⚪ Blanc
  - 🌸 Rosé
  - 🍷 Clairet
  - 🟠 Orange
  - ✨ Pétillant
  - ⚫ Autre
- Par défaut : Rouge
- Impact : conditionne les champs Reflets (Visuel), Familles d'arômes (Nez), Tanins (Bouche)

### Date de dégustation
- Type : `date`
- Obligatoire
- Pré-remplie avec la date du jour
- Maximum : aujourd'hui (validé côté JS en plus de l'attribut max)

### Note globale
- Type : `range` slider
- Plage : 0–100
- Affiché : valeur / 100
- Toujours visible, non effaçable

---

## 2. Accordéon — Identité

Informations sur le vin. Tous les champs sont optionnels.

| Champ | Type | Placeholder / Note |
|---|---|---|
| Producteur / Domaine | text | ex : Domaine Leflaive |
| Appellation | text | ex : Bourgogne AOC |
| Région | text | ex : Bourgogne |
| Pays | text | ex : France |
| Millésime | number | 1900–année en cours |
| Cépages | text | Liste séparée par virgules, ex : Pinot Noir, Gamay |

---

## 3. Accordéon — Visuel

*Masqué pour le type "Autre".*

### Intensité
- Type : chips toggle (une seule valeur, effaçable)
- Options : `Clair` · `Moyen` · `Profond`

### Reflets
- Type : chips toggle (une seule valeur, effaçable)
- Options **selon le type de vin** :
  - Rouge : Violacé · Grenat · Tuilé · Rubis
  - Blanc : Vert pâle · Doré · Ambré
  - Rosé : Rose pâle · Saumoné · Cuivré
  - Clairet : Violacé · Grenat · Tuilé
  - Orange : Ambré · Cuivré · Orangé
  - Pétillant : Vert pâle · Doré · Rosé
  - Autre : champ absent
- Masqué si aucune option n'existe pour le type

### Limpidité
- Type : chips toggle (une seule valeur, effaçable)
- Options : `Limpide` · `Trouble`

---

## 4. Accordéon — Nez

*Masqué pour le type "Autre".*

### Familles d'arômes
- Type : chips toggle multi-select (plusieurs valeurs possibles, effaçables)
- Options **selon le type de vin** :
  - Rouge : Fruités rouges · Fruités noirs · Épicés · Boisé · Évolution
  - Blanc : Agrumes · Fruits à chair blanche · Floraux · Minéral · Boisé
  - Rosé : Fruits rouges frais · Agrumes · Floral · Bonbon
  - Clairet : Fruités rouges · Fruités noirs · Épicés · Boisé · Évolution
  - Orange : Fruits secs · Thé · Épices · Écorce
  - Pétillant : Brioche · Pomme · Agrumes · Amande · Levure
  - Autre : champ absent

### Notes libres (Nez)
- Type : `textarea`
- Placeholder : ex : cerise noire, sous-bois, légère touche fumée…
- Rows : 3

---

## 5. Accordéon — Bouche & Finale

*Masqué pour le type "Autre".*

Tous les sliders sont **optionnels** : masqués jusqu'à activation via bouton "+ Ajouter", effaçables avec ×.

### Acidité
- Type : slider optionnel, plage 0–10, valeur par défaut à l'activation : 5
- Présent pour tous les types sauf "Autre"

### Tanins
- Type : slider optionnel, plage 0–10, valeur par défaut : 5
- **Présent uniquement pour : Rouge, Clairet, Orange**

### Corps
- Type : slider optionnel, plage 0–10, valeur par défaut : 5

### Longueur
- Type : slider optionnel, plage 0–10, valeur par défaut : 5

### Notes libres (Bouche)
- Type : `textarea`, 3 lignes
- Placeholder : ex : tanins soyeux, belle tension acide…

### Finale
- Type : `text`
- Placeholder : ex : persistante, épicée

---

## 6. Accordéon — Contexte

Toujours présent, tous les champs optionnels.

| Champ | Type | Note |
|---|---|---|
| Prix (€) | number (min 0, step 0.01) | Placeholder : ex : 24 |
| Occasion | text | Placeholder : ex : dîner en famille |
| Accords mets | text | Liste séparée par virgules |
| Notes générales | textarea (3 lignes) | Absent pour le type "Autre" (qui a son propre champ) |
| À racheter ? | chips toggle Oui / Non | Effaçable (clic sur valeur active) |

---

## 7. Section — Photos

- Nombre maximum : 3 photos
- Format accepté : `image/*` (HEIC/iOS compatible via canvas)
- Capture : `environment` (caméra arrière par défaut)
- Aperçu en grille avec bouton suppression
- Bouton "+ Ajouter" masqué quand 3 photos atteintes

---

## 8. Type "Autre" — cas particulier

Quand le type "Autre" est sélectionné, les accordéons Visuel / Nez / Bouche & Finale sont **remplacés** par un unique accordéon :

### Notes de dégustation (Autre)
- `textarea`, 5 lignes
- Placeholder : Décrivez librement ce vin…

L'accordéon Identité et Contexte restent présents normalement.

---

## Récapitulatif — Conditionnalité par type de vin

| Champ | Rouge | Blanc | Rosé | Clairet | Orange | Pétillant | Autre |
|---|---|---|---|---|---|---|---|
| Reflets | ✅ (4 options) | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3) | — |
| Familles d'arômes | ✅ (5 tags) | ✅ (5) | ✅ (4) | ✅ (5) | ✅ (4) | ✅ (5) | — |
| Tanins (slider) | ✅ | — | — | ✅ | ✅ | — | — |
| Visuel / Nez / Bouche | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ remplacé |
| Notes générales (Contexte) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

---

## Structure de navigation du formulaire

```
[En-tête : Annuler ←   Nouvelle bouteille]

─── Champs obligatoires ──────────────────
  Nom du vin *
  Couleur *         [grille 7 options]
  Date *            [date picker, max=today]
  Note globale *    [slider 0-100]

─── Accordéon : Identité ─────────────────
  Producteur · Appellation · Région · Pays
  Millésime · Cépages

─── Accordéon : Visuel ───────────────────  (absent si type=Autre)
  Intensité · Reflets (contextuel) · Limpidité

─── Accordéon : Nez ──────────────────────  (absent si type=Autre)
  Familles d'arômes (contextuel) · Notes libres

─── Accordéon : Bouche & Finale ──────────  (absent si type=Autre)
  Acidité · [Tanins] · Corps · Longueur
  Notes libres · Finale

─── Accordéon : Notes de dégustation ────  (type=Autre uniquement)
  Notes libres

─── Accordéon : Contexte ─────────────────
  Prix · Occasion · Accords mets
  Notes générales (absent si type=Autre)
  À racheter ?

─── Section : Photos ─────────────────────
  Grille 0-3 photos + bouton caméra

─── Bouton : Enregistrer ─────────────────
```

---

## Données stockées (modèle WineEntry)

Pour référence, les champs stockés en base (Dexie / IndexedDB) :

```
id, name, colour, tastingDate, rating,
producer, region, country, appellation, vintage, grapeVarieties[],
visual: { intensity, hue, clarity },
nose: { families[], text },
palate: { acidity, tannins, body, length, text },
finish, notes, price, occasion, pairings[],
buyAgain, photos[{ id, data(base64), mimeType, sizeBytes, caption }],
createdAt, updatedAt
```
