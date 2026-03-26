# Serbian Football - live RSS build

This package includes:

- `index.html` - front end
- `style.css` - styling
- `app.js` - front-end logic
- `worker.js` - Cloudflare Worker that fetches RSS feeds and returns filtered JSON
- `logo.svg` - clean English logo

## What this build does

- Uses **real RSS data** from:
  - Tanjug English Sports RSS
  - B92 English RSS
  - Yahoo Sports Soccer RSS
- Filters to:
  - football/soccer stories only
  - Serbia / Serbian football related stories only
- Shows:
  - headline ticker
  - featured story
  - latest news cards

## Important note

The feeds you provided are good for **news**.
They are **not enough for live scores, fixtures, or standings**.
For those sections, you need a separate legal match-data source or widget.

## Deploy on Cloudflare Workers

### Option A - with Wrangler

1. Put these files in your project folder.
2. Use `index.html`, `style.css`, `app.js`, `logo.svg` as static assets.
3. Use `worker.js` as your Worker entry file.
4. Bind static assets or serve the front end from Pages and the Worker from `/api/news`.

### Option B - simple setup

- Deploy the front end to **Cloudflare Pages**.
- Deploy `worker.js` to **Cloudflare Workers**.
- Change `API_URL` in `app.js` from `/api/news` to your Worker URL if needed.

Example:
```js
const API_URL = 'https://your-worker-name.your-subdomain.workers.dev/api/news';
```

## GitHub upload

Upload all files to the root of your repo.

If using Pages only, the Worker endpoint must already exist and be public.
