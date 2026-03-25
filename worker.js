export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/news") {
      const news = await buildNewsFeed();
      return new Response(JSON.stringify(news), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return fetch(req);
  }
};

const RSS_SOURCES = [
  {
    name: "Tanjug English",
    url: "https://www.tanjug.rs/rss/english/sports"
  },
  {
    name: "B92 English",
    url: "https://www.b92.net/rss/b92/english"
  },
  {
    name: "Yahoo Soccer",
    url: "https://sports.yahoo.com/soccer/rss/"
  }
];

// ✅ keywords
const FOOTBALL_TERMS = [
  "football", "soccer", "match", "goal", "coach",
  "uefa", "fifa", "league", "cup", "qualifier"
];

const SERBIA_TERMS = [
  "serbia", "serbian", "belgrade", "partizan",
  "red star", "vojvodina", "superliga"
];

// ✅ 48 HOURS FILTER
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

async function buildNewsFeed() {
  let all = [];

  for (const src of RSS_SOURCES) {
    try {
      const res = await fetch(src.url);
      const text = await res.text();

      const items = parseRSS(text, src.name);
      all.push(...items);
    } catch (e) {
      console.log("RSS error:", src.name);
    }
  }

  // ✅ FILTER PIPELINE
  const filtered = all
    .filter(isFootball)
    .filter(isSerbianRelated)
    .filter(isRecent) // ⭐ NEW FILTER
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  // fallback if empty
  if (filtered.length === 0) {
    return [{
      title: "No fresh Serbian football news (last 48h)",
      source: "System",
      link: "#",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2"
    }];
  }

  return filtered;
}

// ------------------------

function parseRSS(xml, source) {
  const items = [];

  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  for (const m of matches) {
    const item = m[1];

    const title = clean(get(item, "title"));
    const link = get(item, "link");
    const pubDate = new Date(get(item, "pubDate"));
    const image =
      get(item, "media:content", "url") ||
      get(item, "enclosure", "url") ||
      extractImage(item) ||
      fallbackImage();

    if (!title || !link) continue;

    items.push({
      title,
      link,
      source,
      date: pubDate,
      image
    });
  }

  return items;
}

// ------------------------

function isFootball(n) {
  const t = n.title.toLowerCase();
  return FOOTBALL_TERMS.some(k => t.includes(k));
}

function isSerbianRelated(n) {
  const t = n.title.toLowerCase();
  return SERBIA_TERMS.some(k => t.includes(k));
}

// ⭐ CRITICAL FIX
function isRecent(n) {
  const now = Date.now();
  return (now - n.date.getTime()) <= MAX_AGE_MS;
}

// ------------------------

function get(xml, tag, attr) {
  if (attr) {
    const r = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`, "i");
    const m = xml.match(r);
    return m ? m[1] : "";
  }

  const r = new RegExp(`<${tag}>(.*?)</${tag}>`, "is");
  const m = xml.match(r);
  return m ? m[1] : "";
}

function extractImage(xml) {
  const m = xml.match(/<img[^>]+src="([^"]+)"/i);
  return m ? m[1] : "";
}

function clean(str = "") {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") // remove CDATA
    .replace(/&[^;]+;/g, "") // remove html entities
    .trim();
}

function fallbackImage() {
  return "https://images.unsplash.com/photo-1508098682722-e99c43a406b2";
}
