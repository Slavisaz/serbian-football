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

function storyCard(item, index) {
  const thumb = item.image || thumbForIndex(index);
  return `
    <article class="story">
      <div class="story-thumb"><img src="${esc(thumb)}" alt="${esc(item.title)}" loading="lazy"></div>
      <div class="story-body">
        <a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a>
        <div class="story-meta"><span class="story-badge">${esc(item.sourceType === "official" ? "Official" : "Media")}</span>${esc(item.source)} · ${typeof item.ageHours === "number" ? item.ageHours + "h ago" : "recent"}</div>
      </div>
    </article>
  `;
}

async function loadNews() {
  const hero = document.getElementById("hero-content");
  const aiNews = document.getElementById("ai-news");
  const topNews = document.getElementById("top-news");

  try {
    const res = await fetch("/api/news", { cache: "no-store" });
    if (!res.ok) throw new Error("Feed error");
    const news = await res.json();

    if (!Array.isArray(news) || news.length === 0) {
      hero.innerHTML = '<h1 class="hero-title">No fresh Serbian football news right now</h1><div class="hero-meta">Try again soon</div>';
      aiNews.innerHTML = '<div class="panel-body empty">No stories available.</div>';
      topNews.innerHTML = '<div class="panel-body empty">No stories available.</div>';
      return;
    }

    const first = news[0];
    hero.innerHTML = `
      <h1 class="hero-title">${esc(first.title)}</h1>
      <div class="hero-meta">${esc(first.source)} · ${typeof first.ageHours === "number" ? first.ageHours + "h ago" : "recent"}</div>
    `;

    aiNews.innerHTML = news.slice(0, 5).map((item, i) => storyCard(item, i)).join("");
    topNews.innerHTML = news.slice(5, 11).map((item, i) => storyCard(item, i + 5)).join("") || '<div class="panel-body empty">More stories soon.</div>';
  } catch (err) {
    console.error(err);
    hero.innerHTML = '<h1 class="hero-title">Error loading latest Serbian football news</h1><div class="hero-meta">Please refresh</div>';
    aiNews.innerHTML = '<div class="panel-body empty">Feed error.</div>';
    topNews.innerHTML = '<div class="panel-body empty">Feed error.</div>';
  }
}

loadNews();
setInterval(loadNews, 300000);
