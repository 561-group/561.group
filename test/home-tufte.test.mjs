import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { project561GroupHome, project561GroupHead } from "../src/home-tufte.mjs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const home = read("data/home.json");
const estate = read("data/estate.json");

test("the accepted concise public homepage is one TUFTE model over original Group sources", () => {
  const model = project561GroupHome({ home, estate });
  assert.equal(model.title, "The 561 Group");
  assert.equal(model.subtitle, "We make research useful.");
  assert.equal(model.metadata.description, home.description);
  assert.equal(model.metadata.canonical, "https://561.group/");
  assert.equal(model.metadata.type, "website");
  assert.equal(model.metadata.image, "https://561.group/card.png");
  const graph=model.metadata.structuredData["@graph"];
  assert.equal(graph[0]["@type"],"Organization");
  assert.equal(graph[0].description,home.description);
  assert.equal(graph[0].subOrganization.length,4);
  assert.ok(graph[0].sameAs.includes(home.group.actor));
  assert.deepEqual(graph[0].knowsAbout, home.group.knowsAbout);
  assert.ok(graph[0].knowsAbout.includes("ergodicity and path-dependent economic outcomes"));
  assert.deepEqual(model.navigation.map(x=>x.href),
    ["/#explore","/#shrimp-program","/#physical-world","/#companies","/contact/","/zh-hans/","/lkt/"]);
  assert.deepEqual(model.tiles.map(t => t.id), ["introduction","contact","explore","shrimp-program","physical-world","support","companies"]);
  assert.match(model.tiles[0].html, /Lakota-founded 561 Group/u);
  assert.ok(model.tiles[1].html.includes('href="/contact/"'));
  const exploration = model.tiles[2].html;
  for (const item of home.public.featured) {
    const node = estate.nodes.find(n => n.host === item.host);
    assert.ok(node, "no independent fabricated project");
    assert.ok(exploration.includes(item.action));
    assert.ok(exploration.includes("https://" + node.host + "/"));
  }
  const shrimp = model.tiles[3];
  assert.equal(shrimp.title, home.public.shrimpProgram.title);
  assert.ok(shrimp.html.includes(home.public.shrimpProgram.story));
  assert.ok(shrimp.html.includes(home.public.shrimpProgram.status));
  assert.ok(shrimp.html.includes(home.public.shrimpProgram.componentUrl));
  assert.match(shrimp.html, /pre-release engineering/u);
  assert.match(shrimp.html, /not a released SHRIMP service/u);
  assert.equal(model.tiles[4].title, home.public.materialApproach.headline);
  assert.ok(model.tiles[4].html.includes(home.public.materialApproach.body));
  assert.match(model.tiles[4].html, /water-cycle-informed governance/u);
  assert.match(model.tiles[4].html, /Indigenous and treaty rights/u);
  assert.ok(model.tiles[5].html.includes(home.group.sustainingSupport.url));
  assert.ok(model.tiles[5].html.includes("$10/month"));
  assert.ok(model.tiles[5].html.includes("Billing and cancellation help"));
  assert.ok(model.tiles[5].html.includes("No privileged access"));
  assert.equal((model.tiles[6].html.match(/<li>/gu) ?? []).length, home.group.companies.length);
  assert.match(home.description, /economic, political, and ecological volatility/u);
  assert.doesNotMatch(model.tiles[0].html, /type-theoretic|Huidu Guanli|conurbanized/u);
});

test("TUFTE projection escapes public values and refuses missing or unsafe source identities", () => {
  const poisoned = structuredClone(home);
  poisoned.public.materialApproach.body = '<script>invent authority</script>';
  poisoned.public.intro = '<script>alert("unsafe")</script>';
  poisoned.public.featured[0].action = '<em>not author HTML</em>';
  poisoned.public.shrimpProgram.story = '<script>SHRIMP wins</script>';
  poisoned.public.shrimpProgram.componentLabel = '<img src=x>';

  const model = project561GroupHome({ home: poisoned, estate });
  assert.ok(model.tiles[0].html.includes("&lt;script&gt;"));
  assert.ok(!model.tiles[0].html.includes("<script>"));
  assert.ok(model.tiles[2].html.includes("&lt;em&gt;"));
  assert.ok(model.tiles[4].html.includes("&lt;script&gt;invent authority&lt;/script&gt;"));
  assert.ok(!model.tiles[3].html.includes("<script>"));
  assert.ok(model.tiles[3].html.includes("&lt;script&gt;SHRIMP wins&lt;/script&gt;"));
  assert.ok(!model.tiles[3].html.includes("<img src=x>"));
  const missing = structuredClone(estate);
  missing.nodes = missing.nodes.filter(n => n.host !== home.public.featured[0].host);
  assert.throws(() => project561GroupHome({ home, estate: missing }), /not a published estate entry/u);
  poisoned.group.sustainingSupport.url = "javascript:alert(1)";
  assert.throws(() => project561GroupHome({ home: poisoned, estate }), /Only public HTTPS/u);
  const poisonedComponent = structuredClone(home);
  poisonedComponent.public.shrimpProgram.componentUrl = "javascript:alert(1)";
  assert.throws(() => project561GroupHome({ home: poisonedComponent, estate }), /Only public HTTPS/u);
  const missingShrimp = structuredClone(home);
  delete missingShrimp.public.shrimpProgram.status;
  assert.throws(() => project561GroupHome({ home: missingShrimp, estate }), /truthful introduction/u);
  const missingPosition = structuredClone(home);
  delete missingPosition.public.materialApproach.scope;
  assert.throws(() => project561GroupHome({ home: missingPosition, estate }), /material-world position/u);
  assert.throws(() => project561GroupHome({ home: {}, estate }), TypeError);
});

test("genuine TUFTE document head keeps the Group's original federation, feed and locale discovery",()=>{
  const head=project561GroupHead(home);
  assert.match(head,/name="fediverse:creator" content="@group@561\.group"/u);
  assert.match(head,/rel="me" href="https:\/\/561\.group\/actors\/group"/u);
  for(const route of ["/llms.txt","/feed.json","/feed.atom.xml","/feed.rss.xml","/estate.json"]){
    assert.ok(head.includes('href="'+route+'"'));
  }
  for(const tag of ["en","zh-Hans","lkt","x-default"])assert.ok(head.includes('hreflang="'+tag+'"'));
  const poisoned=structuredClone(home);
  poisoned.group.handle='<script>alert(1)</script>';
  assert.doesNotMatch(project561GroupHead(poisoned),/<script>/u);
  assert.throws(()=>project561GroupHead({...home,origin:"https://evil.invalid"}),TypeError);
});
