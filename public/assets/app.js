async function getJson(path) {
  const res = await fetch(path, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return await res.json();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadNews() {
  const leadTitle = document.querySelector('.lead-title');
  const leadSource = document.querySelector('.lead-source');
  const grid = document.querySelector('#newsGrid');

  try {
    const data = await getJson('/api/news');
    if (!Array.isArray(data) || !data.length) {
      leadTitle.textContent = 'No live official news available';
      leadSource.textContent = 'Official source unavailable right now';
      grid.innerHTML = '';
      return;
    }

    const first = data[0];
    leadTitle.innerHTML = `<a href="${escapeHtml(first.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(first.title)}</a>`;
    leadSource.textContent = first.source || 'Official source';

    if (first.original && first.original !== first.title) {
      leadSource.insertAdjacentHTML('afterend', `<div class="original-title">${escapeHtml(first.original)}</div>`);
    }

    grid.innerHTML = '';
    data.slice(1).forEach(item => {
      const article = document.createElement('article');
      article.className = 'news-card';
      article.innerHTML = `
        <h3><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
        ${item.original && item.original !== item.title ? `<div class="muted" style="margin-bottom:10px;font-size:13px;">${escapeHtml(item.original)}</div>` : ''}
        <p>${escapeHtml(item.source || 'Official source')}</p>
      `;
      grid.appendChild(article);
    });
  } catch (err) {
    leadTitle.textContent = 'News unavailable';
    leadSource.textContent = err.message;
    grid.innerHTML = `<div class="error">Could not load official headlines.</div>`;
  }
}

async function loadStandings() {
  const body = document.querySelector('#standingsBody');
  try {
    const data = await getJson('/api/standings');
    body.innerHTML = '';
    if (!Array.isArray(data) || !data.length) {
      body.innerHTML = `<tr><td colspan="3">No live standings available</td></tr>`;
      return;
    }
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.position}</td><td>${escapeHtml(row.team)}</td><td>${row.points}</td>`;
      body.appendChild(tr);
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="3">Standings unavailable</td></tr>`;
  }
}

async function loadResults() {
  const list = document.querySelector('#resultsList');
  try {
    const data = await getJson('/api/results');
    list.innerHTML = '';
    if (!Array.isArray(data) || !data.length) {
      list.innerHTML = `<div class="muted">No official results available right now.</div>`;
      return;
    }
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'result-card';
      div.innerHTML = `
        <div class="result-date">${escapeHtml(item.date || '')}</div>
        <div>
          <div class="result-match">${escapeHtml(item.home)} vs ${escapeHtml(item.away)}</div>
          <div class="muted">${escapeHtml(item.venue || '')}</div>
        </div>
        <div class="result-score">${escapeHtml(item.score || '')}</div>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = `<div class="error">Could not load official results.</div>`;
  }
}

async function loadVideo() {
  const shell = document.querySelector('#videoShell');
  try {
    const data = await getJson('/api/videos');
    if (!Array.isArray(data) || !data.length || !data[0].id) {
      shell.textContent = 'No official video available right now';
      return;
    }
    const first = data[0];
    shell.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${encodeURIComponent(first.id)}"
        title="${escapeHtml(first.title || 'Official Serbian football video')}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
  } catch (err) {
    shell.textContent = 'Could not load official video';
  }
}

Promise.all([loadNews(), loadStandings(), loadResults(), loadVideo()]);
