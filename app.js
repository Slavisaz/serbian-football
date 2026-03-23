const API="https://wild-shape-c68f.slavisa-cf8.workers.dev";

async function loadStandings(){
 const res=await fetch(API+"/standings");
 const data=await res.json();
 const table=document.querySelector("table");
 table.innerHTML="<tr><th>#</th><th>Club</th><th>Pts</th></tr>";
 data.forEach((t,i)=>{
  table.innerHTML+=`<tr><td>${i+1}</td><td>${t.team}</td><td>${t.points}</td></tr>`;
 });
}
loadStandings();
