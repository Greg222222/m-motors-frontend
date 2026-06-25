# M-Motors — Frontend

Application React (Vite) consommant l'API M-Motors. 4 pages :

- **Catalogue** (US-01) : recherche de véhicules, filtre Achat / Location.
- **Connexion / Inscription** (US-02) : authentification JWT.
- **Mon espace client** (US-02 / US-03) : dépôt de pièces justificatives, suivi du
  statut du dossier en temps réel.
- **Back-office** (US-04 / US-05 / US-06) : ajout de véhicules, bascule
  Vente ↔ Location, visualisation et validation/refus des dossiers.

## Lancer en local

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL doit pointer vers le backend
npm run dev
```

## Tests

```bash
npm run test            # exécution
npm run test:coverage   # avec couverture
```

Couverture mesurée sur les pages et la logique d'authentification : **~85%**
(objectif énoncé : 80%).

## Build / déploiement

```bash
npm run build
```

Génère un dossier `dist/` statique, déployé en tant que Static Site sur Render
(voir `render.yaml` côté backend pour la configuration complète des 3 services).
