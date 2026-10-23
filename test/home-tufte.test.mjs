import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { project561GroupHome } from "../src/home-tufte.mjs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const home = read("data/home.json");
const estate = read("data/estate.json");

test("the accepted concise public homepage is one TUFTE model over original Group sources", () => {
  const model = project561GroupHome({ home, estate });
  assert.equal(model.title, "The 561 Group");
  assert.equal(model.subtitle, "We make research useful.");
  assert.equal(model.metadata.description, home.description);
  assert.deepEqual(model.tiles.map(t => t.id), ["introduction","contact","explore","support","companies"]);
  assert.match(model.tiles[0].html, /Lakota-founded 561 Group/u);
  assert.ok(model.tiles[1].html.includes('href="/contact/"'));
  const exploration = model.tiles[2].html;
  for (const item of home.public.featured) {
    const node = estate.nodes.find(n => n.host === item.host);
    assert.ok(node, "no independent fabricated project");
    assert.ok(exploration.includes(item.action));
    assert.ok(exploration.includes("https://" + node.host + "/"));
  }
  assert.ok(model.tiles[3].html.includes(home.group.sustainingSupport.url));
  assert.ok(model.tiles[3].html.includes("$10/month"));
  assert.ok(model.tiles[3].html.includes("Billing and cancellation help"));
  assert.ok(model.tiles[3].html.includes("No privileged access"));
  assert.equal((model.tiles[4].html.match(/<li>/gu) ?? []).length, home.group.companies.length);
  assert.match(home.description, /economic, political, and ecological volatility/u);
  assert.doesNotMatch(model.tiles[0].html, /type-theoretic|Huidu Guanli|conurbanized/u);
});

test("TUFTE projection escapes public values and refuses missing or unsafe source identities", () => {
  const poisoned = structuredClone(home);
  poisoned.public.intro = '<script>alert("unsafe")</script>';
  poisoned.public.featured[0].action = '<em>not author HTML</em>';
  const model = project561GroupHome({ home: poisoned, estate });
  assert.ok(model.tiles[0].html.includes("&lt;script&gt;"));
  assert.ok(!model.tiles[0].html.includes("<script>"));
  assert.ok(model.tiles[2].html.includes("&lt;em&gt;"));
  const missing = structuredClone(estate);
  missing.nodes = missing.nodes.filter(n => n.host !== home.public.featured[0].host);
  assert.throws(() => project561GroupHome({ home, estate: missing }), /not a published estate entry/u);
  poisoned.group.sustainingSupport.url = "javascript:alert(1)";
  assert.throws(() => project561GroupHome({ home: poisoned, estate }), /Only public HTTPS/u);
  assert.throws(() => project561GroupHome({ home: {}, estate }), TypeError);
});
