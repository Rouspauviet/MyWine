# CLAUDE.md — MyWine

Webapp (PWA) de dégustation de vin — un journal par appareil, données 100% locales, pensée pour iPhone.

Trois usages : **déguster à l'aveugle** en remplissant un formulaire adapté à son niveau, **faire deviner une bouteille à ses invités**, et **garder un souvenir des bouteilles bues** (étiquette, prix, impression).

→ **Lire en premier** : [docs/README.md](docs/README.md) — index complet, sources de vérité, ordre de lecture

| Doc essentiel | Lien |
|---|---|
| Vue d'ensemble projet | [docs/00_Project/Overview.md](docs/00_Project/Overview.md) |
| Parcours Aveugle | [docs/10_Product_UX/Flows/Blind.md](docs/10_Product_UX/Flows/Blind.md) |
| Parcours Mémoire | [docs/10_Product_UX/Flows/Memory.md](docs/10_Product_UX/Flows/Memory.md) |
| Parcours À plusieurs + niveaux | [docs/10_Product_UX/Flows/Group.md](docs/10_Product_UX/Flows/Group.md) |
| Grammaires de dégustation | [docs/10_Product_UX/Tasting_Grammars.md](docs/10_Product_UX/Tasting_Grammars.md) |
| Design System v2 | [docs/20_Design_UI/Design_System_v2.md](docs/20_Design_UI/Design_System_v2.md) |
| Engineering | [docs/30_Engineering/README.md](docs/30_Engineering/README.md) |
| Décisions | [docs/60_Decisions/](docs/60_Decisions/) |
| Assistant IA | [docs/30_Engineering/README.md](docs/30_Engineering/README.md#assistant-ia-optionnel) |

## Règles non négociables

1. **Données locales** — les données restent sur l'appareil (IndexedDB). Pas de compte, pas de serveur. Seule exception, volontaire : l'assistant IA, quand l'utilisateur l'a activé avec sa clé et le déclenche, envoie la photo ou la fiche concernée à Anthropic. La dégustation à plusieurs fait voyager la bouteille dans un lien chiffré, pas par un serveur.
2. **Tokens everywhere** — `web/src/styles/tokens.css` pour toutes les valeurs visuelles, jamais de valeur en dur dans `app.css` ou les composants.
3. **Pas de TypeScript** (fichiers `.jsx`).
4. **Pas de refactor UX sans décision** — créer un fichier dans `docs/60_Decisions/`.
5. **Deux modes = deux intentions** — ne jamais mélanger Aveugle et Mémoire. La dégustation à plusieurs est un mode Aveugle dont la vérité vient de l'hôte.
6. **Anti-objectif révélation** — en mode Aveugle, jamais d'info réelle avant l'étape Révélation. Chez un invité, la bouteille reste chiffrée jusqu'au code.
9. **Pas de score ni de classement** — la comparaison est bienveillante ; le niveau adapte le formulaire, il ne juge pas.
7. **Pas de pipeline OCR maison** — abandonné. La lecture d'étiquette passe par l'assistant IA optionnel (`web/src/utils/ai.js`).
10. **Aucun secret dans le dépôt** — il est public. La clé d'API de l'utilisateur vit dans le navigateur de son appareil, jamais dans un fichier, un test ou un commit. Elle n'en sort que s'il la prête lui-même à un ami, chiffrée dans un lien (jamais dans une invitation de dégustation).
11. **L'app fonctionne entièrement sans clé d'API** — l'assistant IA n'ajoute que du confort.
12. **Tendances, pas vérités** — ce que disent la base de connaissances et l'assistant est présenté comme typique ; un écart n'est jamais une faute.
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
| Webapp v2 — parcours Aveugle + Mémoire, journal, photos, prix, sauvegarde | ✅ En ligne : https://rouspauviet.github.io/MyWine/ |
| Niveaux (Débutant / Amateur / Expert) + dégustation à plusieurs sans serveur | ✅ À valider en conditions réelles |
| Fiche "Pour comprendre", leurres plausibles, indices, mot de l'hôte | ✅ |
| Partage de l'assistant avec un ami (lien chiffré + code de 8 lettres) | ✅ À valider entre deux iPhone |
| Assistant IA optionnel (lecture d'étiquette, profil attendu) | ✅ Testé contre la vraie API sur une étiquette simple ; étiquettes difficiles à valider |
| Test sur iPhone à plusieurs (QR code, code de révélation, partage) | ⏳ **Prochain chantier** |
| Statistiques, mode sombre | Backlog — voir [Roadmap](docs/70_Backlog/Roadmap.md) |

L'ancien code (`mobile/`, pipeline OCR) et tout l'historique d'avant le pivot sont conservés dans le dépôt privé `MyWine-archive`. Ce dépôt-ci repart d'un historique vierge.

## How we work

**Priorités** : P0 = bloquant · P1 = important · P2 = amélioration.

**Décision structurante** : créer `docs/60_Decisions/YYYY-MM-DD-titre-court.md` avec `## Contexte / ## Décision / ## Conséquences`.

**Commit** : jamais en auto — demander confirmation.
**Langue** : Français pour les échanges et les commentaires de code.
