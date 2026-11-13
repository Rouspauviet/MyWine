# Component Kit — MyWine

> Les briques d'interface de la webapp : où elles vivent, à quoi elles servent, ce qu'on s'interdit.
> Référence visuelle : [Design_System_v2.md](Design_System_v2.md). Valeurs : `web/src/styles/tokens.css`. Classes : `web/src/styles/app.css`.

Règle commune : un composant ne contient aucune valeur visuelle en dur. Il pose des classes ; les classes lisent les tokens.

---

## Mise en page — `components/Layout.jsx`

| Composant | Rôle | Règles |
|---|---|---|
| `Screen` | Cadre d'un écran : pleine hauteur (`100dvh`), largeur max `--app-max`, centré sur grand écran | Un seul par écran. Jamais de défilement sur `Screen` : c'est `Body` qui défile. |
| `Header` | Position dans l'app + retour. Titre sur une ligne (tronqué), sur-titre optionnel, actions à droite, barre de progression optionnelle | Présent sur tous les écrans sauf les écrans "rituel" (Accueil, Sommeil, Invitation, Révélation). Bouton retour toujours avec `aria-label`. |
| `Body` | Zone de contenu défilante. Variante `centered` pour les écrans rituel | Espacement vertical entre blocs : `--s-5`. |
| `Footer` | Actions de l'écran, collé en bas, tient compte de la barre d'accueil de l'iPhone | Un seul bouton primaire. Variantes `column` (boutons empilés) et `bare` (sans fond, écrans rituel). |
| `Card` | Regroupe des champs ou des lignes d'information sous un titre | Titre en bandeau `--surface-alt`. Pas d'ombre sur une carte de formulaire. Variante `tight` pour les listes `InfoRow`. |
| `InfoRow` | Ligne libellé / valeur d'une fiche | **Ne s'affiche pas si la valeur est vide** : une fiche ne montre que ce qui est renseigné. |
| `ConfirmModal` | Confirmation d'une action destructrice ou surprenante | Titre en question, texte qui dit la conséquence, bouton d'action nommé (jamais "OK"). Variante `danger`. |
| `useAsync` | Charge une donnée depuis la base locale | `data === undefined` = chargement en cours ; `null` = introuvable. |

## Saisie — `components/Inputs.jsx`

| Composant | Rôle | Règles |
|---|---|---|
| `Field` | Libellé + contrôle. Mention "• optionnel", aide `?` à la demande | L'aide explique un concept, jamais un exemple de vin (elle ne doit pas orienter la réponse). `hintOpen` l'affiche d'office au niveau Débutant. |
| `TextField` | Champ texte ou zone de texte avec son libellé | Police ≥ 16 px (`--f-input`) sinon Safari zoome. Placeholder = un exemple ("Ex : …"). |
| `ChipGroup` | Choix parmi des options courtes : un seul ou plusieurs (`multi`) | Retoucher un choix unique le désélectionne. `scroll` pour une longue liste sur une ligne. `dots` ajoute la pastille de type de vin. Pas plus d'une dizaine d'options affichées en grille. |
| `TagInput` | Liste libre avec suggestions (cépages, accords) | Ajout par virgule, Entrée, suggestion, ou en quittant le champ. Jamais de doublon. |
| `SuggestInput` | Champ texte avec suggestions cliquables dessous | La liste reste affichée un instant après la perte de focus, sinon le toucher est perdu sur iPhone. 6 suggestions au plus. |
| `Slider` | Échelle 1 à 5 avec libellés aux extrémités | La valeur courante est rappelée dans le libellé du champ. |
| `RatingStars` | Note de 1 à 5 | Retoucher la note courante l'efface. Libellé en clair à côté (Bof → Parfait). |
| `Switch` | Oui / non (coup de cœur) | Toute la ligne est cliquable. |

## Formulaires partagés — `components/Forms.jsx`, `LevelPicker.jsx`

| Composant | Rôle | Règles |
|---|---|---|
| `BottleForm` | Identité réelle de la bouteille | **Un seul formulaire** pour la Révélation, le mode Mémoire, la modification et l'hôte d'une dégustation à plusieurs. Ajouter un champ ici l'ajoute partout. |
| `ImpressionForm` | Note, coup de cœur, accords, commentaire, occasion, date | Mode Mémoire et modification. En mode Aveugle, ces champs sont saisis à l'étape Style. |
| `PhotoPicker` | Ajout et retrait de photos | Rien n'est écrit en base avant l'enregistrement du formulaire. |
| `LabelReader` | Bouton "Remplir depuis la photo" (assistant IA) | N'apparaît qu'avec une clé et une photo. Ne remplit que les champs vides. Toujours suivi d'un rappel : "vérifie-les, l'assistant peut se tromper". |
| `AppellationInput` | Appellation avec autocomplétion | Choisir une suggestion remplit région et pays **seulement s'ils sont vides**. |
| `LevelPicker` | Choix du niveau de dégustateur | Trois cartes avec une phrase d'explication. Jamais présenté comme une évaluation. |

---

## Motifs visuels

### Boutons

| Classe | Usage |
|---|---|
| `btn btn-primary` | L'action principale de l'écran. Une seule par écran. |
| `btn btn-secondary` | Action alternative de même importance (autres entrées de l'accueil, partage). |
| `btn btn-ghost` | Action de retrait : Annuler, Abandonner. |
| `btn btn-danger` | Confirmation d'une suppression, uniquement dans une fenêtre de confirmation. |
| `link-btn` | Sortie discrète : lien souligné, sans cadre. |
| `icon-btn` | Bouton réduit à une icône. `aria-label` obligatoire. |

À ne pas faire : deux boutons primaires côte à côte ; une ombre sur un bouton ; un libellé vague ("OK", "Valider").

### Écrans rituel

Accueil, Sommeil, Invitation, Révélation : pas d'en-tête, contenu centré (`hero`), une icône sobre, un titre, deux ou trois lignes de texte, un seul bouton primaire. Ce sont les seuls écrans où le texte prime sur les contrôles.

### Carte du journal

Vignette carrée, pastille de type, titre sur une ligne, sous-titre sur une ligne, puis date · prix à gauche, badge "À l'aveugle" et note à droite. Sans photo : une icône neutre, jamais d'emoji.

### Comparaison

Une ligne par champ : hypothèse à gauche, badge au centre, réalité à droite et en gras. Badges `Juste` / `Proche` / `À revoir` : texte **et** couleur. Jamais "Raté", "Faux" ni score chiffré.

### Bandeaux

`banner` (information), `banner warn` (rappel), `banner error` (échec, avec ce qu'il faut faire), `banner success`. Un bandeau dit une chose, en une ou deux phrases.

### États vides

Titre court + une phrase qui dit quoi faire + au plus un bouton. Pas d'illustration.
