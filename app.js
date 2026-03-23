const API_BASE = "https://example.workers.dev";

async function load() {
  document.getElementById("news").innerText = "News working (demo)";
  document.getElementById("standings").innerText = "Standings working (demo)";
  document.getElementById("videos").innerText = "Videos working (demo)";
}

load();
