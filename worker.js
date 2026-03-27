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
    // Serbian SuperLiga ID (TheSportsDB)
    const LEAGUE_ID = 4671;
    const SEASON = '2025-2026';

    // === FETCH STANDINGS ===
    const standingsRes = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${LEAGUE_ID}&s=${SEASON}`
    );

    const standingsJson = await standingsRes.json();

    const rawTable = standingsJson.table || [];

    // ✅ FULL TABLE (no slicing, no limit)
    const standings = rawTable.map(row => ({
      rank: Number(row.intRank),
      team: {
        id: row.idTeam,
        name: row.strTeam,
        logo: row.strBadge,
        badge: row.strBadge
      },
      points: Number(row.intPoints),
      played: Number(row.intPlayed),
      win: Number(row.intWin),
      draw: Number(row.intDraw),
      lose: Number(row.intLoss),
      goalsFor: Number(row.intGoalsFor),
      goalsAgainst: Number(row.intGoalsAgainst),
      goalDiff: Number(row.intGoalDifference),
      form: row.strForm || ''
    }));

    // === MAIN TEAMS (top 4) ===
    const mainTeams = standings.slice(0, 4).map(t => ({
      id: t.team.id,
      name: t.team.name,
      logo: t.team.logo,
      points: t.points,
      rank: t.rank,
      played: t.played,
      form: t.form
    }));

    // === NEWS (FSS RSS) ===
    const news = await fetchNews();

    // === RESPONSE ===
    return json({
      meta: {
        league: LEAGUE_ID,
        season: SEASON,
        source: 'TheSportsDB + RSS',
        updatedAt: new Date().toISOString()
      },
      live: [],
      fixtures: [],
      standings,
      mainTeams,
      news,
      ai: {
        summary: 'Live data is online. No Serbian Super Liga match is live right now.',
        chips: [
          `Leader: ${standings[0]?.team.name || ''}`,
          `${standings[0]?.points || 0} pts`,
          `${mainTeams.length} main teams loaded`
        ]
      }
    });

  } catch (err) {
    return json({
      error: String(err.message || err)
    }, 500);
  }
}

// === NEWS FETCH ===
async function fetchNews() {
  try {
    const rss = await fetch('https://fss.rs/en/feed/');
    const xml = await rss.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 8)
      .map(match => {
        const item = match[1];

        return {
          title: extract(item, 'title'),
          link: extract(item, 'link'),
          summary: extract(item, 'description'),
          pubDate: extract(item, 'pubDate'),
          source: 'Football Association of Serbia'
        };
      });

    return { items };

  } catch {
    return { items: [] };
  }
}

// === HELPERS ===
function extract(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'i'));
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '') : '';
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-cache'
    }
  });
}
