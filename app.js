const CONFIG = {
  apiBase: window.SERBIAN_FOOTBALL_API_BASE || '',
  leagueId: 4671,
  season: '2025-2026',
  refreshMs: 60000,
};

const qs = (id) => document.getElementById(id);

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatStatus(fixture) {
  const status = fixture?.fixture?.status;
  if (!status) return 'Scheduled';
  if (status.elapsed) return `${status.short || 'LIVE'} • ${status.elapsed}'`;
  return status.long || status.short || 'Scheduled';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'TBC';
  return date.toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderTicker(items = []) {
  const ticker = qs('ticker');
  if (!items.length) {
    ticker.textContent = 'No live headlines or scores available right now.';
    return;
  }

  ticker.innerHTML = items.map((item) => escapeHtml(item)).join(' • ');
}

function renderLive(fixtures = []) {
  const root = qs('liveList');
  qs('liveCount').textContent = `${fixtures.length} ${fixtures.length === 1 ? 'match' : 'matches'}`;

  if (!fixtures.length) {
    root.innerHTML = '<div class="empty-state">No Serbian SuperLiga matches are live at this moment.</div>';
    return;
  }

  root.innerHTML = fixtures.map((match) => {
    const home = match.teams.home || {};
    const away = match.teams.away || {};
    const goals = match.goals || {};

    return `
      <article class="match-card">
        <div class="match-top">
          <span class="match-status">${escapeHtml(formatStatus(match))}</span>
          <span class="team-meta">${escapeHtml(match.fixture?.round || match.league?.name || 'Serbia')}</span>
        </div>
        <div class="match-body">
          <div class="team-block">
            <img class="team-logo" src="${escapeHtml(home.logo || '')}" alt="${escapeHtml(home.name || 'Home')}" />
            <div>
              <div class="team-name">${escapeHtml(home.name || 'Home')}</div>
              <div class="team-meta">${escapeHtml(match.fixture?.venue?.name || 'Home')}</div>
            </div>
          </div>
          <div class="score-box">${goals.home ?? 0} - ${goals.away ?? 0}</div>
          <div class="team-block away">
            <div>
              <div class="team-name">${escapeHtml(away.name || 'Away')}</div>
              <div class="team-meta">${escapeHtml(match.fixture?.status?.short || '')}</div>
            </div>
            <img class="team-logo" src="${escapeHtml(away.logo || '')}" alt="${escapeHtml(away.name || 'Away')}" />
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderFixtures(fixtures = []) {
  const root = qs('fixturesList');
  if (!fixtures.length) {
    root.innerHTML = '<div class="empty-state">No upcoming fixtures found.</div>';
    return;
  }

  root.innerHTML = fixtures.map((match) => `
    <article class="fixture-card">
      <div class="fixture-top">
        <strong>${escapeHtml(match.teams?.home?.name || 'Home')} vs ${escapeHtml(match.teams?.away?.name || 'Away')}</strong>
        <span class="fixture-when">${escapeHtml(formatDate(match.fixture?.date))}</span>
      </div>
      <div class="fixture-when">${escapeHtml(match.fixture?.round || 'SuperLiga')} · ${escapeHtml(match.fixture?.venue?.name || 'Venue TBC')}</div>
    </article>
  `).join('');
}

function renderStandings(standings = []) {
  const root = qs('standingsTable');
  if (!standings.length) {
    root.innerHTML = '<div class="empty-state">Standings are not available.</div>';
    return;
  }

  root.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Club</th>
          <th>P</th>
          <th>Pts</th>
          <th>GD</th>
          <th>Form</th>
        </tr>
      </thead>
      <tbody>
        ${standings.map((row) => `
          <tr>
            <td class="rank">${escapeHtml(String(row.rank ?? ''))}</td>
            <td>
              <div class="team-block">
                <img class="team-logo" src="${escapeHtml(row.team?.logo || row.team?.badge || '')}" alt="${escapeHtml(row.team?.name || '')}" />
                <span class="team-name">${escapeHtml(row.team?.name || '')}</span>
              </div>
            </td>
            <td>${escapeHtml(String(row.played ?? 0))}</td>
            <td><strong>${escapeHtml(String(row.points ?? 0))}</strong></td>
            <td>${escapeHtml(String(row.goalDiff ?? 0))}</td>
            <td>${escapeHtml(row.form || '-')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTeams(teams = []) {
  const root = qs('teamsGrid');
  if (!teams.length) {
    root.innerHTML = '<div class="empty-state">Main teams unavailable.</div>';
    return;
  }

  root.innerHTML = teams.map((team) => `
    <article class="team-card">
      <div class="team-card-top">
        <img class="team-logo" src="${escapeHtml(team.logo || '')}" alt="${escapeHtml(team.name || '')}" />
        <div>
          <div class="team-name">${escapeHtml(team.name || '')}</div>
          <div class="team-meta">Rank ${escapeHtml(String(team.rank ?? '-'))} · ${escapeHtml(String(team.points ?? 0))} pts</div>
        </div>
      </div>
      <div class="team-form">${escapeHtml(team.form || '-')}</div>
    </article>
  `).join('');
}

function renderNews(items = []) {
  const featured = qs('featuredStory');
  const list = qs('newsList');

  if (!items.length) {
    featured.innerHTML = '';
    list.innerHTML = '<div class="empty-state">No news stories available.</div>';
    return;
  }

  const [first, ...rest] = items;
  featured.innerHTML = `
    <a class="story-card featured" href="${escapeHtml(first.link || '#')}" target="_blank" rel="noopener noreferrer">
      <div class="story-title">${escapeHtml(first.title || '')}</div>
      <div class="story-summary">${escapeHtml(first.summary || 'Latest Serbian football update.')}</div>
      <div class="news-source">${escapeHtml(first.source || 'Source')} · ${escapeHtml(first.pubDate || '')}</div>
    </a>
  `;

  list.innerHTML = rest.slice(0, 5).map((item) => `
    <a class="story-card" href="${escapeHtml(item.link || '#')}" target="_blank" rel="noopener noreferrer">
      <div class="story-title">${escapeHtml(item.title || '')}</div>
      <div class="news-source">${escapeHtml(item.source || 'Source')}</div>
    </a>
  `).join('');
}

function renderAI(ai = {}) {
  qs('aiSummary').textContent = ai.summary || 'AI insight will appear when live data is available.';
  qs('aiChips').innerHTML = (ai.chips || []).map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join('');
}

function setRefreshLabel() {
  qs('refreshLabel').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

async function loadPortal() {
  try {
    const url = `${CONFIG.apiBase}/api/portal?league=${CONFIG.leagueId}&season=${encodeURIComponent(CONFIG.season)}&v=${Date.now()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load portal data');
    }

    const tickerItems = [
      ...(data.live || []).slice(0, 3).map((match) => `${match.teams.home.name} ${match.goals.home ?? 0}-${match.goals.away ?? 0} ${match.teams.away.name}`),
      ...(data.news?.items || []).slice(0, 4).map((item) => item.title),
    ];

    renderTicker(tickerItems);
    renderLive(data.live || []);
    renderFixtures(data.fixtures || []);
    renderStandings(data.standings || []);
    renderTeams(data.mainTeams || []);
    renderNews(data.news?.items || []);
    renderAI(data.ai || {});
    setRefreshLabel();
  } catch (error) {
    console.error(error);
    qs('ticker').textContent = 'Unable to load live portal data. Check worker deployment.';
    qs('aiSummary').textContent = error.message || 'Live data unavailable.';
  }
}

loadPortal();
setInterval(loadPortal, CONFIG.refreshMs);
