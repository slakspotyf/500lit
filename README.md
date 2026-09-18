# Feuille de consommation — 500 Lits

Application hors-ligne (ONOU, Résidence 500 Lits).

**Identifiant:** `hassad`  
**Mot de passe:** `5420`

## Cloudflare Pages (Git)

Do **not** compile the app. Use the prebuilt `docs/` folder.

In the Cloudflare project settings:

| Field | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `docs` |
| Root directory | `/` |
| Node.js version | `20` |

If a previous deploy failed, retry after this commit.

## Local

Open `docs/index.html` is not enough (needs a server). Serve `docs/`:

```bash
npx serve docs
```
