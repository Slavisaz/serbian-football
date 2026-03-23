const API = "https://wild-shape-c68f.slavisa-cf8.workers.dev";

// NEWS
async function loadNews() {
  try {
    const res = await fetch(API + "/news");
    const data = await res.json();

    const container = document.querySelector(".news-grid");
    container.innerHTML = "";

    data.slice(0,4).forEach(item => {
      container.innerHTML += `
        <div class="card">
          <h4>${item.title}</h4>
          <p>${item.source}</p>
        </div>
      `;
    });
  } catch(e) {
    console.error("News error", e);
  }
}

// STANDINGS
async function loadStandings() {
  try {
    const res = await fetch(API + "/standings");
    const data = await res.json();

    const table = document.querySelector("table");
    table.innerHTML = `
      <tr><th>#</th><th>Club</th><th>Pts</th></tr>
    `;

    data.forEach((t,i) => {
      table.innerHTML += `
        <tr>
          <td>${i+1}</td>
          <td>${t.team}</td>
          <td>${t.points}</td>
        </tr>
      `;
    });
  } catch(e) {
    console.error("Standings error", e);
  }
}

// VIDEOS
async function loadVideos() {
  try {
    const res = await fetch(API + "/videos");
    const data = await res.json();

    const container = document.querySelector(".video");
    container.innerHTML = `
      <iframe width="100%" height="200"
      src="https://www.youtube.com/embed/${data[0].id}"
      frameborder="0" allowfullscreen></iframe>
    `;
  } catch(e) {
    console.error("Videos error", e);
  }
}

loadNews();
loadStandings();
loadVideos();
