async function load() {
  try {
    const res = await fetch("/api/news");
    const news = await res.json();

    console.log(news); // debug

    if (!news || news.length === 0) {
      document.getElementById("hero").innerText = "No news available";
      return;
    }

    // HERO
    document.getElementById("hero").innerText = news[0].title;

    // AI NEWS
    document.getElementById("ai-news").innerHTML =
      news.slice(0, 5).map(n =>
        `<p><a href="${n.link}" target="_blank">${n.title}</a></p>`
      ).join("");

    // TOP STORIES
    document.getElementById("top-news").innerHTML =
      news.slice(5, 11).map(n =>
        `<p><a href="${n.link}" target="_blank">${n.title}</a></p>`
      ).join("");

  } catch (e) {
    document.getElementById("hero").innerText = "Error loading news";
    console.error(e);
  }
}

load();
