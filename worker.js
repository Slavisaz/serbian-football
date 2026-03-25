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

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const keywords = [
    "serbia", "superliga", "partizan", "zvezda",
    "vojvodina", "cukaricki", "radnicki"
  ];

  const news = items
    .map(item => {
      const title = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "";
      const dateStr = item[1].match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

      const date = dateStr ? new Date(dateStr).getTime() : 0;

      return { title, link, date };
    })
    // ✅ FILTER LAST 24 HOURS
    .filter(n => now - n.date < DAY)
    // ✅ FILTER KEYWORDS
    .filter(n =>
      keywords.some(k => n.title.toLowerCase().includes(k))
    )
    // ✅ SORT NEWEST FIRST
    .sort((a, b) => b.date - a.date)
    .slice(0, 11);

  return new Response(JSON.stringify(news), {
    headers: { "content-type": "application/json" }
  });
}
