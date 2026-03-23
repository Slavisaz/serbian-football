async function load(){
let s=await fetch('/api/superliga').then(r=>r.json());
document.getElementById('superliga').innerHTML=s.map(t=>`${t.position}. ${t.team} (${t.points})`).join('<br>');

let p=await fetch('/api/prva').then(r=>r.json());
document.getElementById('prva').innerHTML=p.map(t=>`${t.position}. ${t.team} (${t.points})`).join('<br>');

let n=await fetch('/api/news').then(r=>r.json());
document.getElementById('news').innerHTML=n.map(x=>`<a href="${x.link}" target="_blank">${x.title}</a>`).join('<br>');

let v=await fetch('/api/videos').then(r=>r.json());
document.getElementById('videos').innerHTML=v.map(x=>`<iframe width="100%" height="200" src="https://www.youtube.com/embed/${x.id}" allowfullscreen></iframe>`).join('');
}
load();
