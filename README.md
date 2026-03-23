# Serbian Football

Single Cloudflare Worker app that serves both the frontend and `/api/*` routes.

## Project structure

- `public/` static assets and frontend
- `worker.js` API + asset handler
- `wrangler.jsonc` Cloudflare config

## Deploy

1. Upload these files to GitHub.
2. In Cloudflare Workers, create a Worker from this repo.
3. Deploy with Wrangler or connect the repo in Cloudflare and deploy.

## API routes

- `/api/news`
- `/api/standings`
- `/api/results`
- `/api/videos`
- `/api/health`
