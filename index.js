export default {
  async fetch(request) {
    return new Response(JSON.stringify({
      name: "Serbian Football API",
      status: "running",
      message: "⚽ Serbian football automation is live!"
    }), {
      headers: { "content-type": "application/json" },
    });
  },

  async scheduled(event, env, ctx) {
    console.log("Running scheduled task...");

    const data = {
      league: "Serbian SuperLiga",
      update: "Daily update working ⚽"
    };

    console.log("Data:", data);
  }
};
