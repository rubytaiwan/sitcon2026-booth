// worker.js
var LISTMONK_BASE = "https://edm.ruby.tw/api";
var LISTMONK_LIST_ID = 10;
var LISTMONK_TX_TEMPLATE_ID = 5;
var CORS = {
  "Access-Control-Allow-Origin": "https://sitcon2026-booth.ruby.tw",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad Request", { status: 400 });
    }
    const a = body.attribs || {};
    const auth = `Basic ${btoa(`sitcon2026-booth:${env.LISTMONK_API_TOKEN}`)}`;
    const headers = { "Content-Type": "application/json", "Authorization": auth };
    const createResp = await fetch(`${LISTMONK_BASE}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: body.email,
        name: body.name,
        status: "enabled",
        attribs: {
          phone: a.phone || "",
          school: a.school || "",
          ruby_course_interest: a.ruby_course_interest ?? false,
          message: a.message || "",
          score: a.score ?? 0,
          total: a.total ?? 10
        },
        preconfirm_subscriptions: true
      })
    });
    const createData = await createResp.json();
    if (!createResp.ok && !createData.data?.id) {
      return new Response(JSON.stringify(createData), {
        status: createResp.status,
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }
    const subscriberId = createData.data?.id;
    if (subscriberId) {
      await fetch(`${LISTMONK_BASE}/subscribers/lists`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          ids: [subscriberId],
          action: "add",
          target_list_ids: [LISTMONK_LIST_ID],
          status: "confirmed"
        })
      });
      await fetch(`${LISTMONK_BASE}/tx`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          subscriber_email: body.email,
          template_id: LISTMONK_TX_TEMPLATE_ID
        })
      });
    }
    return new Response(JSON.stringify(createData), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
};
export {
  worker_default as default
};
