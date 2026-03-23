export default {
  async fetch() {
    return new Response(JSON.stringify({status:"ok"}), {
      headers: { "content-type": "application/json" }
    });
  }
};
