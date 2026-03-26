const FEEDS = [
  {
    name: 'Tanjug',
    url: 'https://www.tanjug.rs/rss/english/sports'
  },
  {
    name: 'B92',
    url: 'https://www.b92.net/rss/b92/english'
  },
  {
    name: 'Yahoo Sports',
    url: 'https://sports.yahoo.com/soccer/rss/'
  }
];

const FOOTBALL_KEYWORDS = [
  'football', 'soccer', 'fudbal', 'superliga', 'super league', 'serbian cup',
  'uefa', 'fifa', 'world cup qualifier', 'europa league', 'champions league',
  'nations league', 'friendly match', 'derby', 'red star', 'partizan',
  'vojvodina', 'radnicki', 'cukaricki', 'novi pazar', 'napredak', 'tsc',
  'mitrovic', 'vlahovic', 'tadic', 'paunovic', 'stojkovic', 'milinkovic-savic'
];

const SERBIA_KEYWORDS = [
  'serbia', 'serbian', 'belgrade', 'red star', 'partizan', 'vojvodina',
  'radnicki', 'cukaricki', 'novi pazar', 'napredak', 'tsc', 'leskovac',
  'stara pazova', 'fss', 'rajko mitic'
];

function stripCdata(text = '') {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(text = '') {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i'));
  return match ? decodeHtml(stripCdata(match[1])) : '';
}

function parseItems(xml, source) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return blocks.map((block) => ({
    source,
    title: parseTag(block, 'title'),
    link: parseTag(block, 'link'),
    description: parseTag(block, 'description'),
    category: parseTag(block, 'category'),
    pubDate: parseTag(block, 'pubDate')
  }));
}

function containsKeyword(text, keywords) {
  const haystack = (text || '').toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

function isRelevant(item) {
  const text = [item.title, item.description, item.category].join(' ').toLowerCase();
  return containsKeyword(text, FOOTBALL_KEYWORDS) && containsKeyword(text, SERBIA_KEYWORDS);
}

function summarize(item) {
  const raw = item.description || '';
  if (!raw) return '';
  return raw.length > 180 ? `${raw.slice(0, 177).trim()}…` : raw;
}

function uniqueByLink(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.link || item.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getFeedItems(feed) {
  const response = await fetch(feed.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 SerbianFootball/1.0',
      'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`Feed request failed for ${feed.name}: ${response.status}`);
  }

  const xml = await response.text();
  return parseItems(xml, feed.name);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/news') {
      try {
        const batches = await Promise.all(FEEDS.map(getFeedItems));
        const items = uniqueByLink(
          batches
            .flat()
            .filter((item) => item.title && item.link)
            .filter(isRelevant)
            .map((item) => ({
              source: item.source,
              title: item.title,
              link: item.link,
              summary: summarize(item),
              pubDate: item.pubDate
            }))
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        ).slice(0, 18);

        return json({
          generatedAt: new Date().toISOString(),
          items
        });
      } catch (error) {
        return json({ error: error.message }, 500);
      }
    }

    return fetch(request);
  }
};
