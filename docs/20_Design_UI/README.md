# 20 — Design / UI

Tokens visuels et composants.

| Document | Contenu |
|---|---|
| [Design_System_v2.md](Design_System_v2.md) | ← **Référence active** · Philosophie visuelle, tokens, règles composants |
| [Component_Kit.md](Component_Kit.md) | Specs par composant (objectif, composition, tokens, états, Do/Don't) |

**Design System v1** (historique, ne pas modifier) : [`_archive/Design_System_MyWine_v1.md`](../_archive/Design_System_MyWine_v1.md)

## Implémentation web

| Doc | Code |
|---|---|
| Tokens (couleurs, espacements, rayons, typo, ombres) | `web/src/styles/tokens.css` — variables CSS `--bg`, `--primary`, `--s-4`, `--r-lg`, `--f-base`… |
| Composants | `web/src/components/` + classes de `web/src/styles/app.css` |

> Toute modification des tokens passe d'abord par `Design_System_v2.md`, puis par `tokens.css`. Aucune couleur, taille ou espacement en dur dans `app.css` ni dans les `.jsx`.

Ajouts propres à la version web : `--f-input` (16 px, évite le zoom iOS sur les champs), `--wine-orange` / `--wine-clairet` / `--wine-autre` (pastilles de type), `--miss-subtle`, `--backdrop` (fond hors app sur grand écran), `--app-max`, `--tap`, `--thumb`, `--photo`.
