export default {
  async fetch(request) {
    if (new URL(request.url).pathname === '/api/news') {
      const feeds = [
        'https://www.mozzartsport.com/rss/1.xml',
        'https://www.tanjug.rs/rss/sport/fudbal',
        'https://www.b92.net/rss/sport/fudbal/vesti'
      ];

      let items = [];

      for (let url of feeds) {
        const res = await fetch(url);
        const text = await res.text();
        const matches = [...text.matchAll(/<item>(.*?)<\/item>/gs)];

        matches.slice(0,5).forEach(m=>{
          const title = m[1].match(/<title>(.*?)<\/title>/)?.[1] || '';
          const link = m[1].match(/<link>(.*?)<\/link>/)?.[1] || '';
          items.push({title, link, source:url});
        });
      }

      return new Response(JSON.stringify(items.slice(0,10)), {
        headers: {'content-type':'application/json'}
      });
    }

    return fetch(request);
  }
}
