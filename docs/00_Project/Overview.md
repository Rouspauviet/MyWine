# MyWine — Vue d'ensemble

*À lire quand : tu arrives sur le projet pour la première fois.*
*Ce document fait autorité pour : la vision produit et l'architecture haut niveau.*

---

## Ce qu'est MyWine

Une **webapp installable (PWA)** de dégustation de vin, **un journal par appareil**, pensée pour l'iPhone.

Pas de compte, pas de serveur : toutes les données (fiches et photos) restent dans le navigateur de l'appareil. La sauvegarde se fait par export d'un fichier.

Deux objectifs :

1. **Remplir un formulaire pendant une dégustation à l'aveugle**, puis comparer ses hypothèses à la réalité.
2. **Garder un souvenir des bouteilles bues** : étiquette en photo, prix, lieu d'achat, note, occasion.
3. **Faire deviner une bouteille à ses invités**, chacun sur son téléphone et à son niveau.

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

### Dégustation à plusieurs

> "J'ai acheté cette bouteille, je veux la faire deviner à mes invités."

```
Hôte   : Accueil → bouteille → QR code d'invitation → code de révélation
Invité : lien → niveau → wizard → code → comparaison → fiche
```

C'est un mode Aveugle dont la vérité vient de l'hôte. Aucun serveur : la bouteille voyage chiffrée dans le lien, et le code de révélation la déchiffre. Détail → [Group.md](../10_Product_UX/Flows/Group.md).

### Comprendre, pas seulement comparer

Après la révélation, une fiche "Pour comprendre" donne le profil typique du cépage et de la région et le rapproche de ce qui a été perçu. Elle s'appuie sur une base de connaissances intégrée, sans réseau.

### Assistant IA (optionnel)

Avec sa propre clé d'API Claude, l'utilisateur peut remplir une fiche depuis la photo de l'étiquette, et l'hôte peut joindre à son invitation un court texte sur ce qu'on attend du vin. Sans clé, l'app fonctionne entièrement.

### Niveaux

Débutant, Amateur, Confirmé, Expert : chaque dégustateur choisit le sien. Le niveau règle le degré d'aide (le Débutant est guidé pas à pas à partir de ce qu'il a noté, l'Expert n'a aucune aide), jamais un jugement.

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
| **Invitation** | Lien (ou QR code) produit par l'hôte : bouteille chiffrée + propositions de choix multiples |
| **Code de révélation** | 4 lettres annoncées par l'hôte ; déchiffre la bouteille chez les invités |
| **Niveau** | Débutant / Amateur / Confirmé / Expert — règle le degré d'aide à l'aveugle |
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
| `web/src/utils/session.js` | Dégustation à plusieurs : chiffrement de l'invitation, choix multiples |
| `web/src/data/levels.js` | Niveaux, cépages courants par couleur |
| `web/src/data/wineKnowledge.js` | Profils typiques des cépages, repères par région et pays |
| `web/src/utils/pedagogy.js` | Fiche "Pour comprendre" |
| `web/src/utils/ai.js` | Assistant IA optionnel (clé locale, lecture d'étiquette, profil attendu) |
| `web/src/styles/tokens.css` | Source de vérité visuelle |

---

## Principes non négociables

1. **Données locales** — rien ne passe par un serveur. À plusieurs, la bouteille voyage dans un lien chiffré que l'hôte partage lui-même. Seul l'assistant IA, s'il est activé et déclenché, envoie une photo ou une fiche à Anthropic.
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
