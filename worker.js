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

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?auto=format&fit=crop&w=1200&q=80"
];

async function buildNewsFeed() {
  const official = await fetchFssMainNews();

  if (official.length > 0) {
    return official.slice(0, 5).map((item, i) => ({
      ...item,
      image: item.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
    }));
  }

  return [{
    title: "No fresh FSS English football news in the last 48 hours",
    link: "https://fss.rs/en/news/",
    source: "FSS",
    sourceType: "official",
    image: FALLBACK_IMAGES[0],
    dateTs: Date.now()
  }];
}

async function fetchFssMainNews() {
  try {
    const res = await fetch("https://fss.rs/en/news/", {
      headers: { "user-agent": "Mozilla/5.0 SerbianFootballPortal/1.0" }
    });

    if (!res.ok) return [];

    const html = await res.text();

    const matches = [
      ...html.matchAll(
        /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>[\s\S]*?<time[^>]*>([\s\S]*?)<\/time>/gi
      )
    ];

    const items = matches.map((m, i) => ({
      title: cleanText(stripHtml(m[2])),
      link: absolutizeFssUrl(m[1]),
      source: "FSS",
      sourceType: "official",
      image: FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
      dateTs: parseFssDate(cleanText(stripHtml(m[3])))
    }))
    .filter(hasContent)
    .filter(isRecent);

    return dedupe(items).sort((a, b) => b.dateTs - a.dateTs);
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

function isRecent(item) {
  return item.dateTs && (Date.now() - item.dateTs) <= MAX_AGE_MS;
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
