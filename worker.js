export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/news")) {
      return new Response(JSON.stringify([
        { title: "Latest Serbian football news coming soon" }
      ]), { headers: { "content-type": "application/json" } });
    }

    return fetch(req);
  }
};
