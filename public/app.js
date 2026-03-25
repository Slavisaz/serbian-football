const RSS_FEEDS = [
  "https://www.mozzartsport.com/rss/1.xml",
  "https://www.tanjug.rs/rss/sport/fudbal",
  "https://www.b92.net/rss/sport/fudbal/vesti"
];

function cleanTitle(title) {
  return title.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

async function translate(text) {
  try {
    const res = await fetch(
      "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) +
        "&langpair=sr|en"
    );
    const data = await res.json();
    return data.responseData.translatedText;
  } catch {
    return text;
  }
}

function extractImage(item) {
  if (item.querySelector("media\\:content"))
    return item.querySelector("media\\:content").getAttribute("url");

  if (item.querySelector("enclosure"))
    return item.querySelector("enclosure").getAttribute("url");

  const fallback = [
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2"
  ];

  return fallback[Math.floor(Math.random() * fallback.length)];
}

async function loadNews() {
  let all = [];

  for (let url of RSS_FEEDS) {
    const res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url));
    const data = await res.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");

    const items = xml.querySelectorAll("item");

    items.forEach(item => {
      all.push({
        title: item.querySelector("title")?.textContent,
        source: url.includes("moz") ? "Mozzart" : "B92",
        image: extractImage(item)
      });
    });
  }

  return all.slice(0, 10);
}

async function render() {
  const news = await loadNews();

  const hero = document.getElementById("hero");
  const sidebar = document.getElementById("news-list");

  const first = news[0];
  const title = await translate(cleanTitle(first.title));

  hero.innerHTML = `
    <div class="hero-card">
      <img src="${first.image}" class="hero-img"/>
      <div class="hero-overlay">
        <span class="badge">LATEST NEWS</span>
        <h1>${title}</h1>
      </div>
    </div>
  `;

  sidebar.innerHTML = "";

  for (let n of news.slice(1, 6)) {
    const t = await translate(cleanTitle(n.title));

    sidebar.innerHTML += `
      <div class="news-item">
        <img src="${n.image}" />
        <div>
          <div class="news-title">${t}</div>
          <div class="news-meta">${n.source}</div>
        </div>
      </div>
    `;
  }
}

render();
