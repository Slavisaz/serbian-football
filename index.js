export default {
  async fetch(request) {
    const res = await fetch("https://superliga-api.slavisa-cf8.workers.dev");
    const data = await res.text();

    return new Response(data, {
      headers: { "content-type": "application/json" },
    });
  },

  async scheduled(event, env, ctx) {
    console.log("Running automation...");

    const res = await fetch("https://superliga-api.slavisa-cf8.workers.dev");
    const data = await res.text();

    console.log("Fetched data:", data);

    // TODO: Send to Telegram
    // Example:
    // await fetch(`https://api.telegram.org/botYOUR_TOKEN/sendMessage`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     chat_id: "YOUR_CHAT_ID",
    //     text: data
    //   })
    // });
  }
};
