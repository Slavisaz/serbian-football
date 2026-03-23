const corsHeaders = {
  "content-type": "application/json; charset=UTF-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function uniqBy(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9"
    }
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} (${res.status})`);
  }

  return await res.text();
}

async function translateToEnglish(text) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" +
      encodeURIComponent(text);

    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0"
      }
    });

    if (!res.ok) return text;

    const data = await res.json();
    return data?.[0]?.map(part => part[0]).join("") || text;
  } catch {
    return text;
  }
}

function parseOfficialNews(html, baseUrl, sourceName) {
  const items = [];
  const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    const rawText = stripTags(match[2]);

    if (!href || !rawText) continue;
    if (rawText.length < 20) continue;
    if (rawText.length > 220) continue;

    const url = absoluteUrl(baseUrl, href);
    if (!url) continue;

    items.push({
      title: rawText,
      source: sourceName,
      url
    });
  }

  return uniqBy(items, x => `${x.title}|${x.url}`).slice(0, 12);
}

function parseYouTubeFeed(xml, sourceName) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;

  let entryMatch;
  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];

    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i)?.[1]?.trim();
    const title = entry.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const published = entry.match(/<published>([^<]+)<\/published>/i)?.[1]?.trim();

    if (!id || !title) continue;

    entries.push({
      id,
      title,
      published,
      source: sourceName,
      url: `https://www.youtube.com/watch?v=${id}`
    });
  }

  return entries;
}

function parseSuperLigaStandings(html) {
  const rows = [];

  const rowRegex =
    /<tr[^>]*>\s*<td[^>]*>\s*(\d+)\s*<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>\s*(\d+)\s*<\/td>/gi;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const pos = Number(match[1]);
    const clubCell = stripTags(match[2]);
    const points = Number(match[3]);

    if (!Number.isFinite(pos) || !clubCell || !Number.isFinite(points)) continue;

    rows.push({
      position: pos,
      team: clubCell,
      points
    });
  }

  return rows
    .filter(r => r.position > 0 && r.team && Number.isFinite(r.points))
    .slice(0, 16);
}

async function getNews() {
  const results = [];

  try {
    const fssHtml = await fetchText("https://fss.rs/");
    const fssRaw = parseOfficialNews(fssHtml, "https://fss.rs/", "FSS");

    for (const item of fssRaw.slice(0, 6)) {
      const translated = await translateToEnglish(item.title);
      results.push({
        title: translated,
        original: item.title,
        source: "FSS",
        url: item.url
      });
    }
  } catch {
    // ignore source failure
  }

  try {
    const superligaHtml = await fetchText("https://www.superliga.rs/en/vesti/");
    const superligaRaw = parseOfficialNews(
      superligaHtml,
      "https://www.superliga.rs/en/vesti/",
      "SuperLiga"
    );

    for (const item of superligaRaw.slice(0, 6)) {
      const translated = await translateToEnglish(item.title);
      results.push({
        title: translated,
        original: item.title,
        source: "SuperLiga",
        url: item.url
      });
    }
  } catch {
    // ignore source failure
  }

  return uniqBy(results, x => `${x.title}|${x.url}`).slice(0, 8);
}

async function getStandings() {
  try {
    const html = await fetchText("https://www.superliga.rs/en/sezona/tabela-takmicenja/");
    const table = parseSuperLigaStandings(html);
    return table;
  } catch {
    return [];
  }
}

async function getVideos() {
  const feeds = [
    {
      source: "SuperLiga YouTube",
      url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCd8Axjg_lLpFxTSdX_kIGDQ"
    }
  ];

  const all = [];

  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed.url);
      all.push(...parseYouTubeFeed(xml, feed.source));
    } catch {
      // ignore failed feed
    }
  }

  return uniqBy(all, x => x.id).slice(0, 8);
}

export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname === "/news") {
      return json(await getNews());
    }

    if (url.pathname === "/standings") {
      return json(await getStandings());
    }

    if (url.pathname === "/videos") {
      return json(await getVideos());
    }

    if (url.pathname === "/health") {
      return json({ status: "ok" });
    }

    return json({
      status: "ok",
      routes: ["/news", "/standings", "/videos", "/health"]
    });
  }
};
