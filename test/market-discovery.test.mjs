import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderIndex, renderLlms } from "../src/render.mjs";

const estate = JSON.parse(await readFile(new URL("../data/estate.json", import.meta.url), "utf8"));
const home = JSON.parse(await readFile(new URL("../data/home.json", import.meta.url), "utf8"));

test("corporate public face never hardcodes a stale market offer/skill count", () => {
  const market = estate.nodes.find(row => row.host === "market.561.group");
  assert.ok(market);
  assert.match(market.line, /seller's priced computations|x402 terms/u);
  assert.doesNotMatch(market.line, /\b(?:[0-9]+|sixty-one)\s+(?:skills|operations|routes)\b/iu);
  const card = estate.machine.find(row => row.url === "https://market.561.group/.well-known/agent-card.json");
  assert.ok(card);
  assert.doesNotMatch(card.what, /\b(?:[0-9]+|sixty-one)\s+skills\b/iu);
});

test("agents discover a single market's x402, A2A and MCP faces, not new shadow inventories", () => {
  const expected = [
    ["GET", "https://market.561.group/.well-known/agent-card.json"],
    ["GET", "https://market.561.group/.well-known/x402.json"],
    ["GET", "https://market.561.group/.well-known/x402-service.json"],
    ["GET", "https://market.561.group/v1/catalog"],
    ["GET", "https://market.561.group/llms.txt"],
    ["POST", "https://market.561.group/mcp"],
  ];
  for(const [verb,url] of expected) {
    assert.equal(estate.machine.filter(row => row.verb === verb && row.url === url).length, 1,
      "one authored endpoint: " + url);
  }
  assert.equal(estate.machine.filter(row => row.url.startsWith("https://market.561.group")).length,
    expected.length,"no alternate market catalogs, signing endpoints or invented escrow wallets");
  assert.ok(estate.machine.every(row => row.url.startsWith("https://")));
});

test("homepage JSON-LD binds one named Group organization to the site and the visible public pages", () => {
  const page = renderIndex(home, estate);
  const embedded = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u);
  assert.ok(embedded, "homepage must publish JSON-LD");
  const graph = JSON.parse(embedded[1]);
  assert.equal(graph["@context"], "https://schema.org");
  assert.equal(graph["@graph"].length, 3);
  const [org, site, list] = graph["@graph"];
  assert.equal(org["@id"], "https://561.group/#organization");
  assert.equal(org.name, home.name);
  assert.equal(org.description, home.description);
  assert.equal(org.logo, "https://561.group/favicon.svg");
  assert.deepEqual(org.contactPoint, {
    "@type": "ContactPoint",
    contactType: "service intake",
    url: "https://561.group/contact/",
  });
  assert.match(page, /href="\/contact\/"/u, "the contact destination is visible to visitors");
  assert.equal(site["@id"], "https://561.group/#website");
  assert.equal(site.publisher["@id"], org["@id"]);
  assert.equal(site.mainEntity["@id"], list["@id"]);
  assert.deepEqual(list.itemListElement.map(row => row.item.url),
    estate.nodes.map(row => row.url ?? `https://${row.host}/`));
  assert.deepEqual(list.itemListElement.map(row => row.item.name), estate.nodes.map(row => row.name));
  assert.ok(list.itemListElement.every(row => row.item["@type"] === "WebPage"),
    "the Group must not claim corporate ownership merely by linking to a page");
});

test("JSON-LD preserves public text without permitting script-breaking markup", () => {
  const maliciousText = "</script><script>alert('no')</script>";
  const changed = {
    ...estate,
    nodes: [{ ...estate.nodes[0], line: maliciousText }, ...estate.nodes.slice(1)],
  };
  const html = renderIndex(home, changed);
  assert.doesNotMatch(html, /<script>alert\('no'\)<\/script>/u);
  const captured = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u);
  assert.ok(captured);
  const data = JSON.parse(captured[1]);
  assert.equal(data["@graph"][2].itemListElement[0].item.description, maliciousText);
});

test("accepted Stripe support checkout is visible to people and agents with true monthly terms", () => {
  const support = home.support;
  assert.equal(support.monthlyUsd, 10);
  assert.match(support.checkoutUrl, /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/u);
  const page = renderIndex(home, estate);
  const machineText = renderLlms(home, estate);
  assert.equal(page.split(`href="${support.checkoutUrl}"`).length - 1, 1, "one real hosted checkout in the public page");
  assert.match(page, /Support public work · USD \$10\/month/u);
  assert.match(machineText, /Voluntary USD \$10\/month/u);
  assert.ok(machineText.includes(support.checkoutUrl), "agent-readable text selects the same checkout");
  assert.match(page, /until canceled/u);
  assert.match(page, /not a tax-deductible charitable contribution/u);
  assert.match(page, /Request private billing help/u);
  assert.doesNotMatch(page, /href="[^"]*ai-visibility-audit[^"]*"/u, "inactive paid audit remains gated");
});

test("the support channel refuses spoofed Stripe links or unqualified prices", () => {
  for (const url of ["http://buy.stripe.com/28E28s1b4gJcb2Y3Io5EY02", "https://evil.invalid/collect", "https://buy.stripe.com/28E28s1b4gJcb2Y3Io5EY02?redirect=evil"]) {
    assert.throws(() => renderIndex({ ...home, support: { ...home.support, checkoutUrl: url } }, estate), /accepted exact Stripe checkout URL/u);
  }
  assert.throws(() => renderLlms({ ...home, support: { ...home.support, monthlyUsd: 0 } }, estate), /positive whole-dollar monthly price/u);
});

test("Leader's ordered economic–political–ecological mission propagates into every reader", () => {
  const exact = "through economic, political, and ecological volatility.";
  assert.ok(home.description.endsWith(exact));
  assert.doesNotMatch(home.description, /political, financial, and economic volatility/u);
  const page = renderIndex(home, estate);
  const machine = renderLlms(home, estate);
  assert.match(page, /through economic, political, and ecological volatility/u);
  assert.match(machine, /through economic, political, and ecological volatility/u);
  assert.match(page, /<meta name="description" content="[^"]*economic, political, and ecological volatility\."/u);
  const graph = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)[1])["@graph"];
  assert.equal(graph[0].description, home.description);
  assert.equal(graph[1].description, home.description);
});

test("MAPE-K visual and semantic reading sequence follows the authored plan", () => {
  assert.deepEqual(home.design.loop.map(step => step.letter), ["M", "A", "P", "E"]);
  const page = renderIndex(home, estate);
  const cells = [...page.matchAll(/<div class="cell" data-letter="([MAPE])">/gu)].map(m => m[1]);
  assert.deepEqual(cells, ["M", "A", "P", "E"],
    "page order must not show Execute before Plan or depend on 2-D positioning");
  const phases = [...page.matchAll(/<span class="phase-name">(0[1-4]) · ([A-Za-z]+)<\/span>/gu)]
    .map(m => [m[1],m[2]]);
  assert.deepEqual(phases,[["01","Monitor"],["02","Analyze"],["03","Plan"],["04","Execute"]]);
});

test("visitor work has native action, declared limit and evidence/repair before design", () => {
  const page = renderIndex(home, estate);
  const machine = renderLlms(home, estate);
  assert.ok(page.indexOf('id="start"') > page.indexOf('class="wrap hero"'));
  assert.ok(page.indexOf('id="start"') < page.indexOf('id="design"'),
    "reader should choose an action before parsing the architecture");
  assert.match(page, /<nav aria-label="Sections">[^<]*<a href="#start">Start<\/a>/u);
  assert.match(page, /<a href="\/contact\/">Contact<\/a><\/nav>/u);
  assert.match(page, /<ul class="reader-paths">/u);
  assert.match(page, /<details class="reader-gutter"><summary>Inspect the supporting route<\/summary>/u);
  assert.match(page, /What this does not establish:/u);
  assert.match(page, /<noscript><p class="reading">/u);
  assert.match(page, /href="\/estate.json">dated HTTP observations/u);
  assert.match(machine, /## Find your route/u);
  assert.equal((page.match(/class="reader-card"/gu) ?? []).length, home.readerPaths.length);
  const ids = ["ask", "explore", "read", "use"];
  assert.deepEqual(home.readerPaths.map(r => r.id), ids);
  for (const route of home.readerPaths) {
    assert.match(page, new RegExp('id="reader-' + route.id + '"'));
    assert.match(page, new RegExp('href="' + route.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"'));
    assert.ok(page.includes(route.boundary), "the consequence limit must be visible: " + route.id);
    assert.ok(machine.includes(route.boundary), "the agent also receives the same limit: " + route.id);
    assert.ok(machine.includes(new URL(route.href, home.origin + "/").href));
    assert.ok(machine.includes(new URL(route.evidenceHref, home.origin + "/").href));
  }
});

test("first-party reader route admission refuses unsupported or malformed transitions", () => {
  const reject = (change) => {
    const changed = structuredClone(home);
    change(changed);
    assert.throws(() => renderIndex(changed, estate), /reader/u);
    assert.throws(() => renderLlms(changed, estate), /reader/u);
  };
  reject(h => { h.readerPaths[0].href = "https://untrusted.invalid/intake"; });
  reject(h => { h.readerPaths[0].href = "javascript:alert(1)"; });
  reject(h => { h.readerPaths[1].evidenceHref = "//another.host/"; });
  reject(h => { h.readerPaths[0].id = "bad id"; });
  reject(h => { h.readerPaths[1].id = "ask"; });
  reject(h => { h.readerPaths[0].boundary = ""; });
  reject(h => { h.readerPaths[0].step = "wrong\nnew line"; });
  reject(h => { h.readerPaths.reverse(); });
  reject(h => { h.readerPaths = []; });
  reject(h => { h.readerIntro = ""; });
});

test("authored reading text is escaped in HTML while the original choice order stays fixed", () => {
  const changed = structuredClone(home);
  const malicious = '<img src=x onerror="doNotRun()">';
  changed.readerPaths[0].step = malicious;
  changed.readerPaths[1].boundary = malicious;
  const page = renderIndex(changed, estate);
  assert.doesNotMatch(page, /<img src=x onerror=/u);
  assert.match(page, /&lt;img src=x onerror=&quot;doNotRun\(\)&quot;&gt;/u);
  assert.match(page, /id="reader-ask"[\s\S]*id="reader-explore"[\s\S]*id="reader-read"[\s\S]*id="reader-use"/u);
  assert.match(page, /class="reader-boundary"/u);
});

test("social and structured metadata cannot advertise the superseded mission card", () => {
  const page = renderIndex(home, estate);
  const embedded = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u);
  assert.ok(embedded);
  const [organization] = JSON.parse(embedded[1])["@graph"];
  assert.equal(organization.description, home.description);
  assert.ok(!Object.hasOwn(organization, "image"),
    "old card.png prints political/financial/economic, so it cannot be a source-true identity image");
  assert.doesNotMatch(page, /property="og:image"/u);
  assert.doesNotMatch(page, /summary_large_image/u);
  assert.match(page, /<meta name="twitter:card" content="summary">/u);
  assert.match(page, /<meta property="og:description" content="[^"]*economic, political, and ecological volatility\."/u);
});

test("formal mathematical ontology generates the public story before the downstream architecture", () => {
  const ids = ["relationality", "obsmetrologia", "sign", "agents"];
  assert.deepEqual(home.foundation.stages.map(stage => stage.id), ids);
  const page = renderIndex(home, estate);
  const machine = renderLlms(home, estate);
  assert.ok(page.indexOf('id="foundation"') > page.indexOf('id="start"'),
    "visitor choices are alternative next actions before the explanatory dependency");
  assert.ok(page.indexOf('id="foundation"') < page.indexOf('id="design"'),
    "mathematical generative dependency must be shown before derived system design");
  assert.ok(page.indexOf('class="foundation-hero"') < page.indexOf('id="foundation"'));
  assert.match(page, /<ol class="foundation-chain">/u,
    "the research-to-agent transition is a true ordered dependency, not unordered marketing themes");
  assert.match(page, /<a href="#foundation">Foundation<\/a>/u);
  assert.match(machine, /## Mathematical foundation/u);
  assert.equal(home.readerPaths[2].href, "#foundation");
  assert.match(page, /Formal mathematics is the foundation of our agentic world/u);
  assert.match(machine, /Formal mathematics is the foundation of our agentic world/u);
  assert.match(page, /Mark → Utterance → Articulating → Predicating → Positing → Settling/u);
  assert.match(machine, /Mark → Utterance → Articulating → Predicating → Positing → Settling/u);
  let previous = -1;
  for (const stage of home.foundation.stages) {
    const here = page.indexOf('id="foundation-' + stage.id + '"');
    assert.ok(here > previous, stage.id + " must follow its source predecessor");
    previous = here;
    assert.ok(page.includes(stage.sourceUrl), stage.id + " source must be publicly inspectable");
    assert.ok(machine.includes(stage.sourceUrl), stage.id + " source must be inspectable by agents");
    assert.ok(page.includes(stage.limit), stage.id + " must carry its local evidence boundary");
    assert.ok(machine.includes(stage.limit), stage.id + " must preserve its evidence boundary for agents");
  }
  assert.match(page, /customer-accepted results are distinct observations/u);
  assert.match(machine, /Lean-checked theorem, verified software correspondence, installed operation/u);
});

test("mathematical source admission rejects false order, missing boundaries, spoofed source and injected markup", () => {
  const reject = change => {
    const copy = structuredClone(home);
    change(copy);
    assert.throws(() => renderIndex(copy, estate), /foundation/u);
    assert.throws(() => renderLlms(copy, estate), /foundation/u);
  };
  reject(copy => { copy.foundation.stages.reverse(); });
  reject(copy => { copy.foundation.stages[1].limit = ""; });
  reject(copy => { copy.foundation.stages[2].sourceUrl = "https://github.com.evil.invalid/red-cup-engineering/signcraft"; });
  reject(copy => { copy.foundation.stages[2].sourceUrl = "javascript:alert(1)"; });
  reject(copy => { copy.foundation.thesis = ""; });
  const copy = structuredClone(home);
  copy.foundation.stages[1].account = '<script>alert("math")</script>';
  const page = renderIndex(copy, estate);
  assert.doesNotMatch(page, /<script>alert\("math"\)<\/script>/u);
  assert.match(page, /&lt;script&gt;alert/u);
  const machine = renderLlms(copy, estate);
  assert.ok(machine.includes(copy.foundation.stages[1].account),
    "the text-facing account preserves literal source text without executing markup");
});
