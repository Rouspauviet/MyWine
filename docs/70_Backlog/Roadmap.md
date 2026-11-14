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

## Niveaux et dégustation à plusieurs — livré, à valider ✅

- Quatre niveaux (Débutant / Amateur / Confirmé / Expert), en solo comme à plusieurs
- Raisonnement embarqué : le Débutant est guidé à partir de ses notes, l'Amateur peut demander de l'aide
- Hôte : bouteille → QR code et lien d'invitation → code de révélation
- Invité : lien → niveau → dégustation → code → comparaison → partage du résultat
- Sans serveur : bouteille chiffrée dans le lien

## Pédagogie et assistant IA — livré ✅

- Fiche "Pour comprendre" (base de connaissances intégrée), leurres plausibles, indices à la demande, mot de l'hôte
- Partage de l'assistant avec un ami (lien chiffré + code), sans serveur
- Assistant IA optionnel avec la clé de l'utilisateur : lecture d'étiquette automatique, préparation de la dégustation (pistes d'attention par niveau, indices, leurres, profil attendu)

## Prochain chantier — validation en conditions réelles ⏳

| Priorité | Tâche |
|---|---|
| ✅ | Mise en ligne sur GitHub Pages : https://rouspauviet.github.io/MyWine/ |
| P0 | Tester l'assistant IA sur des étiquettes difficiles (courbes, reflets, recto/verso) depuis l'iPhone ; confirmer le modèle par défaut |
| P0 | Une vraie dégustation à plusieurs : scan du QR code, lisibilité, compréhension par des débutants |
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
| P1 | Étendre la base de connaissances | Cépages et régions hors de France, vins doux et mutés |
| P2 | Commentaire personnalisé par invité | Demande une clé chez chaque invité ou un serveur relais |
| P1 | Session en direct | Salle d'attente, révélation simultanée, vue de groupe (consensus de la table). Demande un serveur |
| P2 | Transmettre la photo de l'hôte aux invités | Impossible dans un lien ; viendrait avec le serveur |
