#!/usr/bin/env node
// Writes the generated files in public/ from data/. Fonts, favicon and card are sources.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { renderHumans, renderIndex, renderLlms, renderLlmsFull, renderRobots, renderSitemap } from "../src/render.mjs";
import { LOCALES, localePath, siteSpace, speaker } from "../src/locales.mjs";

import { discoverCatalog } from "@causeway-services/play/catalog";
import { playUrl, hasBrowser } from "@causeway-services/play/catalog-presentation";
import { catalogSourcesFromEnvironment, publicationDateFromEnvironment } from "@causeway-services/play/composition";

const root = new URL("../", import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const home = await read("data/home.json");
const authored = await read("data/estate.json");
// Bind the same authored catalog through its owning package. Outside the
// integrated checkout, callers provide explicit source roots; discovery refuses
// missing sources rather than replacing the games with a static shortlist.
const sources = catalogSourcesFromEnvironment();
const date = publicationDateFromEnvironment() ?? new Date();
const updated = date.toISOString().slice(0, 10);
// Keep curated non-game doors; the authored game records own their names and entry paths.
const knownUrls = new Set(authored.nodes.map((n) => n.url ?? `https://${n.host}/`));
let games;
if (sources === undefined && process.env.ESTATE_GAMES_SNAPSHOT) {
  // Explicit, named fallback for a checkout without the game sources: reuse the games of an
  // earlier published estate-records.json, unchanged. Never a default; discovery stays the rule.
  const earlier = JSON.parse(await readFile(process.env.ESTATE_GAMES_SNAPSHOT, "utf8"));
  games = earlier.nodes.filter((n) => n.group === "games" && !knownUrls.has(n.url ?? `https://${n.host}/`));
  console.warn(`games taken from the earlier published record ${process.env.ESTATE_GAMES_SNAPSHOT}, not from discovery`);
} else {
  const { catalog } = await discoverCatalog({ sources, generatedDate: updated, observePages: false });
  games = catalog.games.filter(hasBrowser).filter((game) => !knownUrls.has(playUrl(game)))
    .map((game) => ({ host: new URL(playUrl(game)).host, url: playUrl(game), name: game.displayName, group: "games", line: game.description }));
}
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
const estate = { ...authored, nodes: [...authored.nodes, ...games] };
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
  "public/estate-records.json": JSON.stringify(estate, null, 2) + "\n",
  ...Object.fromEntries(LOCALES.map((tag) => [`public${localePath(tag)}index.html`, renderIndex(home, estate, speakers[tag])])),
  "public/llms.txt": renderLlms(home, estate, facts),
  "public/llms-full.txt": renderLlmsFull(home, estate, facts),
  "public/humans.txt": renderHumans(home, updated),
  "public/robots.txt": renderRobots(home),
  "public/sitemap.xml": renderSitemap(home, updated, speakers.en.alternates()),
};
for (const [path, body] of Object.entries(files)) {
  await mkdir(new URL(path.slice(0, path.lastIndexOf("/") + 1), root), { recursive: true });
  await writeFile(new URL(path, root), body);
  console.log(`wrote ${fileURLToPath(new URL(path, root))} (${body.length} bytes)`);
}
