const API = "https://wild-shape-c68f.slavisa-cf8.workers.dev";

async function loadNews() {
  const res = await fetch(`${API}/news`);
  const data = await res.json();

  const leadTitle = document.querySelector(".lead-title");
  const leadSource = document.querySelector(".lead-source");
  const newsGrid = document.querySelector("#newsGrid");

  if (!Array.isArray(data) || !data.length) {
    leadTitle.textContent = "No live news available";
    leadSource.textContent = "Official source not connected yet";
    newsGrid.innerHTML = `
      <article class="news-card">
        <h3>No additional news</h3>
        <p>Connect a real source to show live headlines.</p>
      </article>
    `;
    return;
  }

  leadTitle.textContent = data[0].title;
  leadSource.textContent = data[0].source || "Source unavailable";

  newsGrid.innerHTML = "";

  const rest = data.slice(1);
  if (!rest.length) {
    newsGrid.innerHTML = `
      <article class="news-card">
        <h3>No additional news</h3>
        <p>Only one live story is available right now.</p>
      </article>
    `;
    return;
  }

  rest.forEach(item => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.source || "Source unavailable"}</p>
    `;
    newsGrid.appendChild(card);
  });
}

async function loadStandings() {
  const res = await fetch(`${API}/standings`);
  const data = await res.json();

  const body = document.querySelector("#standingsBody");
  body.innerHTML = "";

  if (!Array.isArray(data) || !data.length) {
    body.innerHTML = `<tr><td colspan="3">No live standings available</td></tr>`;
    return;
  }

  data.forEach((team, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${team.team}</td>
      <td>${team.points}</td>
    `;
    body.appendChild(row);
  });
}

async function loadVideos() {
  const res = await fetch(`${API}/videos`);
  const data = await res.json();

  const shell = document.querySelector("#videoShell");

  if (!Array.isArray(data) || !data.length || !data[0].id) {
    shell.innerHTML = `<div style="padding:24px;">No live video available</div>`;
    return;
  }

  shell.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${data[0].id}"
      title="Serbian Football Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  `;
}

async function init() {
  try {
    await Promise.all([
      loadNews(),
      loadStandings(),
      loadVideos()
    ]);
  } catch (err) {
    console.error("Portal load error:", err);
  }
}

init();
