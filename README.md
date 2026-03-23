# Serbian Football Portal

Cloudflare Worker portal with:
- SuperLiga standings (league 286)
- Prva Liga Srbije standings (league 287)
- Tanjug football RSS headlines
- FSS English headlines
- Recent official YouTube videos from SuperLigaRs1 and DAZN Football
- Monetization placeholders

## Files to upload
- index.js
- package.json
- wrangler.toml

## Optional secret
You can keep the built-in API key fallback, or set your own Worker secret:

wrangler secret put FOOTBALL_API_KEY

## Routes
- `/` homepage
- `/api/standings?league=286`
- `/api/standings?league=287`
- `/api/news`
- `/api/fss`
- `/api/videos`
- `/health`