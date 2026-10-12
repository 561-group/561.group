// 561.group: the static page from ./public, plus /estate.json, which re-derives
// every public node's status on request (cached briefly) instead of asserting it.

import estate from "../public/estate-records.json";
import { toldOf } from "./told.mjs";

const APEX = "561.group";
const PROBE_TIMEOUT_MS = 4000;
const ESTATE_TTL_S = 300;

const SECURITY_HEADERS = {
  "content-security-policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; base-uri 'none'; form-action mailto:; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
};

function withHeaders(response, extra = {}) {
  const out = new Response(response.body, response);
  for (const [key, value] of Object.entries({ ...SECURITY_HEADERS, ...extra })) out.headers.set(key, value);
  return out;
}

async function probe(node) {
  const started = Date.now();
  const url = node.url ?? `https://${node.host}${node.probe ?? "/"}`;
  try {
    const init = {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": "561.group estate probe (+https://561.group/estate.json)" },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    };
    const response = await fetch(url, init);
    response.body?.cancel();
    return { host: node.host, url, status: response.status, told: toldOf(response.status), ms: Date.now() - started };
  } catch {
    return { host: node.host, url, status: null, told: toldOf(null), ms: Date.now() - started };
  }
}

async function estateReading(request, ctx) {
  const cache = caches.default;
  const key = new Request(new URL(`/estate.json?revision=${estate.revision}`, request.url).toString());
  const cached = await cache.match(key);
  if (cached) return cached;

  // The machines are read beside the nodes, not listed among them: the page lists services, and a
  // reader of the estate still learns whether the machines behind them answer.
  const [nodes, machines] = await Promise.all([
    Promise.all(estate.nodes.map((node) => probe(node))),
    Promise.all((estate.machines ?? []).map((machine) => probe(machine))),
  ]);
  const body = JSON.stringify({ revision: estate.revision, derivedAt: new Date().toISOString(), ttlSeconds: ESTATE_TTL_S, ...(estate.status ? { status: estate.status } : {}), nodes, machines }, null, 2);
  const response = new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${ESTATE_TTL_S}`,
      "access-control-allow-origin": "*",
    },
  });
  ctx.waitUntil(cache.put(key, response.clone()));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname !== APEX) {
      url.hostname = APEX;
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/estate.json") return withHeaders(await estateReading(request, ctx));
    return withHeaders(await env.ASSETS.fetch(request));
  },
};
