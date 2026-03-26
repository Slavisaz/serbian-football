const FEEDS = [
  { url: 'https://www.tanjug.rs/rss/english/sports', source: 'Tanjug English Sports' },
  { url: 'https://www.b92.net/rss/b92/english', source: 'B92 English' },
  { url: 'https://sports.yahoo.com/soccer/rss/', source: 'Yahoo Sports Soccer' },
];

const FOOTBALL_WORDS = [
  'football', 'soccer', 'superliga', 'super league', 'partizan', 'red star', 'crvena zvezda',
  'vojvodina', 'radnicki', 'cukaricki', 'novi pazar', 'napredak', 'tsc', 'mladost', 'imt',
  'serbia', 'serbian', 'u21', 'belgrade derby', 'fudbal'
];

function cleanText(text = '') {
  return text
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRss(xml, source) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => m[1]);
  return items.map(item => {
    const pick = (tag) => {
      const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? cleanText(match[1]) : '';
    };
    const title = pick('title');
    const link = pick('link');
    const description = pick('description');
    const pubDate = pick('pubDate');
    return { title, link, summary: description, pubDate, source };
  });
}

function looksRelevant(item) {
  const hay = `${item.title} ${item.summary}`.toLowerCase();
  const hasFootball = FOOTBALL_WORDS.some(word => hay.includes(word));
  const hasSerbia = /serbia|serbian|partizan|red star|crvena zvezda|vojvodina|radnicki|cukaricki|novi pazar|napredak|tsc|mladost|imt|belgrade/.test(hay);
  return hasFootball && hasSerbia;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/news') {
      try {
        const responses = await Promise.all(FEEDS.map(async feed => {
          const res = await fetch(feed.url, {
            headers: { 'User-Agent': 'SerbianFootballPortal/1.0' },
            cf: { cacheTtl: 900, cacheEverything: true }
          });
          const text = await res.text();
          return parseRss(text, feed.source);
        }));

        const items = responses.flat()
          .filter(item => item.title && item.link)
          .filter(looksRelevant)
          .filter((item, i, arr) => arr.findIndex(x => x.link === item.link) === i)
          .slice(0, 12);

        return new Response(JSON.stringify({ items }, null, 2), {
          headers: {
            'content-type': 'application/json; charset=UTF-8',
            'access-control-allow-origin': '*',
            'cache-control': 'public, max-age=900'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ items: [], error: String(error) }, null, 2), {
          status: 500,
          headers: { 'content-type': 'application/json; charset=UTF-8', 'access-control-allow-origin': '*' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
