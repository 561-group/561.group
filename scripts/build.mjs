#!/usr/bin/env node
// Writes the generated files in public/ from data/. Fonts, favicon and card are sources.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { renderHumans, renderSecurity, renderIndex, renderLlms, renderLlmsFull, renderRobots, renderSitemap } from "../src/render.mjs";
import { readFeeds, mergeItems, renderJsonFeed, renderAtom, renderRss } from "../src/feed.mjs";
import { LOCALES, localePath, siteSpace, speaker } from "../src/locales.mjs";

const root = new URL("../", import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const home = await read("data/home.json");
// A release advertises the exact site-source commit supplied by its original GitHub checkout.
const sourceCommit = process.env.GITHUB_SHA;
if (sourceCommit !== undefined && !/^[0-9a-f]{40}$/iu.test(sourceCommit)) throw new Error("GITHUB_SHA must be one exact source commit");
const authored = await read("data/estate.json");
// The Group front door is independently publishable; Play owns its full game catalog.
// Visitors reach that live catalog through the one curated play.561.group entry.
// A homepage release must not require installing every independent game checkout.
const publicationDay = process.env.SITE_PUBLICATION_DATE;
if (publicationDay && (!/^\d{4}-\d{2}-\d{2}$/.test(publicationDay) ||
    new Date(publicationDay + "T00:00:00Z").toISOString().slice(0, 10) !== publicationDay)) {
  throw new Error("SITE_PUBLICATION_DATE must be one real YYYY-MM-DD UTC day");
}
const updated = publicationDay ?? new Date().toISOString().slice(0, 10);
// The market's live offer count, read from its x402 discovery; absent (never guessed) when unreadable.
const marketOffers = await (async () => {
  try {
    const response = await fetch(home.group.marketDiscovery, { signal: AbortSignal.timeout(8000), headers: { accept: "application/json" } });
    const { resources } = response.ok ? await response.json() : {};
    return Array.isArray(resources) ? resources.length : undefined;
  } catch {
    return undefined;
  }
})();
const facts = { marketOffers };
// What the Group is publishing: the companies' feeds, merged; any that cannot be read are skipped.
const items = mergeItems(await readFeeds(home.group.companies));
const estate = { ...authored, nodes: [...authored.nodes] };
estate.revision = createHash("sha256").update(JSON.stringify(estate)).digest("hex");

const hosts = new Set(estate.nodes.map((n) => n.host));
for (const door of estate.doors) if (!hosts.has(door)) throw new Error(`door ${door} is not an estate node`);
for (const n of estate.nodes) if (!estate.groups.some((g) => g.id === n.group)) throw new Error(`${n.host}: unknown group ${n.group}`);
if (estate.nodes.length + (estate.machines ?? []).length > 45) throw new Error("estate.json exceeds the Worker's per-request subrequest budget for probing");

// Every language the site serves: one L-space over the interface strings, the words derived from the
// data, and each locale's renderings; each locale's home page at its own path.
const readText = (path) => readFile(new URL(path, root), "utf8");
const space = siteSpace({
  interfaceSource: await readText("locales/en.arb"),
  renderings: await Promise.all(LOCALES.slice(1).map((tag) => readText(`locales/${tag}.arb`))),
  home,
  estate,
});
const speakers = Object.fromEntries(LOCALES.map((tag) => [tag, speaker(space, tag, { origin: home.origin })]));
const files = {
  ...(sourceCommit ? { "public/source-revision.json": JSON.stringify({
    repository: "561-group/561.group", sourceCommit, renderer: "TUFTE", application: "LivingWebServer", origin: home.origin,
  }, null, 2) + "\n" } : {}),
  "public/estate-records.json": JSON.stringify(estate, null, 2) + "\n",
  ...Object.fromEntries(LOCALES.map((tag) => [`public${localePath(tag)}index.html`, renderIndex(home, estate, speakers[tag], items)])),
  "public/feed.json": renderJsonFeed(home, items),
  "public/feed.atom.xml": renderAtom(home, items),
  "public/feed.rss.xml": renderRss(home, items),
  "public/llms.txt": renderLlms(home, estate, facts),
  "public/llms-full.txt": renderLlmsFull(home, estate, facts),
  "public/.well-known/security.txt": renderSecurity(home, new Date(`${updated}T00:00:00Z`)),
  [`public/${home.group.indexNowKey}.txt`]: `${home.group.indexNowKey}\n`,
  "public/humans.txt": renderHumans(home, updated),
  "public/robots.txt": renderRobots(home),
  "public/sitemap.xml": renderSitemap(home, updated, speakers.en.alternates()),
};
for (const [path, body] of Object.entries(files)) {
  await mkdir(new URL(path.slice(0, path.lastIndexOf("/") + 1), root), { recursive: true });
  await writeFile(new URL(path, root), body);
  console.log(`wrote ${fileURLToPath(new URL(path, root))} (${body.length} bytes)`);
}
