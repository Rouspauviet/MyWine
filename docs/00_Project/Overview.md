# MyWine — Vue d'ensemble

*À lire quand : tu arrives sur le projet pour la première fois.*
*Ce document fait autorité pour : la vision produit et l'architecture haut niveau.*

---

## Ce qu'est MyWine

Une **webapp installable (PWA)** de dégustation de vin, **mono-utilisateur**, pensée pour l'iPhone.

Pas de compte, pas de serveur : toutes les données (fiches et photos) restent dans le navigateur de l'appareil. La sauvegarde se fait par export d'un fichier.

Deux objectifs :

1. **Remplir un formulaire pendant une dégustation à l'aveugle**, puis comparer ses hypothèses à la réalité.
2. **Garder un souvenir des bouteilles bues** : étiquette en photo, prix, lieu d'achat, note, occasion.

---

## Les deux modes utilisateur

C'est le cœur du produit. Deux intentions différentes, deux parcours différents, un seul journal.

### Mode Aveugle

> "Je veux déguster sans savoir ce que je bois, puis découvrir si j'ai deviné juste."

```
Accueil → Sommeil (rituel) → Type de vin → Wizard 4 étapes → Révélation → Comparaison → Fiche
```

Contrainte clé : **aucune info réelle (étiquette, nom) n'est affichée ni demandée avant la Révélation.**

Le formulaire change selon le type de vin supposé : c'est le principe des [grammaires de dégustation](../10_Product_UX/Tasting_Grammars.md).

### Mode Mémoire

> "Je viens de boire ce vin, je veux m'en souvenir rapidement."

```
Accueil → Fiche rapide (photo, identité, prix, impression) → Journal
```

---

## Vocabulaire clé

| Terme | Définition |
|---|---|
| **Fiche** (`record`) | Une bouteille au journal, issue du mode Aveugle ou Mémoire |
| **Brouillon** | Dégustation à l'aveugle en cours (`status: 'draft'`), reprenable depuis l'accueil |
| **Réalité** | Les vraies informations de la bouteille, saisies à la Révélation ou en Mémoire |
| **Hypothèses** | Ce que l'utilisateur a deviné à l'aveugle (cépages, pays, région, millésime…) |
| **Cuvée** | Nom du vin (ex : "La Bergerie des Centenaires") |
| **Producteur** | Domaine, château ou cave |
| **Vignerons** | Personnes physiques derrière le vin — champ optionnel |

---

## Architecture en 5 minutes

```
Navigateur (iPhone Safari, app ajoutée à l'écran d'accueil)
  │
  ├── React 19 + Vite          → UI en .jsx, pas de TypeScript
  ├── React Router (HashRouter) → navigation, compatible tout hébergement statique
  ├── IndexedDB (via idb)       → persistance locale
  │     ├── records             → fiches + brouillons
  │     └── photos              → photos compressées (1600 px, JPEG)
  └── Service worker            → app utilisable hors ligne après la première visite
```

Aucun backend. L'hébergement ne sert que des fichiers statiques.

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `web/src/App.jsx` | Routes |
| `web/src/screens/Tasting.jsx` | Wizard de dégustation à l'aveugle |
| `web/src/components/Forms.jsx` | Formulaire bouteille + impression (partagé Révélation / Mémoire / modification) |
| `web/src/db/db.js` | Modèle de données et accès IndexedDB |
| `web/src/data/wineData.js` | Vocabulaire de dégustation par type de vin |
| `web/src/utils/comparison.js` | Comparaison hypothèses ↔ réalité + indices |
| `web/src/utils/backup.js` | Export / import complet |
| `web/src/styles/tokens.css` | Source de vérité visuelle |

---

## Principes non négociables

1. **Données locales** — rien ne quitte l'appareil.
2. **Deux modes = deux intentions** — ne jamais mélanger Aveugle et Mémoire.
3. **Anti-révélation** — en mode Aveugle, aucune info réelle avant l'écran Révélation.
4. **Tokens everywhere** — toutes les valeurs visuelles viennent de `tokens.css`.
5. **Une vérité par sujet** — un doc fait autorité, les autres pointent vers lui.
6. **Décision structurante → `docs/60_Decisions/`**.

---

## Pour aller plus loin

1. [Parcours Aveugle](../10_Product_UX/Flows/Blind.md)
2. [Parcours Mémoire](../10_Product_UX/Flows/Memory.md)
3. [Modèle de données](../30_Engineering/Data_Model.md)
4. [Architecture & pièges](../30_Engineering/README.md)
5. [Mise en ligne](../50_Release/README.md)
