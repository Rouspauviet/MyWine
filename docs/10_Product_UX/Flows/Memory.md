# Parcours Mémoire

*Source de vérité du parcours "Mémoriser un vin". Implémentation : `web/src/screens/RecordEdit.jsx` + `web/src/components/Forms.jsx`.*

> Intention : "Je viens de boire ce vin, je veux m'en souvenir rapidement."

```
Accueil → /memory/new → /entry/:id (fiche) → Journal
```

Pas de rituel, pas d'hypothèses, pas de comparaison. Un seul écran de saisie.

---

## 1. Accueil `/`

Bouton "Mémoriser un vin" → `/memory/new`. Aucune fiche n'est créée en base avant l'enregistrement.

## 2. Fiche rapide `/memory/new`

**Carte "La bouteille"**

| Champ | Détail |
|---|---|
| Photos | Une ou plusieurs. Sur iPhone : appareil photo ou photothèque. Compressées à 1600 px. Avec une clé d'API : bouton "Remplir depuis la photo", qui ne remplit que les champs encore vides. |
| Type | Rouge · Blanc · Rosé · Pétillant · Orange · Clairet · Autre |
| Cuvée / Nom du vin | |
| Producteur / Domaine | |
| Appellation | Autocomplétion sur 299 appellations françaises ; choisir une suggestion remplit région et pays s'ils sont vides |
| Région · Pays | Suggestions |
| Millésime · Alcool | |
| Cépage(s) | Étiquettes avec autocomplétion |
| Prix (€) · Lieu d'achat | |
| Vignerons | Optionnel |

**Carte "Mon impression"**

Note (1–5 étoiles) · coup de cœur · accords mets · commentaire · occasion · date (aujourd'hui par défaut, modifiable pour noter un vin bu plus tôt).

**Validation minimale** : au moins un nom, un producteur, une appellation **ou une photo**. Une simple photo d'étiquette suffit pour enregistrer un souvenir.

"Ajouter au journal" → fiche créée (`mode: 'memory'`, `status: 'done'`) → fiche complète.

## 3. Journal `/journal`

Commun aux deux modes.

- Carte par vin : vignette, pastille de type, titre, producteur · appellation · millésime, date, prix, badge "À l'aveugle", note, cœur.
- Recherche plein texte (nom, producteur, appellation, région, pays, cépages, millésime, lieu d'achat, occasion, commentaire).
- Filtres : À l'aveugle · Mémoire · Coups de cœur.
- Tri : date de dégustation décroissante.

## 4. Fiche `/entry/:id`

Photos (touche pour agrandir), carte bouteille, carte impression, et la fiche "Pour comprendre" si le cépage ou la région sont connus de la base. Actions : **modifier** (même formulaire) et **supprimer** (avec confirmation, photos comprises).
