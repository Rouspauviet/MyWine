# 40 — QA

Checklist de test manuelle. Pas de tests automatisés pour l'instant.

## Avant de tester

- En local : `cd web && npm run dev`, puis ouvrir `http://localhost:5173` en vue mobile (outils de développement → mode appareil).
- Sur iPhone : voir [50_Release](../50_Release/README.md).

## Checklist de régression

### Parcours Aveugle

- [ ] Accueil → "Dégustation à l'aveugle" → Sommeil → "Commencer" ouvre le choix du type
- [ ] "Continuer" désactivé tant qu'aucun type n'est choisi
- [ ] Pour chaque type (Rouge, Blanc, Rosé, Pétillant, Orange) : les étapes Perception et Structure affichent le bon vocabulaire
- [ ] Clairet / Autre : étape Structure en saisie libre
- [ ] Champs conditionnels : "Texture des tanins" n'apparaît que si tanins ≠ quasi absents ; "Type de minéralité" que si minéralité ≠ absente
- [ ] Aide `?` : s'ouvre et se referme
- [ ] Cépages : autocomplétion, ajout par virgule, par Entrée et en quittant le champ, suppression d'une étiquette
- [ ] Changer de type après saisie → confirmation → robe, arômes et structure effacés, hypothèses conservées
- [ ] **Anti-révélation** : aucun champ réel (nom, photo, prix) avant l'écran Révélation
- [ ] Fermer l'onglet à l'étape 3, rouvrir → carte "Reprendre" sur l'accueil → retour à l'étape 3 avec les données
- [ ] "Abandonner" → confirmation → brouillon supprimé, plus de carte "Reprendre"
- [ ] Révélation : choisir une appellation suggérée remplit région et pays
- [ ] Révélation → "Comparer et enregistrer" → résumé, badges Juste / Proche / À revoir cohérents
- [ ] Millésime à ± 2 ans → "Proche"
- [ ] Au moins un indice dans "À retenir" (ex : rouge, tanins marqués + corps ample)
- [ ] "Je ne connais pas la bouteille" → fiche enregistrée, "Comparaison impossible"

### Niveaux

- [ ] Sommeil : trois niveaux, le dernier choisi est présélectionné la fois suivante
- [ ] Débutant : Structure réduite à 2–3 champs avec aides ouvertes ; Hypothèses en choix à cocher ; Style réduit
- [ ] Débutant en solo : cépages courants du type supposé, liste des pays, 4 tranches d'âge
- [ ] Expert : appellation, millésime, producteur, climat, sol visibles sans déplier
- [ ] Tranche d'âge contenant le vrai millésime → "Juste" ; à 2 ans près → "Proche"

### Dégustation à plusieurs (site en HTTPS, idéalement deux téléphones)

- [ ] Hôte : prénom obligatoire, puis au moins nom / producteur / appellation
- [ ] Invitation : QR code affiché, code de révélation masqué par défaut
- [ ] Le QR code se scanne avec l'appareil photo d'un autre téléphone, à distance de table
- [ ] "Partager le lien" ouvre la feuille de partage
- [ ] Invité : "{Hôte} t'invite…", choix du niveau, wizard avec "Organisée par {Hôte}"
- [ ] Invité Débutant : la bonne réponse figure parmi les 4 cépages et les 4 régions (ou pays)
- [ ] **Anti-révélation** : aucune info de la bouteille visible chez l'invité avant le code
- [ ] Code faux → message, nouvel essai possible ; minuscules acceptées
- [ ] Code juste → comparaison, fiche au journal de l'invité avec prix et appellation
- [ ] "Partager mon résultat" → texte lisible dans une messagerie
- [ ] Rouvrir le lien d'invitation → reprise de la dégustation, pas de doublon
- [ ] Fiche de l'hôte → "Rouvrir l'invitation et le code"
- [ ] Adresse de test en Wi-Fi (HTTP) → message expliquant qu'il faut la version en ligne

### Pour comprendre, indices, mot de l'hôte

- [ ] Rouge, Syrah, tanins marqués et corps ample saisis → "c'est typique du cépage Syrah"
- [ ] Perception opposée au profil → explication sans jugement ; perception voisine → rien
- [ ] Cépage absent de la base → pas de ligne sur le cépage, pas d'erreur
- [ ] Fiche Mémoire avec un cépage connu → texte sur le cépage, sans rapprochement
- [ ] Invité : "Demander un indice" → climat, puis style, puis dernier indice selon le niveau
- [ ] Débutant, dernier indice → deux cépages disparaissent des propositions, jamais le bon
- [ ] Le nombre d'indices apparaît dans le résumé, la fiche et le texte partagé
- [ ] Mot de l'hôte : absent du lien en clair, affiché à la révélation chez l'invité
- [ ] Leurres : pour une Syrah, les propositions contiennent Grenache, Mourvèdre ou Malbec

### Assistant IA (avec une clé d'API créditée)

- [ ] Sans clé : aucun bouton "Remplir depuis la photo", aucune carte IA chez l'hôte
- [ ] Paramètres : coller la clé → "Clé enregistrée (se termine par …XXXX)", jamais affichée en entier
- [ ] Ajouter une photo → "Lecture de l'étiquette en cours…" puis champs remplis, sans rien toucher ; **un champ déjà saisi n'est pas écrasé**
- [ ] Sans clé, avec une photo → ligne "Astuce : avec une clé d'API Claude…"
- [ ] Modifier une fiche existante : ses photos ne déclenchent pas de nouvelle lecture
- [ ] Hôte avec assistant : chez un invité Débutant, bandeau de piste d'attention aux étapes 1 et 2, indices rédigés pour la bouteille
- [ ] **Anti-révélation** : ni la piste ni les indices ne nomment le cépage, la région, le producteur ou le millésime
- [ ] Étiquette courbe, puis face + contre-étiquette
- [ ] Hôte : "Ajouter ce qu'on attend de ce vin" → texte visible chez l'invité après le code
- [ ] Mode avion → message "Pas de connexion", le reste du formulaire reste utilisable
- [ ] Clé fausse → "La clé d'API est refusée"
- [ ] "Retirer la clé" → les boutons IA disparaissent
- [ ] La sauvegarde exportée ne contient pas la clé

### Parcours Mémoire

- [ ] Accueil → "Mémoriser un vin" → enregistrer à vide → message de validation
- [ ] Une photo seule suffit pour enregistrer
- [ ] Prix avec virgule (`32,5`) → affiché `32,50 €` sur la fiche et dans le journal
- [ ] Date modifiable → le journal est trié en conséquence

### Photos

- [ ] iPhone : le bouton propose appareil photo et photothèque
- [ ] Plusieurs photos, suppression d'une photo avant enregistrement
- [ ] Vignette dans le journal, galerie sur la fiche, agrandissement au toucher
- [ ] Photo d'iPhone en portrait : orientation correcte

### Journal et fiche

- [ ] Recherche (sans accents : `rhone` trouve `Rhône`)
- [ ] Filtres À l'aveugle / Mémoire / Coups de cœur
- [ ] Modifier une fiche à l'aveugle : corriger la réalité recalcule la comparaison ; les hypothèses ne sont pas modifiables
- [ ] Supprimer une fiche → disparaît du journal, compteur de photos des paramètres mis à jour

### Sauvegarde

- [ ] Exporter → fichier `mywine-sauvegarde-AAAA-MM-JJ.json`
- [ ] Effacer toutes les données → journal vide
- [ ] Importer le fichier → fiches **et photos** restaurées
- [ ] Importer un fichier quelconque → message d'erreur clair

### Installation et hors ligne (site en HTTPS uniquement)

- [ ] Safari → Partager → Sur l'écran d'accueil → l'app s'ouvre sans barre d'adresse
- [ ] Encoche et barre d'accueil : rien n'est masqué, les boutons du bas restent accessibles
- [ ] Mode avion après une première visite → l'app s'ouvre et fonctionne
- [ ] Aucun zoom automatique en touchant un champ
- [ ] Clavier ouvert : le champ en cours de saisie reste visible

## Vérifié le 2026-11-13 (navigateur de bureau, viewport 375×812)

Parcours Aveugle complet (rouge), autocomplétion cépages et appellation, photo compressée, comparaison et indices, modification de fiche avec recalcul, parcours Mémoire et validation, journal avec filtres et vignette, aller-retour export → effacement → import, reprise de brouillon.

Même jour, après ajout des niveaux et de la dégustation à plusieurs : création d'une invitation (validations, QR code, code masqué, bouteille absente du lien en clair), invité Débutant de bout en bout (choix multiples, mauvais code refusé, bon code, comparaison, texte de partage, réouverture du lien sans doublon), niveau Expert.

Même jour, après ajout de la pédagogie et de l'assistant : leurres plausibles, indices (climat, style, deux cépages écartés), mot de l'hôte chiffré et révélé, fiche "Pour comprendre" (confirmation, écart, cépage inconnu, fiche Mémoire). Assistant IA testé **avec un faux serveur** (`window.fetch` remplacé) : enregistrement de la clé, lecture d'étiquette sans écraser un champ saisi, profil attendu joint à l'invitation et affiché chez l'invité.

**Assistant IA, essai réel du 2026-11-13** sur une photo d'étiquette plate et nette (Cour-Cheverny, réduite à 1600 px, une seule photo) :

| Modèle | Lecture | Coût mesuré (lecture + profil attendu) |
|---|---|---|
| Sonnet 5.5 | Tous les champs lisibles justes ; cépage Romorantin déduit de l'appellation | environ 1 centime (3 334 + 530 tokens en entrée, 102 + 145 en sortie) |
| Haiku 5.5 | Tous les champs lisibles justes ; cépage laissé vide | moins de 0,1 centime |

Une photo de cette taille compte environ 3 300 tokens. Même jour, préparation d'une dégustation (`prepareTasting`, Sonnet 5.5) sur un champagne et un malbec argentin : pistes, indices, leurres et profil pertinents, sans fuite ; environ 0,6 centime par invitation (≈ 1 350 tokens en entrée, 350 en sortie). Contre-étiquette de champagne lue sans erreur (4 960 tokens en entrée).

**Reste à valider** : étiquettes courbes, reflets, face + contre-étiquette, étiquettes étrangères, et l'appel depuis le navigateur d'un vrai iPhone (l'essai a été fait hors navigateur).

**Non vérifié** : le scan réel du QR code entre deux téléphones, la feuille de partage, et tout ce qui dépend d'un vrai iPhone (appareil photo, installation, zones sûres, clavier, feuille de partage à l'export) et le mode hors ligne.
