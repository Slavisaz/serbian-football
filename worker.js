export default {
  async fetch(request) {
    return new Response(JSON.stringify({status:"ok"}), {
      headers: { "content-type": "application/json" }
    });
  }
}
