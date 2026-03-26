const API_URL = '/api/news';

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadNews() {
  const ticker = document.getElementById('ticker');
  const featuredTitle = document.getElementById('featuredTitle');
  const featuredSource = document.getElementById('featuredSource');
  const newsList = document.getElementById('newsList');

  try {
    const res = await fetch(API_URL, { headers: { 'accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      ticker.textContent = 'No Serbian football headlines found right now.';
      featuredTitle.textContent = 'No football headlines available';
      featuredSource.textContent = 'Try again later';
      newsList.innerHTML = '<div class="news-item">No Serbian football articles were returned by the feeds.</div>';
      return;
    }

    ticker.textContent = items.slice(0, 6).map(x => x.title).join(' • ');

    const first = items[0];
    featuredTitle.textContent = first.title;
    featuredSource.textContent = `${first.source} • ${first.pubDate || 'Latest feed item'}`;

    newsList.innerHTML = items.map(item => `
      <article class="news-item">
        <h3><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.summary || 'Open the source article for full details.')}</p>
        <div class="meta">${escapeHtml(item.source)}${item.pubDate ? ' • ' + escapeHtml(item.pubDate) : ''}</div>
      </article>
    `).join('');
  } catch (err) {
    console.error(err);
    ticker.textContent = 'News API is not connected.';
    featuredTitle.textContent = 'Connect the Worker API';
    featuredSource.textContent = 'Your page updated, but the API endpoint is missing or still old.';
    newsList.innerHTML = '<div class="news-item">The front-end loaded, but <strong>/api/news</strong> is not responding from your current deployment.</div>';
  }
}

loadNews();
