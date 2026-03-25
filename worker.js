export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/news") {
      return getNews();
    }

    return fetch(req);
  }
};

// REAL RSS (Google News Serbia Football)
async function getNews() {
  const rss = await fetch(
    "https://news.google.com/rss/search?q=serbian+football&hl=en-US&gl=US&ceid=US:en"
  );

  const xml = await rss.text();

  const items = [...xml.matchAll(/<item>(.*?)<\/item>/gs)].slice(0, 11);

  const news = items.map(item => {
    const title = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
    const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "";

    return { title, link };
  });

  return new Response(JSON.stringify(news), {
    headers: { "content-type": "application/json" }
  });
}
