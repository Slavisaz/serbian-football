export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/news") {
      const news = await buildNewsFeed();
      return new Response(JSON.stringify(news), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "public, max-age=300"
        }
      });
    }

    return fetch(req);
  }
};

const MAX_AGE_MS = 48 * 60 * 60 * 1000;

const RSS_SOURCES = [
  { name: "Tanjug English", url: "https://www.tanjug.rs/rss/english/sports", type: "media" },
  { name: "B92 English", url: "https://www.b92.net/rss/b92/english", type: "media" },
  { name: "Yahoo Soccer", url: "https://sports.yahoo.com/soccer/rss/", type: "media" }
];

const FOOTBALL_TERMS = [
  "football", "soccer", "superliga", "super league", "match", "goal",
  "coach", "manager", "striker", "midfielder", "defender", "qualifier",
  "qualifying", "uefa", "fifa", "national team", "u19", "u21", "cup"
];

const SERBIAN_TERMS = [
  "serbia", "serbian", "red star", "crvena zvezda", "partizan", "vojvodina",
  "tsc", "radnicki", "radnički", "cukaricki", "čukarički", "novi pazar",
  "superliga", "fss", "belgrade"
];

const HARD_EXCLUDE = [
  "basketball", "nba", "euroleague", "tennis", "atp", "wta", "volleyball",
  "handball", "water polo", "formula 1", "f1", "boxing", "mma", "ufc",
  "golf", "baseball", "nfl", "pipeline", "oil", "gas", "nato", "athletics",
  "indoor championships"
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?auto=format&fit=crop&w=1200&q=80"
];

async function buildNewsFeed() {
  const [fssItems, rssResults] = await Promise.all([
    fetchFssMainNews(),
    Promise.all(RSS_SOURCES.map(fetchFeed))
  ]);

  const rssItems = rssResults
    .flat()
    .filter(hasContent)
    .filter(isSerbianFootball)
    .filter(isRecent)
    .map(cleanItem)
    .filter(Boolean);

  const official = dedupe(fssItems)
    .sort((a, b) => b.dateTs - a.dateTs)
    .slice(0, 3);

  const media = dedupe(rssItems)
    .sort((a, b) => b.dateTs - a.dateTs)
    .filter(item => !official.some(o => sameTitle(o.title, item.title)))
    .slice(0, 2);

  const merged = [...official, ...media];

  return merged.map((item, i) => ({
    ...item,
    image: item.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
  }));
}

async function fetchFssMainNews() {
  try {
    const res = await fetch("https://fss.rs/en/news/", {
      headers: { "user-agent": "Mozilla/5.0 SerbianFootballPortal/1.0" }
    });

    if (!res.ok) return [];

    const html = await res.text();

    // Main article cards on FSS News page:
    // look for H2 headline link + nearby date
    const matches = [
      ...html.matchAll(
        /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>[\s\S]*?<time[^>]*>([\s\S]*?)<\/time>/gi
      )
    ];

    const items = matches.map((m) => {
      const link = absolutizeFssUrl(m[1]);
      const title = cleanText(stripHtml(m[2]));
      const dateText = cleanText(stripHtml(m[3]));

      return {
        title,
        link,
        source: "FSS",
        sourceType: "official",
        image: null,
        dateTs: parseFssDate(dateText)
      };
    });

    // Fallback if theme markup differs
    if (!items.length) {
      const loose = [...html.matchAll(/##\s*【\d+†([^】]+)】[\s\S]*?(\d{2}\.\d{2}\.\d{4}\.)/g)];
      return loose.slice(0, 3).map((m, i) => ({
        title: cleanText(m[1]),
        link: "https://fss.rs/en/news/",
        source: "FSS",
        sourceType: "official",
        image: FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
        dateTs: parseFssDate(m[2])
      }));
    }

    return items
      .filter(hasContent)
      .filter(item => item.dateTs && isRecent(item))
      .slice(0, 3);
  } catch {
    return [];
  }
}

function absolutizeFssUrl(href) {
  if (!href) return "https://fss.rs/en/news/";
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return "https://fss.rs" + href;
  return "https://fss.rs/" + href.replace(/^\.?\//, "");
}

function parseFssDate(s) {
  const m = String(s || "").match(/(\d{2})\.(\d{2})\.(\d{4})\.?/);
  if (!m) return 0;
  const [, dd, mm, yyyy] = m;
  return new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`).getTime();
}

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: { "user-agent": "Mozilla/5.0 SerbianFootballPortal/1.0" }
    });

    if (!res.ok) return [];

    const xml = await res.text();
    return parseRss(xml, source.name, source.type);
  } catch {
    return [];
  }
}

function parseRss(xml, sourceName, sourceType) {
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
      sourceType,
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
  const hay = `${item.title} ${item.description || ""}`.toLowerCase();

  if (includesAny(hay, HARD_EXCLUDE)) return false;

  const hasFootball = includesAny(hay, FOOTBALL_TERMS);
  const hasSerbian = includesAny(hay, SERBIAN_TERMS);

  if (hasFootball && hasSerbian) return true;

  return (
    hay.includes("crvena zvezda") ||
    hay.includes("red star") ||
    hay.includes("partizan") ||
    hay.includes("serbia national team") ||
    hay.includes("serbian national team") ||
    hay.includes("superliga") ||
    hay.includes("fss")
  );
}

function isRecent(item) {
  return item.dateTs && (Date.now() - item.dateTs) <= MAX_AGE_MS;
}

function cleanItem(item) {
  return {
    title: item.title.replace(/\s+/g, " ").trim(),
    link: item.link,
    source: item.source,
    sourceType: item.sourceType || "media",
    image: item.image || null,
    dateTs: item.dateTs || 0
  };
}

function dedupe(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = normalizeTitle(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9čćšđž\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sameTitle(a, b) {
  return normalizeTitle(a) === normalizeTitle(b);
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
}
