const API = "https://wild-shape-c68f.slavisa-cf8.workers.dev";

async function loadNews() {
  const res = await fetch(`${API}/news`);
  const data = await res.json();

  const leadTitle = document.querySelector(".lead-title");
  const leadSource = document.querySelector(".lead-source");
  const newsGrid = document.querySelector("#newsGrid");

  if (Array.isArray(data) && data.length > 0) {
    leadTitle.textContent = data[0].title;
    leadSource.textContent = data[0].source || "Source unavailable";
  } else {
    leadTitle.textContent = "No top story available";
    leadSource.textContent = "";
  }

  newsGrid.innerHTML = "";

  const rest = Array.isArray(data) ? data.slice(1) : [];

  if (!rest.length) {
    newsGrid.innerHTML = `
      <article class="news-card">
        <h3>No additional news yet</h3>
        <p>More stories will appear here.</p>
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
    body.innerHTML = `<tr><td colspan="3">No standings available</td></tr>`;
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
    shell.textContent = "No video available";
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
