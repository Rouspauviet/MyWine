# 30 — Engineering

Architecture technique, routes, pièges. Modèle de données → [Data_Model.md](Data_Model.md).

## Stack

| Couche | Techno | Notes |
|---|---|---|
| UI | React 19, fichiers `.jsx` | Pas de TypeScript |
| Build | Vite 8 | `base: './'` → fonctionne dans n'importe quel sous-dossier |
| Navigation | React Router 7, `HashRouter` | URLs en `#/…` : aucun réglage serveur nécessaire |
| Persistance | IndexedDB via `idb` | `web/src/db/db.js` |
| Icônes | `lucide-react` | |
| Style | CSS vanilla : `tokens.css` + `app.css` | Aucune valeur en dur hors `tokens.css` |
| Hors ligne | Service worker écrit à la main | `web/public/sw.js` |

Pas de store global : chaque écran charge ce dont il a besoin depuis IndexedDB (`useAsync`).

## Structure `web/`

```
index.html                 ← métadonnées PWA / iOS
vite.config.js
public/
  manifest.webmanifest · sw.js · icônes
src/
  main.jsx                 ← montage React + enregistrement du service worker (production)
  App.jsx                  ← routes
  styles/
    tokens.css             ← source de vérité visuelle
    app.css                ← classes de l'app
  db/
    db.js                  ← modèle (newRecord, emptyReality…) + accès IndexedDB
  data/
    wineData.js            ← vocabulaire de dégustation par type de vin
    grapeVarieties.js      ← ~100 cépages (autocomplétion)
    appellationsFR.json    ← 299 appellations françaises avec région
    appellations.js        ← recherche d'appellation, liste des régions
  utils/
    text.js                ← normalize, dates, prix, libellés, titres de fiche
    comparison.js          ← computeComparison() + indices
    photos.js              ← compression, vignettes, usePhotoDraft, usePhotoUrls
    backup.js              ← export / import complet
  components/
    Layout.jsx             ← Screen, Header, Body, Footer, Card, InfoRow, ConfirmModal, useAsync
    Inputs.jsx             ← Field, TextField, ChipGroup, TagInput, SuggestInput, Slider, RatingStars, Switch
    Forms.jsx              ← PhotoPicker, BottleForm, ImpressionForm, AppellationInput
  screens/
    Home · Sleep · Tasting · Reveal · Comparison · RecordEdit · Journal · Entry · Settings
```

## Routes

| Route | Écran | Mode |
|---|---|---|
| `/` | Home | — |
| `/sleep` | Sleep — rituel, crée le brouillon | Aveugle |
| `/tasting/:id` | Tasting — type + wizard 4 étapes | Aveugle |
| `/reveal/:id` | Reveal — moment de vérité + formulaire bouteille | Aveugle |
| `/comparison/:id` | Comparison | Aveugle |
| `/memory/new` | RecordEdit (création) | Mémoire |
| `/journal` | Journal | commun |
| `/entry/:id` | Entry — fiche complète | commun |
| `/entry/:id/edit` | RecordEdit (modification) | commun |
| `/settings` | Settings — export, import, effacement | — |

## Photos

- Saisie par `<input type="file" accept="image/*" multiple>` : sur iPhone, propose appareil photo et photothèque.
- Compression à l'ajout : 1600 px max, JPEG qualité 0,82 (~300 Ko).
- Stockées dans le magasin `photos` en `ArrayBuffer` + type MIME.
- Une **vignette** (240 px, data URL) de la première photo est copiée sur la fiche (`record.thumb`) : le journal n'ouvre jamais le magasin `photos`.
- Dans un formulaire, `usePhotoDraft()` garde les ajouts/suppressions en mémoire ; rien n'est écrit avant `commit()` à l'enregistrement.

## Hors ligne

`sw.js` : fichiers `assets/` (noms hachés) en cache d'abord ; page et fichiers racine en réseau d'abord avec repli sur le cache. À la première visite, la page envoie au service worker la liste des fichiers déjà chargés pour qu'ils soient mis en cache tout de suite.

Le service worker n'est enregistré qu'en production et exige HTTPS (ou `localhost`).

## Pièges

| Piège | Règle |
|---|---|
| Safari iOS purge le stockage d'un site non visité pendant ~7 jours | L'app doit être **ajoutée à l'écran d'accueil** (exemptée). Rappel d'export sur l'accueil et dans les paramètres. |
| Zoom automatique d'iOS sur les champs | Police des champs ≥ 16 px (`--f-input`) |
| `crypto.randomUUID` absent en HTTP (test sur téléphone via Wi-Fi) | `generateId()` dans `utils/text.js` a un repli |
| Encoche et barre d'accueil iPhone | `viewport-fit=cover` + `env(safe-area-inset-*)` dans `app.css` |
| Hauteur d'écran sur mobile | `100dvh`, pas `100vh` |
| Sur iPhone, toucher une suggestion fait perdre le focus au champ avant le clic | La liste reste affichée 250 ms après le `blur` (voir `SuggestInput`). Ne jamais masquer une liste cliquable directement sur `blur`. |
| `"2026-11-13"` interprété en UTC par `new Date` | `formatDate()` force midi local |
| Blob dans IndexedDB peu fiable sur d'anciens Safari | Photos stockées en `ArrayBuffer` |
| Composant défini dans un composant | Toujours définir au niveau module (sinon perte de focus à chaque frappe) |
| Évolution du modèle | Fusionner avec les valeurs par défaut à la lecture (`{ ...emptyReality(), ...r.reality }`), ne jamais supposer qu'un champ existe |
