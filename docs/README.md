# MyWine — Documentation

## Démarrer ici

Nouveau sur le projet ? Lis d'abord [`00_Project/Overview.md`](00_Project/Overview.md) — vision, 2 modes, architecture, fichiers clés.

> Le projet a pivoté le 2026-11-13 d'une app native (Expo + OCR) vers une **webapp PWA** — voir la [décision](60_Decisions/2026-11-13-pivot-webapp.md). Tout ce qui concernait l'app native et l'OCR a été supprimé de ce dépôt et reste archivé dans le dépôt privé `MyWine-archive`.

---

## Streams

| N° | Stream | Dossier | Contenu |
|---|---|---|---|
| 00 | Projet | [`00_Project/`](00_Project/) | Vision, vue d'ensemble |
| 10 | Produit / UX | [`10_Product_UX/`](10_Product_UX/) | Intentions, parcours, grammaires de dégustation, micro-copy |
| 20 | Design / UI | [`20_Design_UI/`](20_Design_UI/) | Design System v2, Component Kit |
| 30 | Engineering | [`30_Engineering/`](30_Engineering/) | Architecture, modèle de données, pièges web/iOS |
| 40 | QA | [`40_QA/`](40_QA/) | Checklist de test |
| 50 | Release | [`50_Release/`](50_Release/) | Lancer en local, mise en ligne, installation iPhone |
| 60 | Décisions | [`60_Decisions/`](60_Decisions/) | Décisions structurantes (1 décision = 1 fichier) |
| 70 | Backlog | [`70_Backlog/`](70_Backlog/) | Roadmap |

---

## Où est la vérité ?

| Sujet | Source de vérité |
|---|---|
| Vue d'ensemble projet | [`00_Project/Overview.md`](00_Project/Overview.md) |
| Parcours Aveugle | [`10_Product_UX/Flows/Blind.md`](10_Product_UX/Flows/Blind.md) |
| Parcours Mémoire | [`10_Product_UX/Flows/Memory.md`](10_Product_UX/Flows/Memory.md) |
| Grammaires de dégustation par type de vin | [`10_Product_UX/Tasting_Grammars.md`](10_Product_UX/Tasting_Grammars.md) |
| Intentions UX & rituels | [`10_Product_UX/UX_Workbench.md`](10_Product_UX/UX_Workbench.md) |
| Micro-copy | [`10_Product_UX/Copy/`](10_Product_UX/Copy/) |
| Tokens & règles visuelles | [`20_Design_UI/Design_System_v2.md`](20_Design_UI/Design_System_v2.md) → implémentés dans `web/src/styles/tokens.css` |
| Specs composants | [`20_Design_UI/Component_Kit.md`](20_Design_UI/Component_Kit.md) |
| Architecture, routes, pièges | [`30_Engineering/README.md`](30_Engineering/README.md) |
| Modèle de données & format de sauvegarde | [`30_Engineering/Data_Model.md`](30_Engineering/Data_Model.md) |
| Checklist de test | [`40_QA/README.md`](40_QA/README.md) |
| Mise en ligne & installation iPhone | [`50_Release/README.md`](50_Release/README.md) |
| Décisions structurantes | [`60_Decisions/`](60_Decisions/) |
| Roadmap | [`70_Backlog/Roadmap.md`](70_Backlog/Roadmap.md) |

Règle : **un sujet = une source de vérité**. Les autres fichiers pointent vers elle.

Certains docs UX/Design ont été écrits pour l'app native : un bandeau en tête de fichier indique ce qui y est obsolète. En cas de contradiction, les `Flows/` et le code de `web/` font foi.

---

## Ordre de lecture

1. [`00_Project/Overview.md`](00_Project/Overview.md)
2. [`10_Product_UX/Flows/Blind.md`](10_Product_UX/Flows/Blind.md) + [`Flows/Memory.md`](10_Product_UX/Flows/Memory.md) — les deux parcours (cœur du produit)
3. [`10_Product_UX/Tasting_Grammars.md`](10_Product_UX/Tasting_Grammars.md) — pourquoi le formulaire change selon le type de vin
4. [`20_Design_UI/Design_System_v2.md`](20_Design_UI/Design_System_v2.md)
5. [`30_Engineering/README.md`](30_Engineering/README.md)

---

## État

| Étape | État |
|---|---|
| PWA journal v1 (React/Vite), phases 0–2 | 🗄️ Supprimée (février 2026) |
| App native Expo + OCR, phases 4 → 5.x | 🗄️ Supprimée (novembre 2026) |
| **Webapp v2** — Aveugle + Mémoire, journal, photos, prix, sauvegarde | ✅ |
| Mise en ligne + test sur iPhone | ⏳ Prochain chantier |
