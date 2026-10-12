#!/usr/bin/env node
// Writes the generated files in public/ from data/. Fonts, favicon and card are sources.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { renderHumans, renderIndex, renderLlms, renderRobots, renderSitemap } from "../src/render.mjs";

import { discoverCatalog } from "../../../../public-services-section/services/public-media-services-section/services/public-games-services-section/services/public-web-games-services-section/sites/play.561.group/src/discover-catalog.mjs";
import { playUrl, hasBrowser } from "../../../../public-services-section/services/public-media-services-section/services/public-games-services-section/services/public-web-games-services-section/sites/play.561.group/js/catalog.mjs";

const root = new URL("../", import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const home = await read("data/home.json");
const authored = await read("data/estate.json");
const { catalog } = await discoverCatalog();
// Keep curated non-game doors; the authored game records own their names and entry paths.
const knownUrls = new Set(authored.nodes.map((n) => n.url ?? `https://${n.host}/`));
const games = catalog.games.filter(hasBrowser).filter((game) => !knownUrls.has(playUrl(game)))
  .map((game) => ({ host: new URL(playUrl(game)).host, url: playUrl(game), name: game.displayName, group: "games", line: game.description }));
const estate = { ...authored, nodes: [...authored.nodes, ...games] };
estate.revision = createHash("sha256").update(JSON.stringify(estate)).digest("hex");

const hosts = new Set(estate.nodes.map((n) => n.host));
for (const door of estate.doors) if (!hosts.has(door)) throw new Error(`door ${door} is not an estate node`);
for (const n of estate.nodes) if (!estate.groups.some((g) => g.id === n.group)) throw new Error(`${n.host}: unknown group ${n.group}`);
if (estate.nodes.length + (estate.machines ?? []).length > 45) throw new Error("estate.json exceeds the Worker's per-request subrequest budget for probing");

const updated = new Date().toISOString().slice(0, 10);
const files = {
  "public/estate-records.json": JSON.stringify(estate, null, 2) + "\n",
  "public/index.html": renderIndex(home, estate),
  "public/llms.txt": renderLlms(home, estate),
  "public/humans.txt": renderHumans(home, updated),
  "public/robots.txt": renderRobots(home),
  "public/sitemap.xml": renderSitemap(home, updated),
};
for (const [path, body] of Object.entries(files)) {
  await writeFile(new URL(path, root), body);
  console.log(`wrote ${fileURLToPath(new URL(path, root))} (${body.length} bytes)`);
}
