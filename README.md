# MyWine

Webapp de dégustation de vin, à installer sur l'écran d'accueil du téléphone.

**→ https://rouspauviet.github.io/MyWine/**

- **Déguster à l'aveugle** : un formulaire guidé, adapté au type de vin et à ton niveau, puis la comparaison entre tes hypothèses et la vraie bouteille.
- **Déguster à plusieurs** : l'hôte fait deviner sa bouteille ; chaque invité joue sur son téléphone, à son niveau, sans compte.
- **Garder un souvenir** des bouteilles bues : étiquette en photo, prix, note, occasion.

Après la révélation, une fiche explique le vin : ce qui est typique du cépage et de la région, et ce que tu avais bien perçu.

Tes données restent sur ton appareil : pas de compte, pas de serveur. La sauvegarde se fait par export d'un fichier depuis les paramètres.

**Assistant IA (optionnel).** Avec ta propre clé d'API Claude, collée dans les paramètres, l'app remplit la fiche depuis une photo d'étiquette. La clé reste sur ton appareil. Sans clé, tout le reste fonctionne.

## Installer sur iPhone

Ouvre l'adresse dans Safari → Partager → **Sur l'écran d'accueil**.

## Développer

```bash
cd web
npm install
npm run dev
```

Documentation : [docs/README.md](docs/README.md). Chaque push sur `main` republie l'app.
