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

**Non vérifié** : tout ce qui dépend d'un vrai iPhone (appareil photo, installation, zones sûres, clavier, feuille de partage à l'export) et le mode hors ligne.
