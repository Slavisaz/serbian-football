export default {
  async fetch(request) {

    const standings = [
      { position: 1, team: "Crvena Zvezda", points: 75 },
      { position: 2, team: "Partizan", points: 68 },
      { position: 3, team: "TSC Bačka Topola", points: 60 },
      { position: 4, team: "Čukarički", points: 55 },
      { position: 5, team: "Vojvodina", points: 50 }
    ];

    return new Response(JSON.stringify({ standings }, null, 2), {
      headers: { "content-type": "application/json" }
    });
  }
};
