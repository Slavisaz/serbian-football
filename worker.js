export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/news") {
      return json(await buildNewsFeed());
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

/*
  STRICTER RULES:
  1. Must mention football/soccer OR known Serbian football terms
  2. Must also mention Serbia/Serbian club/national-team context
*/

const FOOTBALL_TERMS = [
  "football",
  "soccer",
  "superliga",
  "super league",
  "match",
  "goal",
  "coach",
  "striker",
  "midfielder",
  "defender",
  "qualifier",
  "qualifying",
  "uefa",
  "fifa",
  "championship",
  "national team",
  "youth team",
  "u19",
  "u21"
];

const SERBIAN_TERMS = [
  "serbia",
  "serbian",
  "red star",
  "crvena zvezda",
  "partizan",
  "vojvodina",
  "tsc",
  "radnicki",
  "radnički",
  "cukaricki",
  "čukarički",
  "novi pazar",
  "superliga",
  "fss",
  "trikolori",
  "eagles"
];

const HARD_EXCLUDE = [
  "basketball",
  "nba",
  "euroleague",
  "tennis",
  "atp",
  "wta",
  "volleyball",
  "handball",
  "water polo",
  "formula 1",
  "f1",
  "boxing",
  "mma",
  "ufc",
  "golf",
  "baseball",
  "nfl",
  "pipeline",
  "oil",
  "gas",
  "nato",
  "remembrance",
  "victims",
  "indoor championships",
  "high jumper",
  "athletics",
  "construction"
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?auto=format&fit=crop&w=800&q=80"
];

async function buildNewsFeed() {
  const results = await Promise.all(RSS_SOURCES.map(fetchFeed));
  let items = results.flat();

  items = items
    .filter(hasContent)
    .filter(isSerbianFootball)
    .map(cleanItem)
    .filter(Boolean);

  items = dedupe(items)
    .sort((a, b) => b.dateTs - a.dateTs)
    .slice(0, 5);

  return items.map((item, i) => ({
    ...item,
    image: item.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
  }));
}

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "user-agent": "Mozilla/5.0 SerbianFootballPortal/1.0"
      }
    });

    if (!res.ok) return [];

    const xml = await res.text();
    return parseRss(xml, source.name);
  } catch {
    return [];
  }
}

function parseRss(xml, sourceName) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return items.map((m) => {
    const block = m[1];

    const title = cleanText(getTag(block, "title"));
    const link = cleanText(getTag(block, "link"));
    const pubDate = cleanText(getTag(block, "pubDate"));
    const description = stripHtml(cleanText(getTag(block, "description")));

    const mediaUrl =
      getMediaContentUrl(block) ||
      getEnclosureUrl(block) ||
      getImgFromDescription(getTag(block, "description"));

    return {
      title,
      link,
      source: sourceName,
      description,
      image: mediaUrl,
      dateTs: pubDate ? new Date(pubDate).getTime() : 0
    };
  });
}

function getTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

function getMediaContentUrl(xml) {
  const m = xml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  return m ? cleanText(m[1]) : "";
}

function getEnclosureUrl(xml) {
  const m = xml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  return m ? cleanText(m[1]) : "";
}

function getImgFromDescription(html) {
  const m = String(html || "").match(/<img[^>]*src=["']([^"']+)["']/i);
  return m ? cleanText(m[1]) : "";
}

function cleanText(s) {
  return decodeXml(
    String(s || "")
      .replace(/<!\[CDATA\[/gi, "")
      .replace(/\]\]>/g, "")
      .trim()
  );
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function hasContent(item) {
  return item.title && item.link;
}

function includesAny(text, words) {
  return words.some(word => text.includes(word));
}

function isSerbianFootball(item) {
  const hay = `${item.title} ${item.description}`.toLowerCase();

  if (includesAny(hay, HARD_EXCLUDE)) return false;

  const hasFootball = includesAny(hay, FOOTBALL_TERMS);
  const hasSerbian = includesAny(hay, SERBIAN_TERMS);

  // strict: needs both
  if (hasFootball && hasSerbian) return true;

  // club-only fallback: allow famous Serbian club/national-team references
  if (
    hay.includes("crvena zvezda") ||
    hay.includes("red star") ||
    hay.includes("partizan") ||
    hay.includes("serbia national team") ||
    hay.includes("serbian national team") ||
    hay.includes("superliga")
  ) {
    return true;
  }

  return false;
}

function cleanItem(item) {
  return {
    title: item.title.replace(/\s+/g, " ").trim(),
    link: item.link,
    source: item.source,
    image: item.image || null,
    dateTs: item.dateTs || 0
  };
}

function dedupe(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = item.title
      .toLowerCase()
      .replace(/[^a-z0-9čćšđž\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
}
