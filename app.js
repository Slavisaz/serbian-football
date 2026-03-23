const API = "https://wild-shape-c68f.slavisa-cf8.workers.dev";

// NEWS
async function loadNews() {
  const res = await fetch(`${API}/news`);
  const data = await res.json();

  const big = document.querySelector(".big");
  const grid = document.querySelector(".grid");

  if (data.length > 0) {
    big.innerHTML = `
      <h2>${data[0].title}</h2>
      <p>${data[0].source}</p>
    `;
  }

  grid.innerHTML = "";

  data.slice(1).forEach(item => {
    grid.innerHTML += `
      <div class="card">
        <h3>${item.title}</h3>
        <p>${item.source}</p>
      </div>
    `;
  });
}

// STANDINGS
async function loadStandings() {
  const res = await fetch(`${API}/standings`);
  const data = await res.json();

  const table = document.querySelector("table");

  table.innerHTML = `
    <tr><th>#</th><th>Club</th><th>Pts</th></tr>
  `;

  data.forEach((team, i) => {
    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${team.team}</td>
        <td>${team.points}</td>
      </tr>
    `;
  });
}

// VIDEOS
async function loadVideos() {
  const res = await fetch(`${API}/videos`);
  const data = await res.json();

  const video = document.querySelector(".video");

  video.innerHTML = `
    <h2>Video</h2>
    <iframe
      width="100%"
      height="300"
      src="https://www.youtube.com/embed/${data[0].id}"
      frameborder="0"
      allowfullscreen>
    </iframe>
  `;
}

// INIT
async function init() {
  await loadNews();
  await loadStandings();
  await loadVideos();
}

init();
