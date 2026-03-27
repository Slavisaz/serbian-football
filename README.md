# Serbian Football

Updated project with:
- live SuperLiga scores from API-FOOTBALL
- upcoming fixtures
- live standings table
- 4 main Serbian teams
- AI Match Pulse widget
- filtered Serbian football news feed

## Cloudflare setup

### 1) Front-end
Upload these files to your static site / GitHub Pages / Cloudflare Pages:
- `index.html`
- `style.css`
- `app.js`
- `logo.svg`

If your API worker uses another domain, add this before `app.js` in `index.html`:

```html
<script>
  window.SERBIAN_FOOTBALL_API_BASE = "https://YOUR-WORKER-DOMAIN.workers.dev";
</script>
```

### 2) Worker API
Deploy `worker.js` as a Cloudflare Worker and add your secret:

```bash
wrangler secret put API_FOOTBALL_KEY
```

Then paste your API-FOOTBALL key when Cloudflare asks.

## Current IDs used
- SuperLiga league id: `286`
- Main teams:
  - Red Star / FK Crvena Zvezda: `598`
  - Partizan: `573`
  - Vojvodina: `702`
  - OFK Beograd: `2633`

## Important
Do **not** hardcode your API key into public front-end files.
Keep it only inside the worker secret.
