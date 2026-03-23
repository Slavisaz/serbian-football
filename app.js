const API = "https://wild-shape-c68f.slavisa-cf8.workers.dev";

async function loadNews() {
  const res = await fetch(API + "/news");
  const data = await res.json();

  const lead = document.querySelector(".lead-title");
  lead.textContent = data[0]?.title || "No news";

  const grid = document.querySelector("#newsGrid");
  grid.innerHTML = "";

  data.slice(1).forEach(n => {
    const el = document.createElement("div");
    el.className = "news-card";
    el.innerHTML = "<h3>"+n.title+"</h3><p>"+n.source+"</p>";
    grid.appendChild(el);
  });
}

async function loadStandings() {
  const res = await fetch(API + "/standings");
  const data = await res.json();

  const body = document.querySelector("#standingsBody");
  body.innerHTML = "";

  data.forEach(t => {
    body.innerHTML += `<tr><td>${t.position}</td><td>${t.team}</td><td>${t.points}</td></tr>`;
  });
}

async function loadVideos() {
  const res = await fetch(API + "/videos");
  const data = await res.json();

  const v = document.querySelector("#videoShell");
  if (data[0]) {
    v.innerHTML = `<iframe src="https://www.youtube.com/embed/${data[0].id}" width="100%" height="300"></iframe>`;
  }
}

loadNews();
loadStandings();
loadVideos();
