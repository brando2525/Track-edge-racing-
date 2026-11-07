export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/api/health") {
      return Response.json({ status: "online" }, { headers: cors });
    }

    if (url.pathname !== "/api/races") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    if (request.headers.get("Authorization") !==
        `Bearer ${env.TRACK_EDGE_ACCESS_KEY}`) {
      return Response.json({ error: "Unauthorized" }, {
        status: 401, headers: cors
      });
    }

    try {
      const count = Math.min(20, Math.max(1,
        Number(url.searchParams.get("num_races")) || 10
      ));

      const response = await fetch(
      `https://api.puntersedge.online/v1/racing/next-to-go?num_races=${count}&categories=horse&country=AU&include_unresolved=true`,
  }
