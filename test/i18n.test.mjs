import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { report } from "@red-cup-engineering/l-space";
import { renderIndex, renderLlms, renderSitemap } from "../src/render.mjs";
import { LOCALES, POLICY, siteSpace, speaker } from "../src/locales.mjs";
import { contentMessages } from "../src/words.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const home = JSON.parse(read("data/home.json"));
const estate = { ...JSON.parse(read("data/estate.json")), revision: "fixture" };
const space = siteSpace({ interfaceSource: read("locales/en.arb"), renderings: LOCALES.slice(1).map((tag) => read(`locales/${tag}.arb`)), home, estate });
const page = (tag) => renderIndex(home, estate, speaker(space, tag, { origin: home.origin }));

test("every string the home page shows from data is a message of its own", () => {
  const keys = new Set(contentMessages(home, estate).map(([key]) => key));
  assert.ok(keys.has("home.design.sentence"));
  for (const n of Object.keys(home.design.notes)) assert.ok(keys.has(`home.design.notes.${n}`));
  home.doctrine.forEach((_, i) => assert.ok(keys.has(`home.doctrine.${i}.text`) && keys.has(`home.doctrine.${i}.source`)));
  for (const node of estate.nodes) assert.ok(keys.has(`estate.node.${node.host}.line`));
  for (const endpoint of estate.machine) assert.ok(keys.has(`estate.endpoint.${endpoint.verb} ${endpoint.url}`));
});

test("every rendering is well typed and current; the coincidence of readings holds", () => {
  const account = report(space, { policy: POLICY });
  assert.equal(account.locales["zh-Hans"]["ill-typed"], 0);
  assert.equal(account.locales["zh-Hans"].stale, 0);
  assert.equal(account.locales["zh-Hans"].coverage, 1);
  assert.equal(account.locales.lkt["ill-typed"], 0);
  assert.equal(account.agree, true);
  assert.deepEqual(account.counterexamples, []);
});

test("the English page keeps its words, and announces its languages", () => {
  const html = page("en");
  assert.match(html, /^<!doctype html>\n<html lang="en" dir="ltr">/u);
  assert.match(html, /<link rel="alternate" hreflang="zh-Hans" href="https:\/\/561\.group\/zh-hans\/">/u);
  assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/561\.group\/">/u);
  assert.match(html, /<span class="term">type-theoretic<\/span><sup class="ref"><a id="r1" href="#n1" aria-label="Note 1">1<\/a><\/sup> distributed operating system/u);
  assert.match(html, /<span class="count">12<\/span> public nodes\./u);
  assert.match(html, /<span lang="zh-Hans">灰度管理<\/span>/u, "Han runs in English notes are marked Simplified Chinese");
  assert.match(html, /<a href="\/zh-hans\/" hreflang="zh-Hans" lang="zh-Hans">简体中文<\/a>/u);
  assert.doesNotMatch(html, /class="mt-note"/u);
});

test("the Mandarin page speaks Mandarin, keeps every gloss, and discloses machine translation", () => {
  const html = page("zh-Hans");
  assert.match(html, /<html lang="zh-Hans" dir="ltr">/u);
  assert.match(html, /<title>561 集团<\/title>/u);
  assert.match(html, /<meta property="og:locale" content="zh_CN">/u);
  assert.match(html, /一个<span class="term">类型论<\/span><sup class="ref"><a id="r1" href="#n1" aria-label="注释 1">1<\/a><\/sup>的分布式操作系统/u);
  for (const n of Object.keys(home.design.notes)) assert.match(html, new RegExp(`id="r${n}" href="#n${n}"`, "u"), `gloss ${n} kept`);
  assert.match(html, /<p class="mt-note" role="note">本页部分内容由机器翻译，尚未经过人工审校。/u);
  assert.match(html, /<span class="count">12<\/span> 个公开节点。/u);
  assert.match(html, /<b>告知为真<\/b>：已应答/u);
  assert.match(html, /"phases":\[\["M","监控"\]/u);
  assert.doesNotMatch(html, /<span lang="zh-Hans">/u, "Chinese inside a Chinese page needs no marking");
});

test("the Lakota page serves its Lakota and marks every English fallback", () => {
  const html = page("lkt");
  assert.match(html, /<html lang="lkt" dir="ltr">/u);
  assert.match(html, /<nav class="langs" aria-label="Iyápi">/u);
  assert.match(html, /<p class="lede"><span lang="en">The 561 Group is a private organization/u);
  assert.match(html, /:lang\(lkt\)\{--serif:"Charis SIL"/u);
});

test("the sitemap lists every language with its alternates; llms.txt names them", () => {
  const sitemap = renderSitemap(home, "2026-10-19", speaker(space, "en", { origin: home.origin }).alternates());
  assert.match(sitemap, /<url><loc>https:\/\/561\.group\/zh-hans\/<\/loc><lastmod>2026-10-19<\/lastmod><xhtml:link rel="alternate" hreflang="en" href="https:\/\/561\.group\/"\/>/u);
  assert.match(sitemap, /<url><loc>https:\/\/561\.group\/contact\/<\/loc>/u);
  assert.match(renderLlms(home, estate), /## Languages\n\n- \[English\]\(https:\/\/561\.group\/\)\n- \[简体中文\]\(https:\/\/561\.group\/zh-hans\/\)/u);
});
