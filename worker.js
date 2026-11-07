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
        `https://api.puntersedge.online/v1/racing/next-to-go?num_races=${count}&categories=horse&country=AU`,
        {
          headers: {
            "X-API-Key": env.PUNTERSEDGE_API_KEY
          },
          signal: AbortSignal.timeout(12000)
        }
      );

      if (!response.ok) {
        return Response.json({ error: "Racing provider error" }, {
          status: 502, headers: cors
        });
      }

      const races = await response.json();

      return Response.json({
        provider: "PuntersEdge",
        retrievedAt: new Date().toISOString(),
        count: races.length,
        races
      }, { headers: cors });

    } catch {
      return Response.json({ error: "Racing feed unavailable" }, {
        status: 502, headers: cors
      });
    }
  }
};
