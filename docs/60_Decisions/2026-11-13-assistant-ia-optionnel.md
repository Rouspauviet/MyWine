# 2026-11-13 — Accompagnement pédagogique et assistant IA optionnel

## Contexte

- Saisir une bouteille à la main prend du temps ; une étiquette en dit déjà beaucoup.
- Après la révélation, l'invité voyait s'il avait juste, pas **pourquoi** : rien ne reliait ce qu'il avait perçu à ce qu'il avait bu.
- Une clé d'API ne peut pas vivre dans le code d'une webapp publique, et on ne veut pas de serveur à maintenir.
- Budget visé : moins de 10 centimes par soirée.

## Décision

**Partie sans IA, pour tout le monde :**

1. **Fiche "Pour comprendre"** après la révélation : profil typique du cépage et de la région, tiré d'une base de connaissances intégrée (`web/src/data/wineKnowledge.js`), rapproché de la structure et des arômes perçus.
2. **Leurres plausibles** dans les choix multiples : cépages qu'on confond vraiment, régions ou pays voisins.
3. **Indices à la demande** pendant une dégustation à plusieurs, du plus vague au plus précis ; leur nombre figure dans le résultat.
4. **Mot de l'hôte**, chiffré avec la bouteille et révélé avec elle.

**Assistant IA, optionnel :**

5. L'utilisateur colle **sa propre clé d'API Claude** dans les paramètres. Elle est stockée dans le navigateur de son appareil, jamais dans le code ni dans la sauvegarde, et n'est envoyée qu'à `api.anthropic.com`.
6. Deux usages : **remplir la fiche depuis la photo** de l'étiquette (ne remplit que les champs vides), et rédiger **ce qu'on attend de ce vin**, que l'hôte joint à son invitation.
6 bis. **Lecture automatique** : avec une clé, l'étiquette est lue dès qu'une photo est ajoutée (environ 1 centime), sans bouton à toucher. Sans clé, une ligne signale que la fonction existe.
6 ter. **Préparation de la dégustation** : à la création de l'invitation, un seul appel produit le profil attendu (lu après la révélation), deux indices sur mesure, une piste d'attention pour le Débutant et une pour l'Amateur (lues pendant), et des leurres plausibles pour le quiz.
7. **Seul l'hôte a besoin d'une clé.** Ce que l'assistant prépare voyage dans le lien : les invités ne font aucun appel.
8. Modèle au choix (Haiku 5.5, Sonnet 5.5, Opus 5.5) ; Sonnet 5.5 par défaut, qui tient le budget.

## Conséquences

- La règle « données locales » gagne une exception explicite et volontaire : quand l'utilisateur déclenche l'assistant, la photo ou la fiche concernée part chez Anthropic. Sans clé, rien ne change.
- La règle « pas d'OCR » est remplacée : pas de pipeline de lecture maison, mais une lecture par modèle multimodal, à la demande.
- Les appels partent du navigateur (`dangerouslyAllowBrowser`). C'est acceptable parce que la clé est celle de l'utilisateur, sur son appareil ; ce ne le serait pas avec une clé commune.
- Tout ce que dit la base de connaissances ou l'assistant est présenté comme une **tendance**, jamais comme la vérité de la bouteille. Un écart avec le profil typique n'est pas une faute.
- La base de connaissances couvre une trentaine de cépages et les régions françaises ; hors de cette liste, la fiche se limite à ce qu'elle sait.
- Le lien d'invitation s'allonge avec le mot de l'hôte et le texte de l'assistant (jusqu'à ~1200 caractères) : le QR code devient plus dense, d'où le conseil de partager le lien si le scan échoue.
- **Garde-fou anti-révélation** : les textes lus pendant la dégustation voyagent en clair. La consigne interdit à l'assistant de nommer la bouteille, et `revealsBottle()` écarte tout texte qui citerait le cépage, l'origine, la cuvée, le producteur ou le millésime ; on retombe alors sur la base intégrée.
- Le lien est compressé (`deflate-raw`) pour rester scannable : environ 1100 caractères avec tout l'accompagnement.
- Limite assumée : pas de commentaire personnalisé par invité, qui demanderait une clé chez chacun ou un serveur.
- Vérifié contre la vraie API le jour même sur une étiquette simple : lecture juste avec Sonnet 5.5 et Haiku 5.5, environ 1 centime avec Sonnet pour une lecture et un profil attendu. Détail dans `docs/40_QA/README.md`. Les étiquettes difficiles restent à valider.
