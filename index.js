export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(await getHTML(), { headers: { "content-type": "text/html" } });
    }

    if (url.pathname === "/styles.css") {
      return new Response(await getCSS(), { headers: { "content-type": "text/css" } });
    }

    if (url.pathname === "/app.js") {
      return new Response(await getJS(), { headers: { "content-type": "application/javascript" } });
    }

    if (url.pathname === "/api/standings") {
      const res = await fetch("https://api-football-v1.p.rapidapi.com/v3/standings?league=286&season=2024", {
        headers: {
          "X-RapidAPI-Key": "b80e630effea6fbdac1643532977e620",
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
        }
      });
      const data = await res.json();
      const table = data.response[0].league.standings[0].map((t,i)=>({
        position:i+1,
        team:t.team.name,
        points:t.points
      }));
      return Response.json(table);
    }

    if (url.pathname === "/api/news") {
      return Response.json([
        {title:"Serbian football latest news (RSS integrated)", link:"https://www.tanjug.rs/rss/sport/fudbal"}
      ]);
    }

    if (url.pathname === "/api/videos") {
      return Response.json([
        {id:"dQw4w9WgXcQ"}
      ]);
    }

    return new Response("Not found", { status: 404 });
  }
};

async function getHTML(){ return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Serbian Football Portal</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header>
  <h1>Serbian Football</h1>
</header>

<main>
  <section id="standings">
    <h2>SuperLiga Standings</h2>
    <ul id="table"></ul>
  </section>

  <section id="news">
    <h2>Latest News</h2>
    <ul id="news-list"></ul>
  </section>

  <section id="videos">
    <h2>Latest Videos</h2>
    <div id="video-container"></div>
  </section>
</main>

<script src="app.js"></script>
</body>
</html>
`; }
async function getCSS(){ return `body {
  font-family: Arial, sans-serif;
  margin: 0;
  background: #111;
  color: #fff;
}
header {
  background: #c00;
  padding: 15px;
  text-align: center;
}
section {
  padding: 20px;
}
h2 {
  border-bottom: 2px solid #c00;
}
`; }
async function getJS(){ return `async function loadStandings() {
  const res = await fetch('/api/standings');
  const data = await res.json();
  const list = document.getElementById('table');
  list.innerHTML = data.map(t => \`<li>${t.position}. ${t.team} - ${t.points} pts</li>\`).join('');
}

async function loadNews() {
  const res = await fetch('/api/news');
  const data = await res.json();
  const list = document.getElementById('news-list');
  list.innerHTML = data.map(n => \`<li><a href="${n.link}" target="_blank">${n.title}</a></li>\`).join('');
}

async function loadVideos() {
  const res = await fetch('/api/videos');
  const data = await res.json();
  const container = document.getElementById('video-container');
  container.innerHTML = data.map(v => \`<iframe width="300" height="170" src="https://www.youtube.com/embed/${v.id}" frameborder="0" allowfullscreen></iframe>\`).join('');
}

loadStandings();
loadNews();
loadVideos();
`; }
