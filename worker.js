export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/news") {
      return new Response(JSON.stringify([
        { title: "Official FSS news example", source: "FSS", url: "https://fss.rs" }
      ]), { headers: { "content-type": "application/json" }});
    }

    if (url.pathname === "/standings") {
      return new Response(JSON.stringify([
        { position:1, team:"Partizan", points:60 },
        { position:2, team:"Zvezda", points:58 }
      ]), { headers: { "content-type": "application/json" }});
    }

    if (url.pathname === "/videos") {
      return new Response(JSON.stringify([
        { id:"dQw4w9WgXcQ" }
      ]), { headers: { "content-type": "application/json" }});
    }

    return new Response("OK");
  }
};
