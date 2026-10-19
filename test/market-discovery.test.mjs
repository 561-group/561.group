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
