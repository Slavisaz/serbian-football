const API_URL = "https://serbian-football-api.slavisa-cf8.workers.dev/api/news";

async function loadNews() {
  const ticker = document.getElementById("ticker");
  const featuredTitle = document.getElementById("featuredTitle");
  const featuredSource = document.getElementById("featuredSource");
  const newsList = document.getElementById("newsList");

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return;

    // ticker
    ticker.innerHTML = data.items
      .map(n => n.title.slice(0, 60) + "...")
      .join(" • ");

    // featured
    const first = data.items[0];
    featuredTitle.textContent = first.title;
    featuredSource.textContent = first.pubDate || "Serbian Football";

    // news list
    newsList.innerHTML = data.items.map(n => `
      <div class="news-item">
        <a href="${n.link}" target="_blank">${n.title}</a>
      </div>
    `).join("");

  } catch (e) {
    console.error(e);
  }
}

loadNews();
setInterval(loadNews, 60000);
