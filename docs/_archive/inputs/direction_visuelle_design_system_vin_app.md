# Direction Visuelle & Design System

## 1. Direction Visuelle

### Positionnement esthétique

Minimalisme organique.

L'application doit évoquer : - La matière - Le papier - La cave - Une
lumière tamisée - Des étiquettes sobres

À éviter : - Dégradés flashy - Effets glassmorphism - Skeuomorphisme -
Icônes trop illustratives

------------------------------------------------------------------------

## Palette de Couleurs

### Neutres fondamentaux

Fond clair : - #F6F4EF (blanc cassé chaud)

Fond sombre : - #121212 (noir profond légèrement chaud)

Surface claire : - #FFFFFF

Surface sombre : - #1A1A1A

### Couleur primaire (identité)

-   #6E2C2C (rouge vin désaturé)

Usage : - Bouton principal - Accent actif - États sélectionnés

### Couleurs secondaires (catégorisation des vins)

Rouge : - #7A3E3E

Blanc : - #C9B98E

Rosé : - #D8A7A7

Orange : - #C47A3A

Pétillant : - #9FAF8F

Utilisation : - Badges - Pastilles - Tags Jamais en fond principal.

### Couleurs fonctionnelles

Succès : - #2E7D5A

Erreur : - #B23A3A

Information : - #3A5A7A

------------------------------------------------------------------------

## Mode Clair / Sombre

Philosophie du mode sombre : - Évoquer une cave - Créer une ambiance
nocturne - Ne pas simplement inverser les couleurs

Règles : - Rouge primaire en sombre : #8C3A3A - Surfaces jamais noir pur
sauf fond principal - Ombres plus subtiles

------------------------------------------------------------------------

## 2. Typographie

Objectif : lisible, élégante, moderne.

Option recommandée : - Titres : Playfair Display - Corps : Inter

Option simplifiée : - Inter uniquement

### Échelle typographique (mobile-first)

-   H1 : 24px
-   H2 : 20px
-   H3 : 16px
-   Body : 14--16px
-   Caption : 12px

Line-height recommandé : 1.4 à 1.6

------------------------------------------------------------------------

## 3. Design System --- Tokens CSS

### Couleurs

``` css
:root {
  --color-bg: #F6F4EF;
  --color-surface: #FFFFFF;
  --color-text-primary: #1C1C1C;
  --color-text-secondary: #6B6B6B;

  --color-primary: #6E2C2C;
  --color-primary-hover: #5A2323;

  --color-success: #2E7D5A;
  --color-error: #B23A3A;
}
```

Mode sombre :

``` css
[data-theme="dark"] {
  --color-bg: #121212;
  --color-surface: #1A1A1A;
  --color-text-primary: #F2F2F2;
  --color-text-secondary: #B5B5B5;

  --color-primary: #8C3A3A;
}
```

------------------------------------------------------------------------

### Espacements

Base 4px.

``` css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
```

------------------------------------------------------------------------

### Rayons

Angles doux, organiques.

``` css
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;
```

Usage : - Cartes : radius-md - Boutons : radius-lg

------------------------------------------------------------------------

### Ombres

Subtiles.

``` css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 8px rgba(0,0,0,0.06);
--shadow-lg: 0 8px 16px rgba(0,0,0,0.08);
```

En mode sombre : réduire légèrement l'opacité.

------------------------------------------------------------------------

## 4. Ambiance UX Générale

L'application doit transmettre : - Calme - Concentration - Mémoire -
Sensualité discrète

Éviter : - Productivité froide - Gamification - Codes sociaux type
réseau social
