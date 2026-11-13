# 60 — Décisions

Une décision structurante par fichier.

> Règle : toute modification qui change un parcours, un data model, ou une règle UX → ouvrir un fichier ici avant de coder.

## Format

Nom de fichier : `YYYY-MM-DD-titre-court.md`.

```markdown
# YYYY-MM-DD — Titre court

## Contexte
Quelle situation a nécessité une décision ?

## Décision
Qu'est-ce qui a été décidé ?

## Conséquences
- Impact sur le code / l'UX / la data
- Ce qui change, ce qui est supprimé
```

## Décisions actives

| Fichier | Résumé |
|---|---|
| [2026-11-13-pivot-webapp.md](2026-11-13-pivot-webapp.md) | Pivot vers une webapp PWA à données locales ; abandon de l'app native et de l'OCR ✅ |

## Décisions fondatrices UX (février 2026)

Détail → [`_archive/decisions-fevrier-2026.md`](../_archive/decisions-fevrier-2026.md). Elles ont été écrites pour l'app native ; voici ce qu'il en reste dans la webapp :

| Décision | Statut dans la webapp |
|---|---|
| Pas de photo ni d'info réelle avant la dégustation en mode Aveugle | ✅ Toujours en vigueur (règle anti-révélation) |
| Changement de type → réinitialise uniquement robe, arômes, structure | ✅ En vigueur |
| Révélation = carrefour à 3 choix (scan / manuel / inconnu) | ♻️ Adaptée : révéler / bouteille inconnue / revenir aux notes — plus de scan |
| Comparaison en lignes Hypothèse ↔ Réalité, pas de score global | ✅ En vigueur |
| Aides `?` par champ, à la demande | ✅ En vigueur |
| Hypothèses en entonnoir, section avancée dépliable | ✅ En vigueur |
| Mode Mémoire : minimum = un nom OU une photo | ✅ En vigueur (élargi à producteur et appellation) |

## Décisions supprimées

Les décisions liées à l'OCR et au scan (mars → juin 2026) et celle sur les types Clairet/Autre "différés" ont été retirées avec le code natif. Elles restent consultables dans le dépôt privé `MyWine-archive`. Clairet et Autre sont désormais des types normaux, avec une étape Structure en saisie libre.
