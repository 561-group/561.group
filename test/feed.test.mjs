import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readFeeds, mergeItems, renderJsonFeed, renderAtom, renderRss } from "../src/feed.mjs";

const home = JSON.parse(readFileSync(new URL("../data/home.json", import.meta.url), "utf8"));
const [science, engineering, operations, services] = home.group.companies;
const item = (id, date, extra = {}) => ({ id, url: `https://x.invalid/${id}`, title: `T ${id}`, summary: `S ${id}`, date_published: date, tags: ["a"], content_html: "<p>dropped</p>", ...extra });
const feed = (items) => ({ version: "https://jsonfeed.org/version/1.1", items });

test("feeds merge newest first with the company as author, drop bodies, dedupe and cap", () => {
  const merged = mergeItems([
    { company: science, feed: feed([item("a", "2026-10-01T00:00:00Z"), item("dup", "2026-10-05T00:00:00Z")]) },
    { company: services, feed: feed([item("b", "2026-10-10T00:00:00Z"), item("dup", "2026-10-06T00:00:00Z"), item("undated", undefined)]) },
  ]);
  assert.deepEqual(merged.map((i) => i.id), ["b", "dup", "a", "undated"]);
  assert.deepEqual(merged[0].authors, [{ name: "Causeway Services", url: "https://services.561.group/" }]);
  assert.equal(merged[1].authors[0].name, "Lenticule Science");
  assert.equal(merged[0].content_html, undefined);
  assert.equal(mergeItems([{ company: science, feed: feed(Array.from({ length: 100 }, (_, i) => item(`n${i}`, `2026-01-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00Z`))) }]).length, 60);
});

test("an unreachable or malformed feed is logged and skipped, never fatal", async () => {
  const logs = [];
  const fetchImpl = async (url) => {
    if (url.includes("science")) throw new Error("down");
    if (url.includes("engineering")) return new Response("nope", { status: 503 });
    if (url.includes("operations")) return new Response(JSON.stringify({ nothing: true }));
    return new Response(JSON.stringify(feed([item("ok", "2026-10-10T00:00:00Z")])));
  };
  const read = await readFeeds([science, engineering, operations, services], { fetchImpl, log: (m) => logs.push(m) });
  assert.deepEqual(read.map((r) => r.company.id), ["services"]);
  assert.equal(logs.length, 3);
  assert.deepEqual(mergeItems([]), []);
});

test("the three formats carry every item", () => {
  const items = mergeItems([{ company: services, feed: feed([item("a&b", "2026-10-10T00:00:00Z")]) }]);
  const json = JSON.parse(renderJsonFeed(home, items));
  assert.equal(json.version, "https://jsonfeed.org/version/1.1");
  assert.equal(json.feed_url, "https://561.group/feed.json");
  assert.equal(json.items.length, 1);
  assert.match(renderAtom(home, items), /<entry>\s*<id>a&amp;b<\/id>[\s\S]*<published>2026-10-10T00:00:00Z<\/published>/u);
  assert.match(renderRss(home, items), /<guid isPermaLink="false">a&amp;b<\/guid>[\s\S]*<pubDate>Sat, 10 Oct 2026 00:00:00 GMT<\/pubDate>/u);
});
