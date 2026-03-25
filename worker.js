export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/news") {
      return getNews();
    }

    return fetch(req);
  }
};

async function getNews() {
  const res = await fetch(
    "https://news.google.com/rss/search?q=serbian+football+superliga&hl=en-US&gl=US&ceid=US:en"
  );

  const xml = await res.text();

  const items = [...xml.matchAll(/<item>(.*?)<\/item>/gs)];

  const keywords = [
    "serbia", "superliga", "partizan", "zvezda",
    "vojvodina", "tss", "radnicki", "cukaricki"
  ];

  const news = items
    .map(item => {
      const title = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "";

      return { title, link };
    })
    .filter(n =>
      keywords.some(k => n.title.toLowerCase().includes(k))
    )
    .slice(0, 11);

  return new Response(JSON.stringify(news), {
    headers: { "content-type": "application/json" }
  });
}
