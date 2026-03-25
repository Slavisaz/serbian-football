async function loadNews(){
  const res = await fetch('/api/news');
  const data = await res.json();

  if(data.length){
    document.getElementById('hero-title').innerText = data[0].title;
    document.getElementById('hero-meta').innerText = data[0].source;

    let html = '';
    data.slice(0,5).forEach(n=>{
      html += `<p><a href="${n.link}" target="_blank">${n.title}</a></p>`;
    });
    document.getElementById('news').innerHTML = html;
  }
}
loadNews();
