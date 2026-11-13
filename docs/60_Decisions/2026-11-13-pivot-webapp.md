# 2026-11-13 — Pivot vers une webapp (PWA), abandon de l'app native et de l'OCR

## Contexte

- Plus de Mac disponible : impossible de builder l'app Expo sur iPhone.
- Audit du 2026-11-13 : la valeur du projet est dans les parcours (grammaires de dégustation par type de vin, wizard, comparaison hypothèses ↔ réalité, Design System v2), pas dans l'OCR, qui représente pourtant près de la moitié du code et la majorité de la doc.
- Objectifs reformulés : (1) remplir le formulaire pendant une dégustation à l'aveugle, (2) garder un souvenir des bouteilles bues (étiquette, prix, …).

## Décision

1. **Plateforme** : PWA Vite + React (fichiers `.jsx`, pas de TypeScript), dans `web/`, conçue pour iPhone Safari et installée sur l'écran d'accueil.
2. **Données** : locales uniquement (IndexedDB, photos compressées incluses). Pas de compte, pas de serveur. Sauvegarde par export/import d'un fichier complet (fiches + photos).
3. **Deux entrées conservées** : « Dégustation à l'aveugle » (wizard complet → révélation → comparaison) et « Mémoriser un vin » (fiche rapide). Un seul journal.
4. **OCR abandonné**. La photo d'étiquette est un simple souvenir attaché à la fiche. Un éventuel retour de l'OCR fera l'objet d'une nouvelle décision.
5. **Code mobile supprimé** : `mobile/` et la doc OCR/native sont retirés du repo (conservés dans le dépôt privé `MyWine-archive` ; ce dépôt repart d'un historique vierge).
6. **Repris de l'existant** : `wineData.js`, `comparison.js`, `grapeVarieties.js`, `appellationsFR.json` (autocomplétion appellation → région/pays), tokens du Design System v2, micro-copy, structure du wizard.
7. **Clairet et Autre** deviennent des types normaux (plus de mention « bientôt ») : étape Structure en saisie libre. Remplace la décision `autre-clairet-deferred-post-phase5`.

## Conséquences

- Règle « offline-first » reformulée : aucune donnée utilisateur ne quitte l'appareil ; le réseau ne sert qu'à charger l'app (ensuite mise en cache par le service worker).
- Règle « OCR gelé » et Phase 6 (EAS, TestFlight) caduques ; `CLAUDE.md`, `docs/README.md`, Overview et Roadmap réécrits le même jour.
- Remplace de fait les décisions `2026-03-01-*` (scan, wizard post-scan, OCR), `2026-03-03-archivage-live-scan` et `2026-06-15-retrait-apple-vision`.
- Corrections à intégrer dès la réécriture (défauts relevés par l'audit) : champs prix / lieu d'achat / occasion, fiche modifiable, insights branchés sur la structure v2, reprise d'un brouillon interrompu, export réellement complet, photo possible à la révélation.
- Contrainte iPhone : l'app doit être installée sur l'écran d'accueil pour que Safari ne purge pas le stockage ; rappel d'export régulier à prévoir.
- Hébergement statique HTTPS nécessaire (à choisir : GitHub Pages, Netlify, …).
