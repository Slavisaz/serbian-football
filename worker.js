export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/portal') {
      return handlePortal();
    }

    return new Response('Not found', { status: 404 });
  }
};

async function handlePortal() {
  try {
    const LEAGUE_ID = 4671;
    const SEASON = '2025-2026';

    const standingsRes = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${LEAGUE_ID}&s=${SEASON}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!standingsRes.ok) {
      throw new Error(`Standings request failed: ${standingsRes.status}`);
    }

    const standingsJson = await standingsRes.json();
    const rawTable = Array.isArray(standingsJson.table) ? standingsJson.table : [];

    const standings = rawTable.map((row, index) => ({
      rank: Number(row.intRank || index + 1),
      team: {
        id: row.idTeam || '',
        name: row.strTeam || '',
        logo: row.strBadge || '',
        badge: row.strBadge || ''
      },
      points: Number(row.intPoints || 0),
      played: Number(row.intPlayed || 0),
      win: Number(row.intWin || 0),
      draw: Number(row.intDraw || 0),
      lose: Number(row.intLoss || 0),
      goalsFor: Number(row.intGoalsFor || 0),
      goalsAgainst: Number(row.intGoalsAgainst || 0),
      goalDiff: Number(
        row.intGoalDifference ??
        (Number(row.intGoalsFor || 0) - Number(row.intGoalsAgainst || 0))
      ),
      form: row.strForm || ''
    }));

    const mainTeams = standings.slice(0, 4).map(t => ({
      id: t.team.id,
      name: t.team.name,
      logo: t.team.logo,
      points: t.points,
      rank: t.rank,
      played: t.played,
      form: t.form
    }));

    const news = await fetchNews();

    return json({
      meta: {
        league: LEAGUE_ID,
        season: SEASON,
        source: 'TheSportsDB + RSS',
        updatedAt: new Date().toISOString(),
        standingsCount: standings.length
      },
      live: [],
      fixtures: [],
      standings,
      mainTeams,
      news,
      ai: {
        summary: standings.length
          ? `Live data is online. ${standings[0].team.name} lead the table right now.`
          : 'Live data is online, but standings are temporarily unavailable.',
        chips: [
          `Leader: ${standings[0]?.team.name || 'N/A'}`,
          `${standings[0]?.points || 0} pts`,
          `${standings.length} teams loaded`
        ]
      }
    });
  } catch (err) {
    return json({
      error: String(err.message || err),
      standings: [],
      mainTeams: [],
      news: { items: [] }
    }, 500);
  }
}

async function fetchNews() {
  try {
    const rss = await fetch('https://fss.rs/en/feed/', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!rss.ok) {
      throw new Error(`RSS failed: ${rss.status}`);
    }

    const xml = await rss.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
      .slice(0, 8)
      .map(match => {
        const item = match[1];

        return {
          title: decodeHtml(extract(item, 'title')),
          link: extract(item, 'link'),
          summary: decodeHtml(stripHtml(extract(item, 'description'))),
          pubDate: extract(item, 'pubDate'),
          source: 'Football Association of Serbia'
        };
      });

    return { items };
  } catch {
    return { items: [] };
  }
}

function extract(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
}

function stripHtml(text) {
  return String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtml(text) {
  return String(text || '')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache',
      'access-control-allow-origin': '*'
    }
  });
}
