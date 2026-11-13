# Modèle de données

*Source de vérité : `web/src/db/db.js`. Base IndexedDB `mywine`, version 1.*

Deux magasins :

| Magasin | Clé | Index | Contenu |
|---|---|---|---|
| `records` | `id` | `status` | Fiches du journal **et** brouillons de dégustation à l'aveugle |
| `photos` | `id` | `recordId` | Photos compressées |

---

## `records`

```js
{
  id: 'uuid',
  mode: 'blind' | 'memory',
  status: 'draft' | 'done',        // draft = dégustation à l'aveugle en cours, absente du journal
  createdAt: 'ISO',
  updatedAt: 'ISO',
  tastedAt: 'YYYY-MM-DD',          // date de dégustation, modifiable ; sert au tri du journal

  // ── Mode Aveugle uniquement (valeurs par défaut inertes en mode Mémoire) ──
  step: 0..4,                      // 0 = choix du type
  wineType: 'rouge' | 'blanc' | 'rose' | 'petillant' | 'orange' | 'clairet' | 'autre' | null,  // hypothèse
  perception: { robe: [], aromaIntensity: 1..5, aromaFamilies: [], notes: '' },   // robe et arômes stockés en libellés
  structure: { v: 2, wineType, data: { … } } | {},                                 // clés selon le type, voir wineData.js
  hypotheses: {
    grapes: [], confidence: 1..5, country: '', region: '',
    appellation: '', vintage: '', producer: '', climate: null, soil: null,
  },
  comparison: {
    matches: { type, grapes, country, region, appellation, vintage, producer },   // 'exact' | 'close' | 'miss', clé absente si non comparable
    insights: [],                                                                  // 0 à 2 phrases
  },

  // ── Commun aux deux modes ──
  style: { category: null, overallImpression: '', rating: 1..5 | null, favorite: false, pairings: [], context: '' },
  reality: {
    type: null, cuvee: '', producer: '', vignerons: '', vintage: '',
    grapes: [], appellation: '', region: '', country: '', abv: '',
    price: '', purchasePlace: '',
  },
  thumb: 'data:image/jpeg;base64,…' | null,   // vignette de la première photo
}
```

Notes :

- `style.overallImpression` = "Impression globale" (Aveugle) / "Commentaire" (Mémoire). `style.context` = "Occasion". `style.category` n'est saisi que dans le wizard.
- `wineType` (hypothèse) et `reality.type` (vérité) sont deux champs distincts ; leur comparaison donne `matches.type`.
- `price` et `abv` sont des chaînes saisies librement (virgule acceptée) ; `formatPrice()` gère l'affichage.
- Une fiche à l'aveugle "bouteille inconnue" a une `reality` vide et `comparison.matches` vide.

### Structure par type (`structure.data`)

| Type | Clés |
|---|---|
| rouge | `taninIntensity`, `taninTexture[]`, `fruitMaturity`, `body`, `acidity`, `finish` |
| blanc | `acidity`, `texture`, `minerality`, `mineralityType[]`, `boise`, `finish` |
| rose | `vivacity`, `body`, `perceivedSweetness`, `lightStructure`, `finish` |
| petillant | `bubbleQuality`, `perceivedDosage`, `sparklingRegister`, `vivacity`, `body` |
| orange | `phenolicIntensity`, `phenolicType[]`, `bitterness`, `bitternessType[]`, `oxidativeRegister`, `residualAcidity`, `finish` |
| clairet, autre | `body`, `finish`, `paletteFree` |

Les valeurs sont les `value` des listes de `wineData.js` ; l'affichage passe par `labelOf()`.

---

## `photos`

```js
{ id: 'uuid', recordId: 'uuid', order: 0, type: 'image/jpeg', data: ArrayBuffer }
```

Supprimer une fiche supprime ses photos dans la même transaction.

---

## Fichier de sauvegarde

Produit par `utils/backup.js` — `mywine-sauvegarde-YYYY-MM-DD.json` :

```js
{
  app: 'mywine',
  version: 3,
  exportedAt: 'ISO',
  records: [ … ],                                              // tels quels, brouillons compris
  photos: [{ id, recordId, order, type, dataUrl: 'data:image/jpeg;base64,…' }],
}
```

L'import **fusionne par identifiant** : une fiche du fichier remplace la fiche locale de même `id`, les autres fiches locales sont conservées.

La date du dernier export est gardée dans `localStorage` (`mywine.lastExport`) pour le rappel de sauvegarde.

---

## Faire évoluer le modèle

- Ajouter un champ : l'ajouter dans `newRecord()` / `emptyReality()` / `emptyStyle()` et le lire avec une valeur par défaut. Pas besoin de changer la version de la base.
- Ajouter un magasin ou un index : incrémenter la version dans `openDB('mywine', N)` et compléter `upgrade()` sans toucher aux magasins existants.
- Changer le format de sauvegarde : incrémenter `version` et garder l'import des anciennes versions.
