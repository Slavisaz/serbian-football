export default {
  async fetch(request) {
    const url = new URL(request.url);

    const standings = [
      { position: 1, team: "Crvena Zvezda", points: 75 },
      { position: 2, team: "Partizan", points: 68 },
      { position: 3, team: "TSC Bačka Topola", points: 60 },
      { position: 4, team: "Čukarički", points: 55 },
      { position: 5, team: "Vojvodina", points: 50 }
    ];

    // API endpoint
    if (url.pathname === "/api") {
      return new Response(JSON.stringify({ standings }, null, 2), {
        headers: { "content-type": "application/json" }
      });
    }

    // Website UI
    return new Response(`<!DOCTYPE html>
<html>
<head>
  <title>Serbian Football</title>
  <style>
    body { font-family: Arial; background: #111; color: #fff; text-align: center; }
    table { margin: auto; border-collapse: collapse; width: 60%; }
    th, td { padding: 10px; border-bottom: 1px solid #444; }
    th { background: #222; }
  </style>
</head>
<body>
  <h1>Serbian SuperLiga Standings</h1>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Team</th>
        <th>Points</th>
      </tr>
    </thead>
    <tbody id="tbody"></tbody>
  </table>

  <script>
    fetch("/api")
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("tbody");
        data.standings.forEach(team => {
          tbody.innerHTML += `
            <tr>
              <td>${team.position}</td>
              <td>${team.team}</td>
              <td>${team.points}</td>
            </tr>
          `;
        });
      });
  </script>
</body>
</html>`, {
      headers: { "content-type": "text/html" }
    });
  }
};
