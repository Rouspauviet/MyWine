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
  level: 'debutant' | 'amateur' | 'confirme' | 'expert',   // règle le degré d'aide à l'aveugle ; absent des anciennes fiches → 'amateur'
  session: null | { … },           // dégustation à plusieurs, voir plus bas

  // ── Mode Aveugle uniquement (valeurs par défaut inertes en mode Mémoire) ──
  step: 0..4,                      // 0 = choix du type
  wineType: 'rouge' | 'blanc' | 'rose' | 'petillant' | 'orange' | 'clairet' | 'autre' | null,  // hypothèse
  perception: { robe: [], aromaIntensity: 1..5, aromaFamilies: [], notes: '' },   // robe et arômes stockés en libellés
  structure: { v: 2, wineType, data: { … } } | {},                                 // clés selon le type, voir wineData.js
  hypotheses: {
    grapes: [], confidence: 1..5, country: '', region: '',
    appellation: '', vintage: '', producer: '', climate: null, soil: null,
    styleGuess: null,              // style supposé (clé de STYLE_LABELS) — raisonnement guidé du Débutant ; absent des anciennes fiches
    vintageRange: null | { label, min, max },   // millésime donné en tranche (Débutant) ; exclusif avec vintage
  },
  comparison: {
    matches: { type, grapes, country, region, appellation, vintage, producer },   // 'exact' | 'close' | 'miss', clé absente si non comparable
    insights: [],                                                                  // 0 à 2 phrases
  },
  // perception.aromaNotes: []      arômes précis (Confirmé, Expert) ; absent des anciennes fiches
  cluesUsed: 0,                    // indices demandés pendant une dégustation à plusieurs
  reasoningUsed: false,            // "Aide-moi à raisonner" ouverte (Amateur) ; absent des anciennes fiches

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

### Dégustation à plusieurs (`session`)

```js
// Fiche de l'hôte (mode 'memory') — permet de rouvrir l'invitation
{ role: 'host', id, hostName, code: 'ABCD', token: '<jeton du lien>', hostNote: '', aiProfile: '' }

// Fiche de l'invité (mode 'blind')
{ role: 'guest', id, hostName,
  mcq: { grape: [4 cépages], region: [4 régions] | country: [4 pays] },   // en clair
  k: { c: 'frais', s: 'rouge-epice', i: 'R', p: 'pays'?, x: [1, 3] },      // codes des indices, en clair
  a: null | { q: [indices de l'assistant], f: { d: 'piste Débutant', a: 'piste Amateur' } },  // en clair, filtré
  hostNote: '', aiProfile: '',                                             // remplis à la révélation
  s: '<sel>', i: '<vecteur>', c: '<bouteille chiffrée>' }                  // base64url
```

`id` est commun à l'hôte et à tous ses invités. Après révélation, la bouteille déchiffrée est copiée dans `reality` ; les champs chiffrés restent sur la fiche sans être relus.

Le jeton du lien est le JSON `{ v: 1, id, host, mcq, k, a?, s, i, c }`, compressé (`deflate-raw`) puis encodé en base64url avec le préfixe `~` ; sans compression disponible, simple base64url. La partie chiffrée `c` contient les champs renseignés de la bouteille, plus `note` (mot de l'hôte) et `ai` (texte de l'assistant) s'ils existent.

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

Clés `localStorage` (préférences de l'appareil, hors sauvegarde) : `mywine.lastExport` (rappel de sauvegarde), `mywine.level` (dernier niveau choisi), `mywine.name` (prénom de l'hôte), `mywine.apiKey` (clé d'API Claude de l'utilisateur), `mywine.apiKeyBorrowed` (`1` si la clé a été prêtée par un ami) et `mywine.aiModel` (modèle choisi).

La sauvegarde contient le code de révélation des invitations créées par l'hôte.

---

## Faire évoluer le modèle

- Ajouter un champ : l'ajouter dans `newRecord()` / `emptyReality()` / `emptyStyle()` et le lire avec une valeur par défaut. Pas besoin de changer la version de la base.
- Ajouter un magasin ou un index : incrémenter la version dans `openDB('mywine', N)` et compléter `upgrade()` sans toucher aux magasins existants.
- Changer le format de sauvegarde : incrémenter `version` et garder l'import des anciennes versions.
