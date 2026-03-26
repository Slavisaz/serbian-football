# Serbian Football Fix

This package separates the front-end from the Worker API.

## Important
If you are opening a `workers.dev` URL, GitHub uploads alone will not change that site.

## Front-end
Upload these files to GitHub and deploy with Cloudflare Pages:
- index.html
- style.css
- app.js
- logo.svg

## Worker API
Deploy `worker.js` as a Cloudflare Worker.
Then either:
- add a route `/api/news` on the same domain, or
- change `const API_URL` in `app.js` to your Worker URL.

Example:
```js
const API_URL = 'https://your-worker-name.your-subdomain.workers.dev/api/news';
```
