# Feuille de consommation — 500 Lits

Application hors-ligne pour la feuille de consommation journalière
(Résidence Universitaire 500 Lits, ONOU).

Saisie quotidienne, calcul automatique, bilan du mois, export Excel officiel, impression A3.
Français / العربية. Données dans `localStorage` (pas de serveur).

## Connexion

- Identifiant : `hassad`
- Mot de passe : `5420`

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:8080

## Mettre en ligne (Cloudflare Pages)

Le dossier `docs/` est le site statique déjà compilé.

1. [Cloudflare Pages](https://pages.cloudflare.com) → **Connect to Git**
2. Choisir ce dépôt `500lit`
3. Build command : *(vide)*
4. Output directory : `docs`
5. Deploy

Ou **Direct Upload** : zipper le contenu de `docs/` (fichiers à la racine du zip, pas le dossier).

## GitHub Pages

Settings → Pages → Deploy from a branch → `main` / `/docs`.
