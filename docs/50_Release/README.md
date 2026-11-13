# 50 — Release

Lancer en local, mettre en ligne, installer sur iPhone.

## Lancer en local

```bash
cd web
npm install        # la première fois
npm run dev        # http://localhost:5173
```

### Tester sur le téléphone sans mise en ligne

`npm run dev` affiche aussi une adresse "Network" (ex : `http://192.168.1.20:5173`). Ouvre-la dans Safari sur l'iPhone, connecté au même Wi-Fi.

Limites de ce mode (HTTP, pas HTTPS) : pas de service worker, donc pas de mode hors ligne, et les données sont liées à cette adresse. Suffisant pour essayer les parcours, pas pour un usage réel.

## Build

```bash
cd web
npm run build      # génère web/dist (fichiers statiques)
npm run preview    # sert web/dist en local pour vérifier
```

`web/dist` peut être déposé tel quel sur n'importe quel hébergement statique HTTPS.

## Mise en ligne — GitHub Pages

Le workflow [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) construit `web/` et publie `web/dist` à chaque push sur `main`.

À faire une seule fois, sur github.com :

1. Dépôt → **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Fusionner la branche dans `main` et pousser.
3. L'app est servie sur `https://rouspauviet.github.io/MyWine/`.

À savoir :

- GitHub Pages est gratuit pour un dépôt **public**. Pour un dépôt privé il faut un compte payant ; sinon utiliser Netlify ou Cloudflare Pages (glisser-déposer de `web/dist`, ou connexion au dépôt avec dossier de base `web`, commande `npm run build`, dossier publié `dist`).
- Le site publié ne contient que le code de l'app. Les fiches et photos restent sur l'appareil de chaque visiteur.
- **Changer d'adresse = repartir d'un stockage vide.** Le stockage du navigateur est lié à l'adresse du site : avant de changer d'hébergement, exporter le journal, puis l'importer sur la nouvelle adresse.

## Installer sur iPhone

1. Ouvrir l'adresse HTTPS dans **Safari**.
2. Bouton Partager → **Sur l'écran d'accueil**.
3. Lancer MyWine depuis l'icône.

Important : l'app installée a **son propre stockage**, distinct de celui de l'onglet Safari. Installer d'abord, saisir ensuite — ou exporter depuis Safari puis importer dans l'app installée.

L'installation évite que Safari efface les données d'un site resté longtemps sans visite. Elle ne remplace pas la sauvegarde.

## Sauvegarde

Paramètres → **Exporter mon journal** : un fichier JSON avec toutes les fiches et les photos. Sur iPhone, la feuille de partage permet "Enregistrer dans Fichiers" (iCloud Drive).

L'accueil affiche un rappel au-delà de 5 vins si aucune sauvegarde n'a été faite depuis 30 jours.

## Versioning

Version dans `web/package.json`, affichée en bas des paramètres.

| Version | Date | Contenu |
|---|---|---|
| 2.0.0 | 2026-11-13 | Réécriture en webapp : parcours Aveugle et Mémoire, photos, prix, fiche modifiable, sauvegarde complète |
| 2.1.0 | 2026-11-13 | Niveaux, dégustation à plusieurs sans serveur, fiche "Pour comprendre", indices, mot de l'hôte, assistant IA optionnel |

Pour forcer le renouvellement du cache hors ligne après un changement de `sw.js`, incrémenter `CACHE` dans `web/public/sw.js`.
