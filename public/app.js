const API = "/api";

async function load() {
  const news = await fetch(API + "/news").then(r => r.json());

  // HERO
  document.getElementById("hero").innerHTML = news[0]?.title || "No news";

  // AI NEWS
  document.getElementById("ai-news").innerHTML =
    news.slice(0, 5).map(n =>
      `<p><a href="${n.link}" target="_blank">${n.title}</a></p>`
    ).join("");

  // TOP NEWS
  document.getElementById("top-news").innerHTML =
    news.slice(5, 11).map(n =>
      `<p><a href="${n.link}" target="_blank">${n.title}</a></p>`
    ).join("");

  // VIDEOS (TEMP)
  document.getElementById("videos").innerHTML = `
    <iframe src="https://www.youtube.com/embed/ysz5S6PUM-U"></iframe>
    <iframe src="https://www.youtube.com/embed/tgbNymZ7vqY"></iframe>
  `;
}

load();
