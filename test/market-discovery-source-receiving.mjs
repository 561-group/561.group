/*
 * Installed-source-independent qualification of the ORIGINAL website renderer
 * and its ORIGINAL test/market-discovery.test.mjs assertions.
 *
 * The original package imports @red-cup-engineering/.../web-feed, which is
 * intentionally unavailable in the standalone checkout. Node's vm linker
 * supplies a bounded serializer TEST DOUBLE ONLY. It does not install,
 * replace, publish, test compatibility with, or certify the upstream package.
 * Full PNPM/Play/codec integration and real publication remain separate gates.
 *
 * Running:
 *   node --experimental-vm-modules test/market-discovery-source-receiving.mjs
 */
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rendererFile = path.join(root, "src", "render.mjs");
const testFile = path.join(root, "test", "market-discovery.test.mjs");
const rendererSource = await readFile(rendererFile, "utf8");
const testSource = await readFile(testFile, "utf8");

const context = vm.createContext({ URL, structuredClone, console });
const modules = new Map();

function fixtureModule(id, names, exports) {
  return new vm.SyntheticModule(names, function setFixtureExports() {
    for (const name of names) this.setExport(name, exports[name]);
  }, { context, identifier: id });
}

const escapeHtmlText = value => String(value).replace(/[&<>"']/gu, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const xmlEscape = value => escapeHtmlText(value);
const sitemaps = entries => entries.map(entry => entry.loc);
const sitemap = entries => '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + sitemaps(entries).map(url => '  <url><loc>' + xmlEscape(url) + '</loc></url>').join('\n')
  + '\n</urlset>\n';
const sitemapText = entries => sitemaps(entries).join('\n') + '\n';
const robots = url => 'User-agent: *\nAllow: /\nSitemap: ' + url + '\n';

const codecId = "@red-cup-engineering/computer-serialized-content-engineering-services-section/web-feed";
modules.set(codecId, fixtureModule(codecId, [
  "escapeHtmlText", "robots", "sitemap", "sitemapText",
], { escapeHtmlText, robots, sitemap, sitemapText }));
modules.set("node:assert/strict", fixtureModule("node:assert/strict", ["default"], { default: assert }));
modules.set("node:test", fixtureModule("node:test", ["default"], { default: test }));
modules.set("node:fs/promises", fixtureModule("node:fs/promises", ["readFile"], { readFile }));

const rendererId = pathToFileURL(rendererFile).href;
const testId = pathToFileURL(testFile).href;
const moduleOptions = identifier => ({
  context, identifier,
  initializeImportMeta(meta) { meta.url = identifier; },
});
const renderer = new vm.SourceTextModule(rendererSource, moduleOptions(rendererId));
const readerTests = new vm.SourceTextModule(testSource, moduleOptions(testId));
modules.set(rendererId, renderer);
modules.set(testId, readerTests);

await readerTests.link(specifier => {
  if (specifier === "../src/render.mjs") return renderer;
  const found = modules.get(specifier);
  if (!found) throw new Error("Source qualification refuses undeclared import: " + specifier);
  return found;
});

console.log("QUALIFICATION: original website source and original twelve reader checks.");
console.log("LIMIT: external web-feed serializers are explicit test doubles only; original installed PNPM, Play, Cloudflare and beneficiary receiving NOT tested.");
await readerTests.evaluate();
