function esc(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function timeAgo(ts) {
  if (!ts) return "recent";

  const diff = Math.floor((Date.now() - ts) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function renderHero(item) {
  return `
    <div class="hero-card">
      <img src="${esc(item.image)}" class="hero-img" alt="${esc(item.title)}">
      <div class="hero-overlay">
        <span class="badge">LATEST NEWS</span>
        <h1>${esc(item.title)}</h1>
        <p>${esc(item.source)} · ${esc(timeAgo(item.dateTs))}</p>
      </div>
    </div>
  `;
}

function renderNewsItem(item) {
  return `
    <div class="news-item">
      <img src="${esc(item.image)}" alt="${esc(item.title)}" />
      <div>
        <div class="news-title">
          <a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a>
        </div>
        <div class="news-meta">${esc(item.source)} · ${esc(timeAgo(item.dateTs))}</div>
      </div>
    </div>
  `;
}

async function render() {
  const hero = document.getElementById("hero");
  const sidebar = document.getElementById("news-list");

  if (!hero || !sidebar) {
    console.error("Missing #hero or #news-list in index.html");
    return;
  }

  try {
    const res = await fetch("/api/news", { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Feed request failed");
    }

    const news = await res.json();

    if (!Array.isArray(news) || news.length === 0) {
      hero.innerHTML = `
        <div class="hero-card">
          <div class="hero-overlay">
            <span class="badge">LATEST NEWS</span>
            <h1>No Serbian football stories available right now</h1>
            <p>Please check back later</p>
          </div>
        </div>
      `;
      sidebar.innerHTML = `<p>No stories available.</p>`;
      return;
    }

    hero.innerHTML = renderHero(news[0]);
    sidebar.innerHTML = news.map(renderNewsItem).join("");
  } catch (err) {
    console.error(err);

    hero.innerHTML = `
      <div class="hero-card">
        <div class="hero-overlay">
          <span class="badge">LATEST NEWS</span>
          <h1>Error loading Serbian football news</h1>
          <p>Please refresh the page</p>
        </div>
      </div>
    `;
    sidebar.innerHTML = `<p>No stories available.</p>`;
  }
}

render();
setInterval(render, 300000);
