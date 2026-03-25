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

function storyCard(item) {
  return `
    <article class="story">
      <div class="story-thumb">
        <img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">
      </div>
      <div class="story-body">
        <a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a>
        <div class="story-meta">
          <span class="story-badge">Media</span>
          ${esc(item.source)} · ${esc(timeAgo(item.dateTs))}
        </div>
      </div>
    </article>
  `;
}

async function loadNews() {
  const hero = document.getElementById("hero-content");
  const aiNews = document.getElementById("ai-news");
  const topNews = document.getElementById("top-news");

  if (!hero || !aiNews || !topNews) {
    console.error("Missing required page elements: hero-content / ai-news / top-news");
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
        <h1 class="hero-title">No Serbian football stories available right now</h1>
        <div class="hero-meta">Please check back later</div>
      `;
      aiNews.innerHTML = `<div class="panel-body empty">No stories available.</div>`;
      topNews.innerHTML = `<div class="panel-body empty">No stories available.</div>`;
      return;
    }

    const first = news[0];

    hero.innerHTML = `
      <h1 class="hero-title">${esc(first.title)}</h1>
      <div class="hero-meta">${esc(first.source)} · ${esc(timeAgo(first.dateTs))}</div>
    `;

    aiNews.innerHTML = news
      .slice(0, 3)
      .map(storyCard)
      .join("");

    topNews.innerHTML = news
      .slice(3, 5)
      .map(storyCard)
      .join("") || `<div class="panel-body empty">More stories soon.</div>`;
  } catch (err) {
    console.error(err);

    hero.innerHTML = `
      <h1 class="hero-title">Error loading Serbian football news</h1>
      <div class="hero-meta">Please refresh the page</div>
    `;
    aiNews.innerHTML = `<div class="panel-body empty">Feed error.</div>`;
    topNews.innerHTML = `<div class="panel-body empty">Feed error.</div>`;
  }
}

loadNews();
setInterval(loadNews, 300000);
