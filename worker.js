const corsHeaders = {
  'content-type': 'application/json; charset=UTF-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'Content-Type'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function absoluteUrl(base, href) {
  try { return new URL(href, base).toString(); } catch { return null; }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept-language': 'en-US,en;q=0.9'
    }
  });
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
  return await res.text();
}

async function translateToEnglish(text) {
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=' + encodeURIComponent(text);
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (!res.ok) return text;
    const data = await res.json();
    return data?.[0]?.map((part) => part[0]).join('') || text;
  } catch {
    return text;
  }
}

function parseFssHeadlines(html) {
  const items = [];
  const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    const title = stripTags(match[2]);
    if (!href || !title) continue;
    if (title.length < 20 || title.length > 220) continue;
    if (!/[А-Яа-яA-Za-z]/.test(title)) continue;
    if (title === 'Опширније' || title === 'Video' || title === 'Видео') continue;
    const url = absoluteUrl('https://fss.rs/', href);
    if (!url || !url.startsWith('https://fss.rs/')) continue;
    items.push({ original: title, url, source: 'FSS' });
  }
  return uniqBy(items, (x) => x.original + '|' + x.url).slice(0, 10);
}

function parseStandings(html) {
  const text = stripTags(html);
  const rows = [];
  const regex = /(\d{1,2})\s+([A-Za-zČĆŽŠĐčćžšđ0-9\- ]+?)\s+(\d{1,2})\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+[+\-]\d+\s+(\d{1,3})/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const position = Number(match[1]);
    const team = match[2].trim();
    const played = Number(match[3]);
    const points = Number(match[4]);
    if (!team || !Number.isFinite(position) || !Number.isFinite(points)) continue;
    if (played < 1 || played > 60) continue;
    rows.push({ position, team, points });
  }
  return uniqBy(rows, (x) => x.position).slice(0, 16);
}

function parseResults(html) {
  const text = stripTags(html);
  const rows = [];
  const regex = /(\d{2}\.\d{2}\.\d{4})\s+([A-Za-zČĆŽŠĐčćžšđ0-9 .,'\-]+?)\s+(\d{1,2}:\d{1,2})\s+Played\s+\1\s+\3\s+Played\s+([A-Za-zČĆŽŠĐčćžšđ0-9\- ]+?)\s+(\d+:\d+)\s+([A-Za-zČĆŽŠĐčćžšđ0-9\- ]+?)\s+([A-Za-zČĆŽŠĐčćžšđ0-9,.'\- ]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    rows.push({
      date: match[1],
      home: match[4].trim(),
      score: match[5].trim(),
      away: match[6].trim(),
      venue: match[7].trim()
    });
  }
  return rows.slice(-8).reverse();
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
    entries.push({ id, title, published, source: sourceName, url: `https://www.youtube.com/watch?v=${id}` });
  }
  return entries;
}

async function getNews() {
  try {
    const html = await fetchText('https://fss.rs/');
    const raw = parseFssHeadlines(html);
    const translated = [];
    for (const item of raw.slice(0, 8)) {
      const title = await translateToEnglish(item.original);
      translated.push({ title, original: item.original, source: item.source, url: item.url });
    }
    return translated;
  } catch {
    return [];
  }
}

async function getStandings() {
  try {
    const html = await fetchText('https://www.superliga.rs/en/sezona/tabela-takmicenja/');
    return parseStandings(html);
  } catch {
    return [];
  }
}

async function getResults() {
  try {
    const html = await fetchText('https://www.superliga.rs/en/sezona/raspored-i-rezultati/');
    return parseResults(html);
  } catch {
    return [];
  }
}

async function getVideos() {
  try {
    const xml = await fetchText('https://www.youtube.com/feeds/videos.xml?channel_id=UCd8Axjg_lLpFxTSdX_kIGDQ');
    return parseYouTubeFeed(xml, 'SuperLiga YouTube').slice(0, 8);
  } catch {
    return [];
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/api/news') return json(await getNews());
    if (url.pathname === '/api/standings') return json(await getStandings());
    if (url.pathname === '/api/results') return json(await getResults());
    if (url.pathname === '/api/videos') return json(await getVideos());
    if (url.pathname === '/api/health') return json({ status: 'ok' });

    return env.ASSETS.fetch(request);
  }
};
