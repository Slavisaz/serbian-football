const corsHeaders = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type"
};

export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname === "/news") {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    if (url.pathname === "/standings") {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    if (url.pathname === "/videos") {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: corsHeaders
    });
  }
};
