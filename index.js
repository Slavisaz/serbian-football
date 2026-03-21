export default {
  async fetch(request) {
    try {
      const res = await fetch("https://superliga-api.slavisa-cf8.workers.dev/", {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        },
        cf: {
          cacheTtl: 0,
          cacheEverything: false
        }
      });

      const text = await res.text();

      return new Response(text, {
        headers: { "content-type": "application/json" },
      });

    } catch (err) {
      return new Response("Fetch error: " + err.message);
    }
  }
};
