import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const estate = JSON.parse(await readFile(new URL("../data/estate.json", import.meta.url), "utf8"));

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
