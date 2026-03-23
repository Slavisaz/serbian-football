export default {
  async fetch(request) {
    const data = {
      league: "Serbian SuperLiga",
      season: "2025",
      teams: [
        { name: "Crvena Zvezda", city: "Belgrade" },
        { name: "Partizan", city: "Belgrade" },
        { name: "Vojvodina", city: "Novi Sad" }
      ]
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: { "content-type": "application/json" }
    });
  }
};
