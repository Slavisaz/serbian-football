async function loadStandings() {
  const res = await fetch('/api/standings');
  const data = await res.json();
  const list = document.getElementById('table');
  list.innerHTML = data.map(t => `<li>${t.position}. ${t.team} - ${t.points} pts</li>`).join('');
}

async function loadNews() {
  const res = await fetch('/api/news');
  const data = await res.json();
  const list = document.getElementById('news-list');
  list.innerHTML = data.map(n => `<li><a href="${n.link}" target="_blank">${n.title}</a></li>`).join('');
}

async function loadVideos() {
  const res = await fetch('/api/videos');
  const data = await res.json();
  const container = document.getElementById('video-container');
  container.innerHTML = data.map(v => `<iframe width="300" height="170" src="https://www.youtube.com/embed/${v.id}" frameborder="0" allowfullscreen></iframe>`).join('');
}

loadStandings();
loadNews();
loadVideos();
