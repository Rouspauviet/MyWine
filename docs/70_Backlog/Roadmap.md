# Roadmap — MyWine

*Mise à jour : 2026-11-13*

## Historique

| Période | Étape | État |
|---|---|---|
| Février 2026 | Phases 0–2 — PWA journal (React/Vite) | 🗄️ Supprimée |
| Février → juin 2026 | Phases 4 → 5.x — app native Expo, modes Aveugle et Mémoire, OCR ML Kit | 🗄️ Supprimée ([décision 2026-11-13](../60_Decisions/2026-11-13-pivot-webapp.md)) |
| Novembre 2026 | **Webapp v2.0** — réécriture PWA | ✅ |

## Webapp v2.0 — livré ✅

- Parcours Aveugle : rituel, type de vin, wizard 4 étapes avec grammaires par type, révélation, comparaison, indices
- Parcours Mémoire : fiche rapide
- Fiche bouteille : photos, type, prix, lieu d'achat, occasion, date
- Fiche modifiable, comparaison recalculée
- Reprise d'une dégustation interrompue
- Journal : recherche, filtres, vignettes
- Sauvegarde complète (fiches + photos) : export, import, rappel
- PWA : installable, utilisable hors ligne

## Prochain chantier — mise en ligne ⏳

| Priorité | Tâche |
|---|---|
| P0 | Choisir l'hébergement et publier (voir [50_Release](../50_Release/README.md)) |
| P0 | Dérouler la [checklist QA](../40_QA/README.md) sur un vrai iPhone : appareil photo, installation, zones sûres, clavier, export, hors ligne |
| P1 | Corriger ce que le test iPhone révèle |

## Backlog

| Priorité | Idée | Note |
|---|---|---|
| P1 | Statistiques | Taux juste/proche par champ, cépages et régions les plus goûtés, dépense moyenne, progression dans le temps |
| P1 | Filtres journal avancés | Type, région, note minimale, fourchette de prix, tri |
| P2 | Mode sombre | Doubler les tokens dans `tokens.css` (`prefers-color-scheme`) |
| P2 | Grammaire dédiée Clairet / vins doux / mutés | Aujourd'hui en saisie libre |
| P2 | Appellations étrangères | Le référentiel ne couvre que la France |
| P2 | Session multi-bouteilles | Plusieurs vins à l'aveugle dans une même soirée, révélation groupée |
| P2 | Export lisible | CSV ou PDF d'une fiche |
| P2 | Synchronisation entre appareils | Nécessite une nouvelle décision (remet en cause "données locales") |
| P2 | Lecture d'étiquette (OCR) | Abandonné ; à reprendre uniquement avec une nouvelle décision |
