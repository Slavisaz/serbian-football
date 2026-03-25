const FALLBACK_THUMBS = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=600&q=80"
];

function esc(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function thumbForIndex(index) {
  return FALLBACK_THUMBS[index % FALLBACK_THUMBS.length];
}

function timeAgo(ts) {
  if (!ts) return "recent";

  const diff = Math.floor((Date.now() - ts) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function badgeLabel(type) {
  return type === "official" ? "Official" : "Media";
}

function storyCard(item, index) {
  const thumb = item.image || thumbForIndex(index);

  return `
    <article class="story">
      <div class="story-thumb">
        <img src="${esc(thumb)}" alt="${esc(item.title)}" loading="lazy">
      </div>
      <div class="story-body">
        <a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a>
        <div class="story-meta">
          <span class="story-badge">${esc(badgeLabel(item.sourceType))}</span>
          ${esc(item.source || "Source")} · ${esc(timeAgo(item.date || item.dateTs))}
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
        <h1 class="hero-title">No latest football news available</h1>
        <div class="hero-meta">Please check back soon</div>
      `;
      aiNews.innerHTML = `<div class="panel-body empty">No stories available.</div>`;
      topNews.innerHTML = `<div class="panel-body empty">No stories available.</div>`;
      return;
    }

    const first = news[0];

    hero.innerHTML = `
      <h1 class="hero-title">${esc(first.title)}</h1>
      <div class="hero-meta">${esc(first.source || "Source")} · ${esc(timeAgo(first.date || first.dateTs))}</div>
    `;

    aiNews.innerHTML = news
      .slice(0, 5)
      .map((item, i) => storyCard(item, i))
      .join("");

    const topStories = news.slice(5, 11);

    topNews.innerHTML = topStories.length
      ? topStories.map((item, i) => storyCard(item, i + 5)).join("")
      : `<div class="panel-body empty">More stories soon.</div>`;
  } catch (err) {
    console.error(err);

    hero.innerHTML = `
      <h1 class="hero-title">Error loading latest Serbian football news</h1>
      <div class="hero-meta">Please refresh the page</div>
    `;

    aiNews.innerHTML = `<div class="panel-body empty">Feed error.</div>`;
    topNews.innerHTML = `<div class="panel-body empty">Feed error.</div>`;
  }
}

loadNews();
setInterval(loadNews, 300000);
