const newsGrid = document.getElementById('newsGrid');
const statusLine = document.getElementById('statusLine');
const featuredCard = document.getElementById('featuredCard');
const tickerTrack = document.getElementById('tickerTrack');
const refreshBtn = document.getElementById('refreshBtn');

const API_URL = '/api/news';

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function renderFeatured(item) {
  if (!item) {
    featuredCard.className = 'featured-card';
    featuredCard.innerHTML = '<div class="empty-state">No featured story is available right now.</div>';
    return;
  }

  const summary = item.summary || 'Open the article for full details.';
  featuredCard.className = 'featured-card';
  featuredCard.innerHTML = `
    <div class="featured-source">${escapeHtml(item.source)}</div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(summary)}</p>
    <div class="featured-meta">
      <span class="tag">Football</span>
      <span class="tag">Serbia</span>
      <span>${escapeHtml(formatDate(item.pubDate))}</span>
      <a class="read-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Read story</a>
    </div>
  `;
}

function renderTicker(items) {
  if (!items.length) {
    tickerTrack.innerHTML = '<span>No live football headlines found.</span>';
    return;
  }

  const chunks = items.slice(0, 10).map((item) =>
    `<span>${escapeHtml(item.title)}</span>`
  );
  tickerTrack.innerHTML = chunks.join('<span>•</span>');
}

function renderGrid(items) {
  if (!items.length) {
    newsGrid.innerHTML = '<div class="empty-state">No Serbian football stories were found in the feeds right now.</div>';
    return;
  }

  newsGrid.innerHTML = items.map((item) => {
    const summary = item.summary || 'Open the article for full details.';
    return `
      <article class="news-card">
        <div class="source">${escapeHtml(item.source)}</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(summary)}</p>
        <div class="meta">
          <span>${escapeHtml(formatDate(item.pubDate))}</span>
          <a class="read-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      </article>
    `;
  }).join('');
}

async function loadNews() {
  statusLine.textContent = 'Loading latest headlines…';
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Loading…';

  try {
    const response = await fetch(API_URL, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    renderFeatured(items[0]);
    renderTicker(items);
    renderGrid(items);

    const fetchedAt = data.generatedAt ? formatDate(data.generatedAt) : 'just now';
    statusLine.textContent = `${items.length} Serbian football stories loaded. Updated ${fetchedAt}.`;
  } catch (error) {
    console.error(error);
    renderFeatured(null);
    renderTicker([]);
    newsGrid.innerHTML = '<div class="empty-state">Could not load live news. Check your Worker deployment or try again.</div>';
    statusLine.textContent = 'Live news could not be loaded.';
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh';
  }
}

refreshBtn.addEventListener('click', loadNews);
loadNews();
