const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';
const DEFAULT_LEAGUE = 286; // Serbia Super Liga
const DEFAULT_SEASON = 2025;
const DEFAULT_MAIN_TEAMS = [598, 573, 702, 2633];

const FEEDS = [
  { url: 'https://fss.rs/en/feed/', source: 'Football Association of Serbia' },
  { url: 'https://www.tanjug.rs/rss/english/sports', source: 'Tanjug English Sports' },
  { url: 'https://www.b92.net/rss/b92/english', source: 'B92 English' },
];

const FOOTBALL_WORDS = [
  'football', 'soccer', 'superliga', 'super liga', 'partizan', 'red star', 'crvena zvezda',
  'vojvodina', 'ofk beograd', 'radnicki', 'cukaricki', 'novi pazar', 'napredak', 'tsc',
  'mladost', 'imt', 'serbia', 'serbian', 'fudbal', 'cup', 'national team'
];

function json(data, status = 200, maxAge = 60) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'cache-control': `public, max-age=${maxAge}`,
    },
  });
}

function cleanText(text = '') {
  return text
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRss(xml, source) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => match[1]);
  return items.map((item) => {
    const pick = (tag) => {
      const found = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return found ? cleanText(found[1]) : '';
    };

    return {
      title: pick('title'),
      link: pick('link'),
      summary: pick('description'),
      pubDate: pick('pubDate'),
      source,
    };
  });
}

function looksRelevant(item) {
  const hay = `${item.title} ${item.summary}`.toLowerCase();
  return FOOTBALL_WORDS.some((word) => hay.includes(word));
}

async function fetchNews() {
  const results = await Promise.all(FEEDS.map(async (feed) => {
    const response = await fetch(feed.url, {
      headers: { 'User-Agent': 'SerbianFootballPortal/2.0' },
      cf: { cacheTtl: 900, cacheEverything: true },
    });
    const text = await response.text();
    return parseRss(text, feed.source);
  }));

  const items = results.flat()
    .filter((item) => item.title && item.link)
    .filter(looksRelevant)
    .filter((item, index, array) => array.findIndex((candidate) => candidate.link === item.link) === index)
    .slice(0, 8);

  return { items };
}

async function footballRequest(path, apiKey) {
  const response = await fetch(`${FOOTBALL_API_BASE}${path}`, {
    headers: {
      'x-apisports-key': apiKey,
      'Accept': 'application/json',
    },
    cf: { cacheTtl: 60, cacheEverything: false },
  });

  const data = await response.json();
  if (!response.ok || data.errors?.token || data.errors?.requests) {
    throw new Error(data.errors?.token || data.errors?.requests || `API-FOOTBALL error on ${path}`);
  }
  return data.response || [];
}

function buildAiSummary({ live, fixtures, standings, mainTeams }) {
  const chips = [];

  if (live.length) {
    const mainMatch = live[0];
    const elapsed = mainMatch.fixture?.status?.elapsed ? `${mainMatch.fixture.status.elapsed}'` : mainMatch.fixture?.status?.short || 'live';
    chips.push(`${live.length} live now`);
    chips.push(`Main pulse: ${mainMatch.teams.home.name} ${mainMatch.goals.home}-${mainMatch.goals.away} ${mainMatch.teams.away.name}`);

    return {
      summary: `${mainMatch.teams.home.name} lead ${mainMatch.teams.away.name} ${mainMatch.goals.home}-${mainMatch.goals.away} in ${elapsed}. ${live.length > 1 ? `There are ${live.length} live Serbian matches being tracked right now.` : 'This is the only live Serbian match at the moment.'}`,
      chips,
    };
  }

  if (standings.length) {
    chips.push(`Table leader: ${standings[0].team.name}`);
    if (fixtures.length) {
      const next = fixtures[0];
      chips.push(`Next: ${next.teams.home.name} vs ${next.teams.away.name}`);
      return {
        summary: `${standings[0].team.name} top the SuperLiga on ${standings[0].points} points. The next scheduled match is ${next.teams.home.name} vs ${next.teams.away.name} on ${new Date(next.fixture.date).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,
        chips,
      };
    }
  }

  if (mainTeams.length) {
    chips.push(`${mainTeams.length} core teams loaded`);
  }

  return {
    summary: 'Live data is online, but no live SuperLiga match is active right now. The widget will automatically switch to live commentary when matches start.',
    chips,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, OPTIONS',
          'access-control-allow-headers': 'content-type',
        },
      });
    }

    if (url.pathname === '/api/news') {
      try {
        const news = await fetchNews();
        return json(news, 200, 900);
      } catch (error) {
        return json({ items: [], error: String(error.message || error) }, 500, 30);
      }
    }

    if (url.pathname === '/api/portal') {
      const apiKey = env.API_FOOTBALL_KEY;
      if (!apiKey) {
        return json({ error: 'Missing API_FOOTBALL_KEY secret in Cloudflare Worker.' }, 500, 30);
      }

      const league = Number(url.searchParams.get('league') || DEFAULT_LEAGUE);
      const season = Number(url.searchParams.get('season') || DEFAULT_SEASON);
      const teams = (url.searchParams.get('teams') || DEFAULT_MAIN_TEAMS.join(','))
        .split(',')
        .map((value) => Number(value.trim()))
        .filter(Boolean);

      try {
        const [liveAll, fixtures, standingsResponse, teamsResponse, news] = await Promise.all([
          footballRequest('/fixtures?live=all', apiKey),
          footballRequest(`/fixtures?league=${league}&season=${season}&next=6`, apiKey),
          footballRequest(`/standings?league=${league}&season=${season}`, apiKey),
          footballRequest(`/teams?league=${league}&season=${season}`, apiKey),
          fetchNews(),
        ]);

        const live = liveAll.filter((fixture) => Number(fixture.league?.id) === league);
        const standings = standingsResponse?.[0]?.league?.standings?.[0] || [];
        const allTeams = teamsResponse.map((entry) => ({
          ...entry.team,
          venue: entry.venue,
        }));
        const mainTeams = teams.map((id) => allTeams.find((team) => Number(team.id) === id)).filter(Boolean);
        const ai = buildAiSummary({ live, fixtures, standings, mainTeams });

        return json({
          meta: {
            league,
            season,
            source: 'API-FOOTBALL + RSS',
            updatedAt: new Date().toISOString(),
          },
          live,
          fixtures,
          standings,
          mainTeams,
          news,
          ai,
        }, 200, 60);
      } catch (error) {
        return json({ error: String(error.message || error) }, 500, 30);
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
