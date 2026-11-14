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
| QR code | `qrcode` | Invitation de la dégustation à plusieurs |
| Assistant IA | `@anthropic-ai/sdk`, chargé à la demande | Optionnel — `web/src/utils/ai.js` |
| Chiffrement | Web Crypto (`crypto.subtle`) | AES-GCM, clé dérivée du code par PBKDF2 — `web/src/utils/session.js` |
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
    levels.js              ← niveaux, préférences (niveau, prénom), cépages courants par couleur
    wineKnowledge.js       ← profils typiques des cépages, repères par région et pays
  utils/
    text.js                ← normalize, dates, prix, libellés, titres de fiche
    comparison.js          ← computeComparison() + indices
    photos.js              ← compression, vignettes, usePhotoDraft, usePhotoUrls
    backup.js              ← export / import complet
    session.js             ← dégustation à plusieurs : invitation chiffrée, choix multiples, indices, révélation
    pedagogy.js            ← fiche "Pour comprendre" (calculée à l'affichage)
    ai.js                  ← assistant IA optionnel : clé locale, lecture d'étiquette, profil attendu
  components/
    Layout.jsx             ← Screen, Header, Body, Footer, Card, InfoRow, ConfirmModal, useAsync
    Inputs.jsx             ← Field, TextField, ChipGroup, TagInput, SuggestInput, Slider, RatingStars, Switch
    Forms.jsx              ← PhotoPicker, BottleForm, ImpressionForm, AppellationInput
    LevelPicker.jsx        ← choix du niveau
  screens/
    Home · Sleep · Tasting · Reveal · Comparison · RecordEdit · Journal · Entry · Settings
    HostNew · HostSession · Join   ← dégustation à plusieurs
```

## Routes

| Route | Écran | Mode |
|---|---|---|
| `/` | Home | — |
| `/sleep` | Sleep — rituel, crée le brouillon | Aveugle |
| `/tasting/:id` | Tasting — type + wizard 4 étapes | Aveugle |
| `/reveal/:id` | Reveal — moment de vérité + formulaire bouteille | Aveugle |
| `/comparison/:id` | Comparison | Aveugle |
| `/host/new` | HostNew — l'hôte saisit la bouteille | À plusieurs |
| `/host/:id` | HostSession — QR code, lien, code de révélation | À plusieurs |
| `/join/:token` | Join — arrivée de l'invité, choix du niveau | À plusieurs |
| `/memory/new` | RecordEdit (création) | Mémoire |
| `/journal` | Journal | commun |
| `/entry/:id` | Entry — fiche complète | commun |
| `/entry/:id/edit` | RecordEdit (modification) | commun |
| `/settings` | Settings — export, import, effacement, assistant IA et son partage | — |
| `/assistant/:token` | AssistantJoin — un ami prête son assistant : saisie du code de 8 lettres | — |

## Photos

- Saisie par `<input type="file" accept="image/*" multiple>` : sur iPhone, propose appareil photo et photothèque.
- Compression à l'ajout : 1600 px max, JPEG qualité 0,82 (~300 Ko).
- Stockées dans le magasin `photos` en `ArrayBuffer` + type MIME.
- Une **vignette** (240 px, data URL) de la première photo est copiée sur la fiche (`record.thumb`) : le journal n'ouvre jamais le magasin `photos`.
- Dans un formulaire, `usePhotoDraft()` garde les ajouts/suppressions en mémoire ; rien n'est écrit avant `commit()` à l'enregistrement.

## Dégustation à plusieurs (sans serveur)

`utils/session.js` :

- `createInvitation(reality, hostName)` tire un code de 4 lettres, dérive une clé (PBKDF2, 100 000 itérations, SHA-256, sel aléatoire) et chiffre la bouteille en AES-GCM. Le jeton regroupe, en JSON encodé base64url : identifiant de session, prénom de l'hôte, propositions de choix multiples **en clair**, sel, vecteur d'initialisation, données chiffrées.
- Le lien est `…/#/join/<jeton>`, affiché en QR code. Le jeton est compressé (`deflate-raw`, préfixe `~`) quand le navigateur le permet ; `readInvitation()` est donc asynchrone. Environ 500 caractères pour une bouteille simple, 1100 avec le mot de l'hôte et l'accompagnement de l'assistant.
- Chez l'invité, `Join` copie le jeton dans `record.session` ; `Reveal` appelle `revealInvitation(session, code)` qui renvoie la bouteille, ou `null` si le code est faux (échec d'authentification AES-GCM).
- `buildMcq()` fabrique les choix multiples : bonne réponse + 3 leurres, mélangés.

Le niveau (`record.level`) est lu par `Tasting.jsx` : `STRUCTURE_FIELDS` marque les champs gardés au niveau Débutant (`beginner: true`), `BeginnerHypotheses` remplace la saisie libre par des choix à cocher.

## Base de connaissances et pédagogie

**Raisonnement embarqué** (`utils/reasoning.js`, `components/Reasoning.jsx`) : `reason(record)` lit les notes du joueur sur trois axes communs (tanins, corps, acidité) plus les familles aromatiques et la maturité du fruit, et renvoie `noted` (ses notes en mots), `climate` (frais / tempéré / chaud, avec les raisons), `candidates` (cépages de la couleur classés par compatibilité, avec `fits` et `gaps`), `styles` et `fitOf(nom)`. Il ne lit jamais `record.reality` ni l'invitation : c'est ce qui garantit qu'il ne révèle rien. Limité aux rouges et aux blancs (`available`), et il lui faut au moins deux signaux (`enough`). `grapeKey()` dans `wineKnowledge.js` donne l'identité d'un cépage quel que soit son nom ("Grenache noir", "Cabernet-Sauvignon") : à utiliser pour toute comparaison de cépages.

`data/wineKnowledge.js` décrit une trentaine de cépages (couleur, tanins, corps, acidité, familles aromatiques, style, cépages qu'on confond avec lui) et les régions et pays (climat, voisins). Trois usages :

- `utils/pedagogy.js` → `buildLesson(record)` : texte sur le cépage et la région, et lignes de rapprochement avec la perception. Calculé à l'affichage, rien n'est stocké.
- `session.js` → `withDecoys()` prend d'abord les leurres plausibles (`confusables`, `neighbors`).
- `session.js` → `buildClueData()` / `buildClues()` : l'invitation ne transporte que des codes (`c` climat, `s` style, `i` initiale, `x` positions de deux leurres) ; les phrases sont reconstruites chez l'invité.

Ajouter un cépage : une entrée dans `GRAPES`, avec des familles aromatiques **prises dans `AROMA_FAMILIES_BY_TYPE`** de `wineData.js` (sinon le rapprochement des arômes ne fonctionne pas).

## Assistant IA (optionnel)

`utils/ai.js`, via le SDK officiel `@anthropic-ai/sdk` importé dynamiquement (un fichier séparé, téléchargé seulement au premier usage).

- **Clé** : saisie dans les paramètres, stockée en `localStorage` (`mywine.apiKey`), jamais affichée en entier (4 derniers caractères), absente de la sauvegarde exportée. Modèle choisi dans `mywine.aiModel`.
- **Partage à un ami** (`utils/aiShare.js`, décision [`2026-11-14`](../60_Decisions/2026-11-14-partage-assistant.md)) : `createAssistantShare(apiKey, model)` chiffre la clé et le modèle (AES-GCM, PBKDF2 600 000 itérations) avec un code de 8 lettres tiré au hasard ; le lien `…/#/assistant/<jeton>` ne contient que le texte chiffré, le code se donne de vive voix. `openAssistantShare(token, code)` installe la clé chez l'ami et la marque prêtée (`mywine.apiKeyBorrowed`) : l'app ne propose pas de la repartager. Dans l'app installée, qui n'ouvre pas les liens, on colle le lien dans le champ de la clé. **Jamais dans le lien d'invitation** d'une dégustation : 4 lettres ne protègent pas une clé.
- **Appel** : `askClaude()` — `messages.create` avec `output_config: { effort: 'low', format: { type: 'json_schema', schema } }`, puis `JSON.parse` du bloc texte. `dangerouslyAllowBrowser: true` est assumé : la clé est celle de l'utilisateur, sur son appareil.
- **`readLabel(images)`** : une ou deux photos (base64) → champs de la bouteille. La consigne interdit d'inventer ; `LabelReader` (dans `Forms.jsx`) ne remplit que les champs vides.
- **`prepareTasting(reality)`** : un seul appel à la création de l'invitation → `profile` (320 caractères, chiffré, lu après la révélation), `clues` (2 indices), `focus` (piste d'attention Débutant et Amateur), `grapeDecoys` et `placeDecoys`. Un échec de l'assistant n'empêche jamais de créer l'invitation : on retombe sur la base intégrée.
- **Lecture automatique** : `LabelReader` lance `readLabel` dès qu'une photo *nouvelle* est ajoutée (pas pour les photos déjà enregistrées d'une fiche qu'on modifie), une seule fois par photo.
- **Anti-révélation** : `revealsBottle(text, reality)` dans `session.js` écarte tout indice ou piste qui nommerait la bouteille. À conserver absolument : ces textes voyagent en clair.
- **Erreurs** : converties en `AiError` avec un message en français (clé refusée, pas de crédit, limite atteinte, pas de connexion, refus du modèle).
- **Sans clé** : `hasApiKey()` est faux, aucun bouton ni carte IA n'apparaît hors des paramètres.

Tester sans dépenser : remplacer `window.fetch` pour les URL `api.anthropic.com` par une réponse simulée (voir la section "Vérifié" de [40_QA](../40_QA/README.md)).

## Hors ligne

`sw.js` : fichiers `assets/` (noms hachés) en cache d'abord ; page et fichiers racine en réseau d'abord avec repli sur le cache. À la première visite, la page envoie au service worker la liste des fichiers déjà chargés pour qu'ils soient mis en cache tout de suite.

Le service worker n'est enregistré qu'en production et exige HTTPS (ou `localhost`).

## Pièges

| Piège | Règle |
|---|---|
| Safari iOS purge le stockage d'un site non visité pendant ~7 jours | L'app doit être **ajoutée à l'écran d'accueil** (exemptée). Rappel d'export sur l'accueil et dans les paramètres. |
| Zoom automatique d'iOS sur les champs | Police des champs ≥ 16 px (`--f-input`) |
| Un secret dans un dépôt public | Jamais de clé dans un fichier, un test ou une commande enregistrée. Pour un essai réel, passer la clé par une variable d'environnement, le temps de la commande |
| Genre des cépages ("la Syrah", "le Merlot") | Les phrases générées disent "le cépage X" |
| `crypto.subtle` absent en HTTP | La dégustation à plusieurs exige HTTPS ou `localhost` : `isSessionSupported()` désactive l'écran hôte et l'arrivée invité sinon |
| QR code trop dense = difficile à scanner | Garder le jeton court : ne rien ajouter au lien sans nécessité (pas de photo, pas de champ vide) |
| `crypto.randomUUID` absent en HTTP (test sur téléphone via Wi-Fi) | `generateId()` dans `utils/text.js` a un repli |
| Encoche et barre d'accueil iPhone | `viewport-fit=cover` + `env(safe-area-inset-*)` dans `app.css` |
| Hauteur d'écran sur mobile | `100dvh`, pas `100vh` |
| Sur iPhone, toucher une suggestion fait perdre le focus au champ avant le clic | La liste reste affichée 250 ms après le `blur` (voir `SuggestInput`). Ne jamais masquer une liste cliquable directement sur `blur`. |
| `"2026-11-13"` interprété en UTC par `new Date` | `formatDate()` force midi local |
| Blob dans IndexedDB peu fiable sur d'anciens Safari | Photos stockées en `ArrayBuffer` |
| Composant défini dans un composant | Toujours définir au niveau module (sinon perte de focus à chaque frappe) |
| Évolution du modèle | Fusionner avec les valeurs par défaut à la lecture (`{ ...emptyReality(), ...r.reality }`), ne jamais supposer qu'un champ existe |
