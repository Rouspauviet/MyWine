# CLAUDE.md — MyWine

Webapp (PWA) de dégustation de vin — mono-utilisateur, données 100% locales, pensée pour iPhone.

Deux objectifs : **remplir un formulaire pendant une dégustation à l'aveugle** et **garder un souvenir des bouteilles bues** (étiquette, prix, impression).

→ **Lire en premier** : [docs/README.md](docs/README.md) — index complet, sources de vérité, ordre de lecture

| Doc essentiel | Lien |
|---|---|
| Vue d'ensemble projet | [docs/00_Project/Overview.md](docs/00_Project/Overview.md) |
| Parcours Aveugle | [docs/10_Product_UX/Flows/Blind.md](docs/10_Product_UX/Flows/Blind.md) |
| Parcours Mémoire | [docs/10_Product_UX/Flows/Memory.md](docs/10_Product_UX/Flows/Memory.md) |
| Grammaires de dégustation | [docs/10_Product_UX/Tasting_Grammars.md](docs/10_Product_UX/Tasting_Grammars.md) |
| Design System v2 | [docs/20_Design_UI/Design_System_v2.md](docs/20_Design_UI/Design_System_v2.md) |
| Engineering | [docs/30_Engineering/README.md](docs/30_Engineering/README.md) |
| Décisions | [docs/60_Decisions/](docs/60_Decisions/) |

## Règles non négociables

1. **Données locales** — aucune donnée utilisateur ne quitte l'appareil (IndexedDB). Pas de compte, pas de serveur, pas d'appel réseau applicatif. Le réseau ne sert qu'à charger l'app.
2. **Tokens everywhere** — `web/src/styles/tokens.css` pour toutes les valeurs visuelles, jamais de valeur en dur dans `app.css` ou les composants.
3. **Pas de TypeScript** (fichiers `.jsx`).
4. **Pas de refactor UX sans décision** — créer un fichier dans `docs/60_Decisions/`.
5. **Deux modes = deux intentions** — ne jamais mélanger Aveugle et Mémoire.
6. **Anti-objectif révélation** — en mode Aveugle, jamais d'info réelle avant l'étape Révélation.
7. **Pas d'OCR** — abandonné (décision `2026-11-13`). Ne pas le réintroduire sans nouvelle décision.
8. **Toute évolution du modèle de données reste compatible** avec les fiches et les sauvegardes existantes (valeurs par défaut à la lecture).

## Rôle attendu (IA)

- Raisonner en termes d'**intention utilisateur** avant d'écrans.
- Poser des questions si une décision UX a un **impact structurel**.
- Respecter le Design System v2.
- Tester dans le navigateur (viewport mobile) avant de dire que c'est fini.

## Commandes

```bash
cd web
npm install
npm run dev      # http://localhost:5173 (accessible aussi depuis le téléphone sur le même Wi-Fi)
npm run build    # génère web/dist
```

## État actuel (2026-11-13)

| Étape | État |
|---|---|
| App native Expo + OCR (phases 4 → 5.x) | 🗄️ Abandonnée et supprimée — décision [`2026-11-13`](docs/60_Decisions/2026-11-13-pivot-webapp.md) |
| Webapp v2 — parcours Aveugle + Mémoire, journal, photos, prix, sauvegarde | ✅ |
| Mise en ligne (hébergement HTTPS) + test sur iPhone | ⏳ **Prochain chantier** |
| Statistiques, mode sombre | Backlog — voir [Roadmap](docs/70_Backlog/Roadmap.md) |

L'ancien code (`mobile/`, pipeline OCR) et tout l'historique d'avant le pivot sont conservés dans le dépôt privé `MyWine-archive`. Ce dépôt-ci repart d'un historique vierge.

## How we work

**Priorités** : P0 = bloquant · P1 = important · P2 = amélioration.

**Décision structurante** : créer `docs/60_Decisions/YYYY-MM-DD-titre-court.md` avec `## Contexte / ## Décision / ## Conséquences`.

**Commit** : jamais en auto — demander confirmation.
**Langue** : Français pour les échanges et les commentaires de code.
