export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/news") {
      return json(await buildNewsFeed());
    }

    return fetch(req);
  }
};

const DAY_MS = 24 * 60 * 60 * 1000;

const RSS_SOURCES = [
  { name: "Mozzart Sport", url: "https://www.mozzartsport.com/rss/1.xml", type: "media" },
  { name: "Tanjug", url: "https://www.tanjug.rs/rss/sport/fudbal", type: "media" },
  { name: "B92 Fudbal", url: "https://www.b92.net/rss/sport/fudbal/vesti", type: "media" },
  { name: "B92 Srpski Fudbal", url: "https://www.b92.net/rss/sport/fudbal/srpski-fudbal", type: "media" }
];

const KEYWORDS = [
  "serbia", "serbian", "superliga", "prva liga",
  "partizan", "crvena zvezda", "red star", "vojvodina",
  "tsc", "cukaricki", "čukarički", "radnicki", "radnički",
  "novi pazar", "mladost", "napredak", "javor",
  "fss", "orlovi", "reprezentacija", "u19", "u21",
  "omladinci", "fudbal", "srpski fudbal", "srbija"
];

async function buildNewsFeed() {
  const rssItems = await fetchAllRss();

  const merged = rssItems
    .filter(isRelevant)
    .map(normalizeItem)
    .filter(Boolean);

  const deduped = dedupeByTitle(merged).sort((a, b) => b.dateTs - a.dateTs);

  let latest = deduped.filter(item => Date.now() - item.dateTs <= DAY_MS);

  if (latest.length < 8) {
    latest = deduped.filter(item => Date.now() - item.dateTs <= 3 * DAY_MS);
  }

  return latest.slice(0, 11);
}

async function fetchAllRss() {
  const results = await Promise.all(
    RSS_SOURCES.map(async (source) => {
      try {
        const res = await fetch(source.url, {
          headers: { "user-agent": "Mozilla/5.0 SerbianFootballPortal/1.0" }
        });

        if (!res.ok) return [];

        const xml = await res.text();
        return parseRss(xml, source);
      } catch {
        return [];
      }
    })
  );

  return results.flat();
}

function parseRss(xml, source) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return items.map((m) => {
    const block = m[1];
    const title = decodeXml(getTag(block, "title"));
    const link = decodeXml(getTag(block, "link"));
    const pubDate = getTag(block, "pubDate");
    const description = stripHtml(decodeXml(getTag(block, "description")));

    return {
      source: source.name,
      sourceType: source.type,
      title,
      link,
      description,
      dateTs: pubDate ? new Date(pubDate).getTime() : 0
    };
  });
}

function isRelevant(item) {
  const hay = `${item.title} ${item.description || ""}`.toLowerCase();
  return KEYWORDS.some(k => hay.includes(k.toLowerCase()));
}

function normalizeItem(item) {
  if (!item.title || !item.link) return null;

  return {
    title: cleanTitle(item.title),
    link: item.link,
    source: item.source,
    sourceType: item.sourceType,
    ageHours: item.dateTs ? Math.max(0, Math.floor((Date.now() - item.dateTs) / 3600000)) : null,
    dateTs: item.dateTs || 0,
    image: null
  };
}

function dedupeByTitle(items) {
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

function cleanTitle(title) {
  return title
    .replace(/\s+-\s+[^-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

function stripHtml(s) {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(s) {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
}
