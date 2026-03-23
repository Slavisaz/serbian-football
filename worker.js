export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/news") {
      return new Response(JSON.stringify([
        { title: "Serbia wins match", source: "FSS" },
        { title: "Partizan top of league", source: "SuperLiga" }
      ]));
    }

    if (url.pathname === "/standings") {
      return new Response(JSON.stringify([
        { team: "Partizan", points: 60 },
        { team: "Zvezda", points: 58 }
      ]));
    }

    if (url.pathname === "/videos") {
      return new Response(JSON.stringify([
        { id: "dQw4w9WgXcQ" }
      ]));
    }

    return new Response("OK");
  }
};
