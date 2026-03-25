async function load() {
  try {
    const news = await fetch("/api/news").then(r => r.json());

    const hero = document.getElementById("hero");
    const aiNews = document.getElementById("ai-news");
    const topNews = document.getElementById("top-news");

    if (!news.length) {
      hero.innerHTML = "No fresh Serbian football news right now";
      aiNews.innerHTML = "<p>No items available.</p>";
      topNews.innerHTML = "<p>No items available.</p>";
      return;
    }

    hero.innerHTML = `
      <div>
        <div class="hero-kicker">${news[0].sourceType === "official" ? "OFFICIAL" : "LATEST NEWS"}</div>
        <div class="hero-title">${news[0].title}</div>
        <div class="hero-meta">${news[0].source} · ${news[0].ageHours ?? "?"}h ago</div>
      </div>
    `;

    aiNews.innerHTML = news.slice(0, 5).map(n => `
      <article class="story">
        <a href="${n.link}" target="_blank" rel="noopener noreferrer">${n.title}</a>
        <div class="story-meta">${n.source} · ${n.ageHours ?? "?"}h ago</div>
      </article>
    `).join("");

    topNews.innerHTML = news.slice(5, 11).map(n => `
      <article class="story">
        <a href="${n.link}" target="_blank" rel="noopener noreferrer">${n.title}</a>
        <div class="story-meta">${n.source} · ${n.ageHours ?? "?"}h ago</div>
      </article>
    `).join("");

  } catch (err) {
    document.getElementById("hero").innerHTML = "Error loading news";
    document.getElementById("ai-news").innerHTML = "<p>Feed error.</p>";
    document.getElementById("top-news").innerHTML = "<p>Feed error.</p>";
    console.error(err);
  }
}

load();
setInterval(load, 300000);
