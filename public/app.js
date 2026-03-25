const API = "/api";

async function load() {
  const res = await fetch(API + "/news");
  const data = await res.json();

  document.getElementById("breaking").innerHTML = data[0]?.title || "No news";

  document.getElementById("ai-news").innerHTML =
    data.map(n => "<p>" + n.title + "</p>").join("");
}

load();
