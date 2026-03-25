export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/news") {
      return json(await buildNewsFeed());
    }

    return fetch(req);
  }
};

const RSS_SOURCES = [
  { name: "Mozzart Sport", url: "https://www.mozzartsport.com/rss/1.xml" },
  { name: "Tanjug", url: "https://www.tanjug.rs/rss/sport/fudbal" },
  { name: "B92", url: "https://www.b92.net/rss/sport/fudbal/vesti" }
];

async function buildNewsFeed() {
  const feeds = await Promise.all(RSS_SOURCES.map(fetchFeed));
  let news = feeds.flat();

  news = news
    .filter(n => n.title && isFootball(n.title))
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  // 🔥 TRANSLATE TO ENGLISH
  for (let item of news) {
    item.title = await translate(item.title);
  }

  return news;
}

async function fetchFeed(src) {
  try {
    const res = await fetch(src.url);
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

    return items.map(i => {
      const block = i[1];

      return {
        title: get(block, "title"),
        link: get(block, "link"),
        date: new Date(get(block, "pubDate")).getTime() || 0,
        source: src.name
      };
    });

  } catch {
    return [];
  }
}

function get(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, "i"));
  return m ? m[1] : "";
}

// 🔥 FILTER ONLY FOOTBALL
function isFootball(text) {
  const t = text.toLowerCase();

  return (
    t.includes("fudbal") ||
    t.includes("zvezda") ||
    t.includes("partizan") ||
    t.includes("serbia") ||
    t.includes("srbija") ||
    t.includes("superliga")
  );
}

// 🔥 FREE TRANSLATION API
async function translate(text) {
  try {
    const res = await fetch(
      "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) +
        "&langpair=sr|en"
    );
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text;
  }
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" }
  });
}
