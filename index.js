export default {
async fetch(req){
let url=new URL(req.url);

if(url.pathname==='/') return new Response(html,{headers:{'content-type':'text/html'}});
if(url.pathname==='/styles.css') return new Response(css,{headers:{'content-type':'text/css'}});
if(url.pathname==='/app.js') return new Response(js,{headers:{'content-type':'application/javascript'}});

if(url.pathname==='/api/superliga'){
let r=await fetch('https://api-football-v1.p.rapidapi.com/v3/standings?league=286&season=2024',{
headers:{'X-RapidAPI-Key':'b80e630effea6fbdac1643532977e620','X-RapidAPI-Host':'api-football-v1.p.rapidapi.com'}});
let d=await r.json();
return Response.json(d.response[0].league.standings[0].map((t,i)=>({position:i+1,team:t.team.name,points:t.points})));
}

if(url.pathname==='/api/prva'){
let r=await fetch('https://api-football-v1.p.rapidapi.com/v3/standings?league=287&season=2024',{
headers:{'X-RapidAPI-Key':'b80e630effea6fbdac1643532977e620','X-RapidAPI-Host':'api-football-v1.p.rapidapi.com'}});
let d=await r.json();
return Response.json(d.response[0].league.standings[0].map((t,i)=>({position:i+1,team:t.team.name,points:t.points})));
}

if(url.pathname==='/api/news'){
return Response.json([
{title:'Tanjug Football News',link:'https://www.tanjug.rs/rss/sport/fudbal'}
]);
}

if(url.pathname==='/api/videos'){
return Response.json([
{id:'ysz5S6PUM-U'}
]);
}

return new Response('Not found',{status:404});
}
};

const html=`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Serbian Football Portal</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header><h1>Serbian Football</h1></header>

<div class="grid">
  <div class="card"><h2>SuperLiga</h2><div id="superliga"></div></div>
  <div class="card"><h2>Prva Liga</h2><div id="prva"></div></div>
  <div class="card"><h2>News</h2><div id="news"></div></div>
  <div class="card"><h2>Videos</h2><div id="videos"></div></div>
</div>

<script src="app.js"></script>
</body>
</html>
`;
const css=`body{margin:0;background:#0b0b0b;color:white;font-family:sans-serif}
header{background:#c00;padding:15px;text-align:center}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px}
.card{background:#111;padding:15px;border-radius:10px}
h2{border-bottom:2px solid #c00}
`;
const js=`async function load(){
let s=await fetch('/api/superliga').then(r=>r.json());
document.getElementById('superliga').innerHTML=s.map(t=>\`${t.position}. ${t.team} (${t.points})\`).join('<br>');

let p=await fetch('/api/prva').then(r=>r.json());
document.getElementById('prva').innerHTML=p.map(t=>\`${t.position}. ${t.team} (${t.points})\`).join('<br>');

let n=await fetch('/api/news').then(r=>r.json());
document.getElementById('news').innerHTML=n.map(x=>\`<a href="${x.link}" target="_blank">${x.title}</a>\`).join('<br>');

let v=await fetch('/api/videos').then(r=>r.json());
document.getElementById('videos').innerHTML=v.map(x=>\`<iframe width="100%" height="200" src="https://www.youtube.com/embed/${x.id}" allowfullscreen></iframe>\`).join('');
}
load();
`;
