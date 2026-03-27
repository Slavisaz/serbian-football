const API_BASE = 'https://v3.football.api-sports.io';
const TARGET_COUNTRY = 'Serbia';
const TARGET_LEAGUE_NAME = 'Super Liga';
const TARGET_SEASON = 2025;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (url.pathname === '/api/portal') {
      return handlePortal(env, ctx);
    }

    if (url.pathname === '/api/league-debug') {
      return handleLeagueDebug(env, ctx);
    }

    return new Response('Not found', {
      status: 404,
      headers: corsHeaders()
    });
  }
};

async function handlePortal(env, ctx) {
  try {
    if (!env.API_FOOTBALL_KEY) {
      throw new Error('Missing API_FOOTBALL_KEY secret in Cloudflare');
    }

    const league = await findSerbianSuperLiga(env);
    const leagueId = league.league.id;
    const leagueName = league.league.name;
    const season = TARGET_SEASON;

    const [standingsData, fixturesData, news] = await Promise.all([
      apiFootballRequest(
        env,
        '/standings',
        { league: String(leagueId), season: String(season) },
        600
      ),
      apiFootballRequest(
        env,
        '/fixtures',
        { league: String(leagueId), season: String(season), next: '8' },
        300
      ),
      fetchNews()
    ]);

    const standingsGroup =
      standingsData?.response?.[0]?.league?.standings?.[0] || [];

    const standings = standingsGroup.map((row, index) => ({
      rank: Number(row.rank || index + 1),
      team: {
        id: row.team?.id || '',
        name: row.team?.name || '',
        logo: row.team?.logo || '',
        badge: row.team?.logo || ''
      },
      points: Number(row.points || 0),
      played: Number(row.all?.played || 0),
      win: Number(row.all?.win || 0),
      draw: Number(row.all?.draw || 0),
      lose: Number(row.all?.lose || 0),
      goalsFor: Number(row.all?.goals?.for || 0),
      goalsAgainst: Number(row.all?.goals?.against || 0),
      goalDiff: Number(row.goalsDiff || 0),
      form: row.form || '',
      description: row.description || ''
    }));

    const fixtures = (fixturesData?.response || []).map((match) => ({
      fixture: {
        id: match.fixture?.id || null,
        date: match.fixture?.date || '',
        status: {
          short: match.fixture?.status?.short || '',
          elapsed: match.fixture?.status?.elapsed ?? null
        },
        venue: {
          name: match.fixture?.venue?.name || ''
        },
        round: match.league?.round || ''
      },
      league: {
        id: match.league?.id || leagueId,
        name: match.league?.name || leagueName,
        season: match.league?.season || season
      },
      teams: {
        home: {
          id: match.teams?.home?.id || null,
          name: match.teams?.home?.name || '',
          logo: match.teams?.home?.logo || ''
        },
        away: {
          id: match.teams?.away?.id || null,
          name: match.teams?.away?.name || '',
          logo: match.teams?.away?.logo || ''
        }
      },
      goals: {
        home: match.goals?.home,
        away: match.goals?.away
      }
    }));

    const live = fixtures.filter(
      (m) => ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'INT'].includes(m.fixture.status.short)
    );

    const mainTeams = standings.slice(0, 4).map((t) => ({
      id: t.team.id,
      name: t.team.name,
      logo: t.team.logo,
      points: t.points,
      rank: t.rank,
      played: t.played,
      form: t.form
    }));

    return json({
      meta: {
        league: leagueId,
        leagueName,
        country: TARGET_COUNTRY,
        season,
        source: 'API-Football + RSS',
        updatedAt: new Date().toISOString(),
        standingsCount: standings.length
      },
      live,
      fixtures,
      standings,
      mainTeams,
      news,
      ai: {
        summary: standings.length
          ? `${standings[0].team.name} lead the table right now.`
          : 'Standings are temporarily unavailable.',
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
      fixtures: [],
      live: [],
      news: { items: [] }
    }, 500);
  }
}

async function handleLeagueDebug(env, ctx) {
  try {
    if (!env.API_FOOTBALL_KEY) {
      throw new Error('Missing API_FOOTBALL_KEY secret in Cloudflare');
    }

    const leaguesData = await apiFootballRequest(
      env,
      '/leagues',
      { country: TARGET_COUNTRY, season: String(TARGET_SEASON) },
      3600
    );

    const leagues = (leaguesData?.response || []).map((item) => ({
      id: item.league?.id,
      name: item.league?.name,
      type: item.league?.type,
      country: item.country?.name,
      season: item.seasons?.find((s) => s.year === TARGET_SEASON)?.year || TARGET_SEASON
    }));

    return json({ leagues });
  } catch (err) {
    return json({ error: String(err.message || err) }, 500);
  }
}

async function findSerbianSuperLiga(env) {
  const leaguesData = await apiFootballRequest(
    env,
    '/leagues',
    { country: TARGET_COUNTRY, season: String(TARGET_SEASON) },
    3600
  );

  const candidates = leaguesData?.response || [];

  const exact = candidates.find(
    (item) =>
      String(item.country?.name || '').toLowerCase() === 'serbia' &&
      String(item.league?.name || '').toLowerCase() === 'super liga'
  );

  if (exact) return exact;

  const fuzzy = candidates.find((item) =>
    String(item.league?.name || '').toLowerCase().includes('super')
  );

  if (fuzzy) return fuzzy;

  throw new Error('Could not find Serbian Super Liga in API-Football leagues endpoint');
}

async function apiFootballRequest(env, path, params = {}, cacheSeconds = 300) {
  const qs = new URLSearchParams(params).toString();
  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': env.API_FOOTBALL_KEY
    },
    cf: {
      cacheTtl: cacheSeconds,
      cacheEverything: false
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API-Football ${path} failed: ${response.status} ${text}`);
  }

  return await response.json();
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
      .map((match) => {
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
  return match ? match[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
}

function stripHtml(text) {
  return String(text || '').replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
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

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-type': 'application/json; charset=utf-8'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      'cache-control': 'no-cache'
    }
  });
}
