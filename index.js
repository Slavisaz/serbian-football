const API_KEY_FALLBACK = "b80e630effea6fbdac1643532977e620";
const SUPERLIGA_ID = 286;
const PRVA_ID = 287;
const SUPERLIGA_CHANNEL_ID = "UCd8Axjg_lLpFxTSdX_kIGDQ"; // @SuperligaRs1
const DAZN_FOOTBALL_CHANNEL_ID = "UCSZ21xyG8w_33KriMM69IxQ"; // DAZN Football

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Serbian Football Portal</title>
  <meta name="description" content="Live Serbian football portal in English with SuperLiga, Prva Liga Srbije, national team headlines, legal news feeds, and recent videos." />
  <meta name="theme-color" content="#111827" />
  <style>
    :root {
      --bg: #0b1220;
      --card: #111827;
      --card-2: #0f172a;
      --line: #243042;
      --text: #e5e7eb;
      --muted: #9ca3af;
      --accent: #dc2626;
      --accent-2: #2563eb;
      --gold: #f59e0b;
      --ok: #16a34a;
      --shadow: 0 12px 28px rgba(0,0,0,.28);
      --radius: 18px;
      --container: 1320px;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: linear-gradient(180deg, #08101c 0%, #0b1220 100%); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }
    .topbar {
      background: linear-gradient(90deg, #8b0000 0%, #dc2626 60%, #ef4444 100%);
      border-bottom: 1px solid rgba(255,255,255,.08);
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(6px);
    }
    .topbar-inner {
      max-width: var(--container);
      margin: 0 auto;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand {
      display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: .2px;
      font-size: clamp(22px, 2vw, 30px);
    }
    .brand-badge {
      width: 18px; height: 18px; border-radius: 4px; background: white; box-shadow: 0 0 0 4px rgba(255,255,255,.16);
    }
    .topnav {
      display: flex; gap: 14px; flex-wrap: wrap; color: rgba(255,255,255,.9); font-size: 14px;
    }
    .hero {
      max-width: var(--container);
      margin: 0 auto;
      padding: 28px 18px 18px;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 18px;
    }
    .hero-main, .hero-side, .card {
      background: linear-gradient(180deg, rgba(17,24,39,.96), rgba(15,23,42,.96));
      border: 1px solid rgba(255,255,255,.06);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .hero-main { padding: 22px; min-height: 220px; position: relative; overflow: hidden; }
    .hero-main:before {
      content: "";
      position: absolute; inset: auto -120px -120px auto;
      width: 280px; height: 280px; border-radius: 999px;
      background: radial-gradient(circle, rgba(220,38,38,.34) 0%, rgba(220,38,38,0) 70%);
    }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      color: #fecaca; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; font-weight: 700;
      background: rgba(220,38,38,.12); border: 1px solid rgba(220,38,38,.35); padding: 7px 10px; border-radius: 999px;
    }
    .headline {
      margin: 14px 0 10px; font-size: clamp(28px, 4vw, 48px); line-height: 1.04; font-weight: 900;
      max-width: 12ch;
    }
    .sub {
      color: var(--muted); max-width: 72ch; line-height: 1.6; font-size: 15px;
    }
    .hero-side { padding: 18px; display: grid; gap: 12px; align-content: start; }
    .mini-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .metric {
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 14px; padding: 14px;
    }
    .metric-label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    .metric-value { margin-top: 6px; font-size: 24px; font-weight: 800; }
    .metric-note { margin-top: 4px; font-size: 12px; color: #cbd5e1; }
    .container {
      max-width: var(--container);
      margin: 0 auto;
      padding: 0 18px 28px;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
      gap: 18px;
    }
    .main-col, .side-col { display: grid; gap: 18px; align-content: start; }
    .card { padding: 18px; }
    .section-head {
      display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px;
    }
    .section-title {
      font-size: 22px; font-weight: 900; letter-spacing: -.02em;
    }
    .section-kicker {
      color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .12em; font-weight: 800;
    }
    .pill {
      color: #dbeafe; background: rgba(37,99,235,.12); border: 1px solid rgba(37,99,235,.34);
      font-size: 12px; padding: 7px 10px; border-radius: 999px;
      white-space: nowrap;
    }
    .boards {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
    }
    .board { background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; overflow: hidden; }
    .board-head {
      padding: 14px 14px 10px; border-bottom: 1px solid rgba(255,255,255,.06);
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0));
    }
    .board-title { font-weight: 800; }
    .table-wrap { overflow: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,.05); text-align: left; }
    th { color: #cbd5e1; font-size: 12px; text-transform: uppercase; letter-spacing: .1em; }
    tr:hover td { background: rgba(255,255,255,.025); }
    .pos {
      width: 36px; height: 28px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 12px; background: rgba(255,255,255,.06);
    }
    .pos.top4 { background: rgba(34,197,94,.14); color: #bbf7d0; }
    .pos.mid { background: rgba(59,130,246,.14); color: #bfdbfe; }
    .news-grid { display: grid; gap: 14px; }
    .news-item {
      display: grid; grid-template-columns: 1fr auto; gap: 14px;
      padding: 14px; border-radius: 16px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06);
    }
    .news-item:hover { border-color: rgba(255,255,255,.14); transform: translateY(-1px); transition: .18s ease; }
    .news-source { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: var(--muted); font-weight: 800; }
    .news-title { margin-top: 6px; font-size: 17px; font-weight: 800; line-height: 1.35; }
    .news-meta { margin-top: 8px; color: #cbd5e1; font-size: 13px; display: flex; gap: 12px; flex-wrap: wrap; }
    .news-arrow {
      align-self: center; width: 38px; height: 38px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,.06); color: white; font-size: 18px;
    }
    .side-stack { display: grid; gap: 12px; }
    .story {
      display: grid; gap: 8px;
      padding: 14px; border-radius: 16px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
    }
    .story-title { font-weight: 800; line-height: 1.35; }
    .story-meta { color: var(--muted); font-size: 13px; }
    .video-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .video-card {
      background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; overflow: hidden;
    }
    .video-frame { aspect-ratio: 16 / 9; width: 100%; border: 0; display: block; background: #000; }
    .video-body { padding: 12px 12px 14px; }
    .video-title { font-weight: 800; line-height: 1.35; }
    .video-meta { margin-top: 6px; color: var(--muted); font-size: 13px; }
    .ad-slot {
      border: 1px dashed rgba(245,158,11,.5);
      background: linear-gradient(180deg, rgba(245,158,11,.08), rgba(245,158,11,.03));
      color: #fde68a; border-radius: 16px; padding: 18px;
    }
    .ad-label { font-size: 12px; text-transform: uppercase; letter-spacing: .16em; font-weight: 800; color: #fcd34d; }
    .ad-copy { margin-top: 8px; color: #fef3c7; line-height: 1.55; }
    .status {
      display: inline-flex; align-items: center; gap: 8px; color: #bbf7d0; font-weight: 700; font-size: 13px;
    }
    .dot { width: 10px; height: 10px; border-radius: 999px; background: var(--ok); box-shadow: 0 0 0 4px rgba(22,163,74,.14); }
    .footer {
      max-width: var(--container);
      margin: 0 auto;
      padding: 0 18px 36px;
      color: var(--muted); font-size: 13px;
    }
    .muted { color: var(--muted); }
    .empty {
      color: var(--muted); padding: 16px; border-radius: 14px; background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.09);
    }
    .loading {
      min-height: 80px;
      display: grid; place-items: center;
      color: var(--muted);
    }
    @media (max-width: 1080px) {
      .hero, .layout { grid-template-columns: 1fr; }
      .boards, .video-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 720px) {
      .topbar-inner { align-items: flex-start; flex-direction: column; }
      .mini-metrics { grid-template-columns: 1fr 1fr; }
      .news-item { grid-template-columns: 1fr; }
      .hero-main, .hero-side, .card { border-radius: 16px; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <span class="brand-badge"></span>
        <span>Serbian Football</span>
      </div>
      <nav class="topnav">
        <a href="#standings">Standings</a>
        <a href="#news">News</a>
        <a href="#national-team">National Team</a>
        <a href="#videos">Videos</a>
        <a href="#monetization">Monetization</a>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="hero-main">
      <div class="eyebrow">Live English portal · legal free sources</div>
      <div class="headline">Automated Serbian football coverage</div>
      <div class="sub">
        ESPN-style homepage with live SuperLiga and Prva Liga tables, official federation headlines, Tanjug football RSS links, and recent legal video embeds from official YouTube channels.
      </div>
    </div>
    <aside class="hero-side">
      <div class="status"><span class="dot"></span> Live fetch on every visit</div>
      <div class="mini-metrics">
        <div class="metric">
          <div class="metric-label">Leagues</div>
          <div class="metric-value">2</div>
          <div class="metric-note">SuperLiga + Prva Liga</div>
        </div>
        <div class="metric">
          <div class="metric-label">Feeds</div>
          <div class="metric-value">3</div>
          <div class="metric-note">API, RSS, YouTube</div>
        </div>
        <div class="metric">
          <div class="metric-label">Refresh</div>
          <div class="metric-value">5m</div>
          <div class="metric-note">Front-end auto refresh</div>
        </div>
        <div class="metric">
          <div class="metric-label">Ad Ready</div>
          <div class="metric-value">Yes</div>
          <div class="metric-note">AdSense / affiliate slots</div>
        </div>
      </div>
    </aside>
  </section>

  <main class="container">
    <div class="layout">
      <section class="main-col">
        <section class="card" id="standings">
          <div class="section-head">
            <div>
              <div class="section-kicker">League tables</div>
              <div class="section-title">Live standings</div>
            </div>
            <div class="pill">League IDs: 286 · 287</div>
          </div>
          <div class="boards">
            <div class="board">
              <div class="board-head">
                <div class="board-title">Serbian SuperLiga</div>
                <div class="muted">Updated live</div>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Pos</th><th>Club</th><th>Pts</th></tr>
                  </thead>
                  <tbody id="superliga-body"><tr><td colspan="3" class="loading">Loading…</td></tr></tbody>
                </table>
              </div>
            </div>

            <div class="board">
              <div class="board-head">
                <div class="board-title">Prva Liga Srbije</div>
                <div class="muted">Updated live</div>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Pos</th><th>Club</th><th>Pts</th></tr>
                  </thead>
                  <tbody id="prva-body"><tr><td colspan="3" class="loading">Loading…</td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section class="card" id="news">
          <div class="section-head">
            <div>
              <div class="section-kicker">Tanjug RSS + official federation links</div>
              <div class="section-title">Latest football news</div>
            </div>
            <div class="pill">English portal format</div>
          </div>
          <div class="news-grid" id="news-grid">
            <div class="empty">Loading headlines…</div>
          </div>
        </section>

        <section class="card" id="videos">
          <div class="section-head">
            <div>
              <div class="section-kicker">Official YouTube channels</div>
              <div class="section-title">Recent videos</div>
            </div>
            <div class="pill">Last 7 days when available</div>
          </div>
          <div class="video-grid" id="video-grid">
            <div class="empty">Loading videos…</div>
          </div>
        </section>
      </section>

      <aside class="side-col">
        <section class="card" id="national-team">
          <div class="section-head">
            <div>
              <div class="section-kicker">Official federation</div>
              <div class="section-title">National team / FSS</div>
            </div>
          </div>
          <div class="side-stack" id="fss-list">
            <div class="empty">Loading FSS headlines…</div>
          </div>
        </section>

        <section class="card">
          <div class="section-head">
            <div>
              <div class="section-kicker">Portal status</div>
              <div class="section-title">Automation notes</div>
            </div>
          </div>
          <div class="side-stack">
            <div class="story">
              <div class="story-title">Live on-request automation</div>
              <div class="story-meta">Cloudflare Workers run when a visitor opens the page. The portal refreshes live data and front-end sections every 5 minutes.</div>
            </div>
            <div class="story">
              <div class="story-title">Legal content model</div>
              <div class="story-meta">This portal only shows standings data, headline-level links, official federation links, and official YouTube embeds.</div>
            </div>
            <div class="story">
              <div class="story-title">Ready for SEO and ads</div>
              <div class="story-meta">Use the ad blocks below for AdSense, affiliate offers, sponsorships, or newsletter signups.</div>
            </div>
          </div>
        </section>

        <section class="ad-slot" id="monetization">
          <div class="ad-label">Ad slot / sponsorship</div>
          <div class="ad-copy">
            Replace this block with AdSense code, affiliate widgets, betting compliance banners, partner offers, or newsletter signup CTA.
          </div>
        </section>

        <section class="ad-slot">
          <div class="ad-label">Secondary monetization block</div>
          <div class="ad-copy">
            Suggested uses: merch affiliate links, streaming partners, ticket promotions, or sponsored club content.
          </div>
        </section>
      </aside>
    </div>
  </main>

  <footer class="footer">
    Sources used by this portal include official league data via API-Football, Tanjug RSS, the Football Association of Serbia website, and official YouTube channels.
  </footer>

  <script>
    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
      });
    }

    function formatDate(input) {
      if (!input) return "";
      const date = new Date(input);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleString("en-CA", {
        year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
      });
    }

    function renderTable(rows, elementId) {
      const target = document.getElementById(elementId);
      if (!rows || !rows.length) {
        target.innerHTML = '<tr><td colspan="3"><div class="empty">No standings available right now.</div></td></tr>';
        return;
      }
      target.innerHTML = rows.map(function (row) {
        const posClass = row.rank <= 4 ? "top4" : "mid";
        return '<tr>' +
          '<td><span class="pos ' + posClass + '">' + escapeHtml(row.rank) + '</span></td>' +
          '<td>' + escapeHtml(row.team) + '</td>' +
          '<td>' + escapeHtml(row.points) + '</td>' +
        '</tr>';
      }).join("");
    }

    function renderNews(items) {
      const target = document.getElementById("news-grid");
      if (!items || !items.length) {
        target.innerHTML = '<div class="empty">No news items available right now.</div>';
        return;
      }
      target.innerHTML = items.map(function (item) {
        return '<a class="news-item" href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener noreferrer">' +
          '<div>' +
            '<div class="news-source">' + escapeHtml(item.source || "Source") + '</div>' +
            '<div class="news-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="news-meta">' +
              (item.published ? '<span>' + escapeHtml(formatDate(item.published)) + '</span>' : '') +
              (item.note ? '<span>' + escapeHtml(item.note) + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="news-arrow">→</div>' +
        '</a>';
      }).join("");
    }

    function renderFss(items) {
      const target = document.getElementById("fss-list");
      if (!items || !items.length) {
        target.innerHTML = '<div class="empty">No FSS headlines available right now.</div>';
        return;
      }
      target.innerHTML = items.map(function (item) {
        return '<a class="story" href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener noreferrer">' +
          '<div class="story-title">' + escapeHtml(item.title) + '</div>' +
          '<div class="story-meta">' + escapeHtml(item.note || "Official federation link") + '</div>' +
        '</a>';
      }).join("");
    }

    function renderVideos(items) {
      const target = document.getElementById("video-grid");
      if (!items || !items.length) {
        target.innerHTML = '<div class="empty">No recent Serbian-football-related official videos were found in the last 7 days.</div>';
        return;
      }
      target.innerHTML = items.map(function (item) {
        return '<article class="video-card">' +
          '<iframe class="video-frame" src="https://www.youtube.com/embed/' + escapeHtml(item.videoId) + '" title="' + escapeHtml(item.title) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
          '<div class="video-body">' +
            '<div class="video-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="video-meta">' + escapeHtml(item.channelTitle || "") + (item.published ? ' · ' + escapeHtml(formatDate(item.published)) : '') + '</div>' +
          '</div>' +
        '</article>';
      }).join("");
    }

    async function getJson(path) {
      const response = await fetch(path, { headers: { "accept": "application/json" } });
      if (!response.ok) {
        throw new Error("Request failed for " + path + " (" + response.status + ")");
      }
      return response.json();
    }

    async function refreshPortal() {
      try {
        const [superliga, prva, news, fss, videos] = await Promise.all([
          getJson("/api/standings?league=286"),
          getJson("/api/standings?league=287"),
          getJson("/api/news"),
          getJson("/api/fss"),
          getJson("/api/videos"),
        ]);
        renderTable(superliga.rows || [], "superliga-body");
        renderTable(prva.rows || [], "prva-body");
        renderNews(news.items || []);
        renderFss(fss.items || []);
        renderVideos(videos.items || []);
      } catch (error) {
        console.error(error);
        document.getElementById("news-grid").innerHTML = '<div class="empty">Could not load live data right now. Try again in a minute.</div>';
        document.getElementById("fss-list").innerHTML = '<div class="empty">Could not load FSS headlines right now.</div>';
        document.getElementById("video-grid").innerHTML = '<div class="empty">Could not load videos right now.</div>';
      }
    }

    refreshPortal();
    setInterval(refreshPortal, 5 * 60 * 1000);
  </script>
</body>
</html>`;

function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "public, max-age=300");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function htmlResponse(html) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
}

function getApiKey(env) {
  return (env && env.FOOTBALL_API_KEY) || API_KEY_FALLBACK;
}

function stripCdata(value = "") {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function decodeEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(value = "") {
  return decodeEntities(stripCdata(String(value).replace(/<[^>]+>/g, " "))).replace(/\s+/g, " ").trim();
}

function absUrl(link, base) {
  try {
    return new URL(link, base).toString();
  } catch {
    return link;
  }
}

function takeUnique(items, key, limit) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const value = item[key];
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function parseRssItems(xml, limit = 8) {
  const items = [];
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRegex) || [];
  for (const block of blocks) {
    const title = cleanText((block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "");
    const link = cleanText((block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || "");
    const pubDate = cleanText((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || "");
    if (!title || !link) continue;
    items.push({
      title,
      link,
      published: pubDate ? new Date(pubDate).toISOString() : "",
      source: "Tanjug RSS",
      note: "Legal headline link"
    });
    if (items.length >= limit) break;
  }
  return items;
}

function parseYouTubeFeed(xml, channelTitleFallback = "") {
  const entries = [];
  const entryRegex = /<entry\b[\s\S]*?<\/entry>/gi;
  const blocks = xml.match(entryRegex) || [];
  for (const block of blocks) {
    const title = cleanText((block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "");
    const videoId = cleanText((block.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/i) || [])[1] || "");
    const published = cleanText((block.match(/<published>([\s\S]*?)<\/published>/i) || [])[1] || "");
    const author = cleanText((block.match(/<name>([\s\S]*?)<\/name>/i) || [])[1] || channelTitleFallback);
    if (!title || !videoId) continue;
    entries.push({
      title,
      videoId,
      published,
      channelTitle: author || channelTitleFallback
    });
  }
  return entries;
}

function parseFssLinks(html) {
  const items = [];
  const anchorRegex = /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[2] || "";
    const inner = cleanText(match[3] || "");
    if (!inner || inner.length < 18) continue;
    if (!/\/en\//i.test(href)) continue;
    if (/category|tag|author|page\//i.test(href)) continue;
    items.push({
      title: inner,
      link: absUrl(href, "https://fss.rs"),
      note: "Official FSS link"
    });
  }
  return takeUnique(items, "link", 6);
}

async function fetchStandings(leagueId, env) {
  const apiKey = getApiKey(env);
  const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/standings?league=${leagueId}&season=2024`, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Standings API failed (${response.status}): ${text.slice(0, 180)}`);
  }
  const data = await response.json();
  const table = data?.response?.[0]?.league?.standings?.[0] || [];
  const rows = table.map((item) => ({
    rank: item.rank,
    team: item.team?.name || "",
    points: item.points
  }));
  return { leagueId, rows };
}

async function fetchTanjugNews() {
  const response = await fetch("https://www.tanjug.rs/rss/sport/fudbal", {
    headers: { "accept": "application/rss+xml, application/xml, text/xml, text/plain, */*" }
  });
  if (!response.ok) throw new Error(`Tanjug RSS failed (${response.status})`);
  const xml = await response.text();
  return { items: parseRssItems(xml, 8) };
}

async function fetchFssNews() {
  const response = await fetch("https://fss.rs/en/", {
    headers: { "accept": "text/html,application/xhtml+xml" }
  });
  if (!response.ok) throw new Error(`FSS fetch failed (${response.status})`);
  const html = await response.text();
  return { items: parseFssLinks(html) };
}

function isWithinDays(dateString, days) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return (Date.now() - date.getTime()) <= days * 24 * 60 * 60 * 1000;
}

function looksSerbianFootball(title = "") {
  const t = title.toLowerCase();
  return [
    "serbia", "serbian", "srbija", "superliga", "prva liga", "red star", "crvena zvezda",
    "partizan", "vojvodina", "backa topola", "tsc", "cukaricki", "radnicki", "fss"
  ].some((keyword) => t.includes(keyword));
}

async function fetchVideos() {
  const urls = [
    {
      url: `https://www.youtube.com/feeds/videos.xml?channel_id=${SUPERLIGA_CHANNEL_ID}`,
      source: "SuperLigaRs1",
      mode: "recent"
    },
    {
      url: `https://www.youtube.com/feeds/videos.xml?channel_id=${DAZN_FOOTBALL_CHANNEL_ID}`,
      source: "DAZN Football",
      mode: "serbia-filter"
    }
  ];

  const results = await Promise.all(urls.map(async (item) => {
    try {
      const response = await fetch(item.url, { headers: { "accept": "application/atom+xml, application/xml, text/xml, */*" } });
      if (!response.ok) return [];
      const xml = await response.text();
      let entries = parseYouTubeFeed(xml, item.source).filter((entry) => isWithinDays(entry.published, 7));
      if (item.mode === "serbia-filter") {
        entries = entries.filter((entry) => looksSerbianFootball(entry.title));
      }
      return entries.map((entry) => ({ ...entry, source: item.source }));
    } catch {
      return [];
    }
  }));

  const merged = results.flat().sort((a, b) => new Date(b.published) - new Date(a.published));
  return { items: takeUnique(merged, "videoId", 4) };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/") return htmlResponse(HTML);

      if (url.pathname === "/api/standings") {
        const league = Number(url.searchParams.get("league") || SUPERLIGA_ID);
        if (![SUPERLIGA_ID, PRVA_ID].includes(league)) {
          return jsonResponse({ error: "Unsupported league" }, { status: 400 });
        }
        return jsonResponse(await fetchStandings(league, env));
      }

      if (url.pathname === "/api/news") {
        return jsonResponse(await fetchTanjugNews());
      }

      if (url.pathname === "/api/fss") {
        return jsonResponse(await fetchFssNews());
      }

      if (url.pathname === "/api/videos") {
        return jsonResponse(await fetchVideos());
      }

      if (url.pathname === "/health") {
        return jsonResponse({ ok: true, service: "serbian-football-portal" });
      }

      return new Response("Not found", { status: 404 });
    } catch (error) {
      return jsonResponse({ error: error.message || "Unknown error" }, { status: 500 });
    }
  }
};