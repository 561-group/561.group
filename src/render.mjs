import { escapeHtmlText as esc, robots as serializeRobots, sitemap as serializeSitemap } from "@red-cup-engineering/computer-serialized-content-engineering-services-section/web-feed";
// Renders the 561.group public files from data/home.json and data/estate.json.
// Pure: data in, file contents out. No person is named anywhere on this site.

const cjk = (s) => esc(s).replace(/[㐀-鿿]+/g, (run) => `<span lang="zh">${run}</span>`);

const plain = (parts) => parts.map((p) => (typeof p === "string" ? p : p.text)).join("");

function inline(parts) {
  return parts
    .map((p) =>
      typeof p === "string"
        ? esc(p)
        : `<span class="term">${esc(p.text)}</span><sup class="ref"><a id="r${p.note}" href="#n${p.note}" aria-label="Note ${p.note}">${p.note}</a></sup>`,
    )
    .join("");
}

const sectionLabel = (n, title) =>
  `<p class="sec-label"><span class="sec-num">§${n}</span><span>${esc(title)}</span></p>`;

const nodeUrl = (node) => node.url ?? `https://${node.host}/`;

// The original Group source names the single Stripe-hosted price/checkout.
// Refuse spoofable destinations rather than presenting a made-up payment route.
function acceptedSupportOffer(support) {
  if (!support || !Number.isSafeInteger(support.monthlyUsd) || support.monthlyUsd <= 0) {
    throw new TypeError("sustaining support must have a positive whole-dollar monthly price");
  }
  if (typeof support.checkoutUrl !== "string" || !/^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/u.test(support.checkoutUrl)) {
    throw new TypeError("sustaining support needs its accepted exact Stripe checkout URL");
  }
  if (typeof support.description !== "string" || typeof support.terms !== "string") {
    throw new TypeError("sustaining support must explain its public work and billing conditions");
  }
  return support;
}

function nodeTile(node, { door = false } = {}) {
  return `<li><a class="node${door ? " door" : ""}" href="${esc(nodeUrl(node))}" data-host="${esc(node.host)}" data-url="${esc(nodeUrl(node))}" data-told="neither">
  <span class="node-head"><span class="told" aria-hidden="true">○</span><span class="host">${esc(node.host)}</span></span>
  <span class="name">${esc(node.name)}</span>
  <span class="line">${esc(node.line)}</span>
  <span class="told-text visually-hidden">no reading yet</span>
</a></li>`;
}


/**
 * These are alternate reader choices, not a theorem sequence or source graph.
 * Only this site's real first-party routes can be selected; an author supplies
 * both the action and the explicit limit/repair of the inferred next step.
 */
const READER_TARGETS = new Set(["/contact/", "/estate.json", "/llms.txt", "#foundation", "#design", "#estate", "#agents", "#support"]);
const READER_ID = /^[a-z][a-z0-9-]*$/u;
function acceptedReaderPaths(home) {
  if (typeof home.readerIntro !== "string" || !home.readerIntro.trim() || home.readerIntro.length > 400) {
    throw new TypeError("reader entry needs a bounded introduction");
  }
  const paths = home.readerPaths;
  if (!Array.isArray(paths) || paths.length < 2 || paths.length > 8) {
    throw new RangeError("reader entry needs two to eight explicit routes");
  }
  const ids = new Set();
  for (const route of paths) {
    if (!route || typeof route !== "object" || Array.isArray(route) ||
        typeof route.id !== "string" || !READER_ID.test(route.id) || ids.has(route.id)) {
      throw new TypeError("reader routes require unique safe identifiers");
    }
    ids.add(route.id);
    for (const key of ["title", "audience", "step", "action", "boundary", "evidenceLabel"]) {
      if (typeof route[key] !== "string" || !route[key].trim() ||
          route[key].length > 420 || /[\u0000-\u001f\u007f]/u.test(route[key])) {
        throw new TypeError("reader route requires bounded " + key);
      }
    }
    for (const key of ["href", "evidenceHref"]) {
      if (!READER_TARGETS.has(route[key])) {
        throw new TypeError("reader route has an unsupported first-party destination");
      }
    }
  }
  // This is an unordered choice of routes; use the house's PTGAE default
  // lexical ordering rather than quietly suggesting a dependency order.
  const titles = paths.map((route) => route.title);
  if (titles.some((title, i) => i > 0 && titles[i - 1].localeCompare(title, "en") > 0)) {
    throw new TypeError("reader route choices must be alphabetically ordered");
  }
  return paths;
}

function renderReaderPaths(paths) {
  return '<ul class="reader-paths">'
    + paths.map((route) =>
      '<li class="reader-card" id="reader-' + esc(route.id) + '">'
      + '<h3>' + esc(route.title) + '</h3>'
      + '<p class="reader-audience">' + esc(route.audience) + '</p>'
      + '<p class="reader-step"><strong>Reader task:</strong> ' + esc(route.step) + '</p>'
      + '<p class="reader-action"><a href="' + esc(route.href) + '">' + esc(route.action) + ' <span aria-hidden="true">→</span></a></p>'
      + '<p class="reader-boundary"><strong>What this does not establish:</strong> ' + esc(route.boundary) + '</p>'
      + '<details class="reader-gutter"><summary>Inspect the supporting route</summary>'
      + '<p><a href="' + esc(route.evidenceHref) + '">' + esc(route.evidenceLabel) + '</a></p></details>'
      + '</li>'
    ).join("")
    + '</ul>';
}


/**
 * The research→formal→software→operation list is source dependency, not a
 * collection of themes. The homepage renders the original research sources,
 * while proof/implementation/receiving status stays with those actual owners.
 */
const FOUNDATION_IDS = ["relationality", "obsmetrologia", "sign", "agents"];
const FOUNDATION_SOURCE_OWNERS = new Set(["lenticule-science", "red-cup-engineering"]);
function acceptedFoundation(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("foundation requires a source-authored research account");
  }
  for (const key of ["tagline", "headline", "thesis", "orientation", "feedback", "frontier"]) {
    if (typeof value[key] !== "string" || !value[key].trim() ||
        value[key].length > 1100 || /[\u0000-\u001f\u007f]/u.test(value[key])) {
      throw new TypeError("foundation requires a bounded " + key);
    }
  }
  if (!Array.isArray(value.stages) || value.stages.length !== FOUNDATION_IDS.length ||
      value.stages.some((stage, i) => !stage || stage.id !== FOUNDATION_IDS[i])) {
    throw new TypeError("foundation must preserve the generative order");
  }
  for (const stage of value.stages) {
    for (const key of ["name", "kind", "account", "limit", "sourceLabel"]) {
      if (typeof stage[key] !== "string" || !stage[key].trim() ||
          stage[key].length > 900 || /[\u0000-\u001f\u007f]/u.test(stage[key])) {
        throw new TypeError("foundation stage requires a bounded " + key);
      }
    }
    let url;
    try { url = new URL(stage.sourceUrl); } catch { throw new TypeError("foundation needs an admissible source URL"); }
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.protocol !== "https:" || url.hostname !== "github.com" ||
        url.username || url.password || url.search || url.hash || url.port ||
        !FOUNDATION_SOURCE_OWNERS.has(parts[0]) || !parts[1] || parts.length < 4 ||
        !["blob", "tree"].includes(parts[2])) {
      throw new TypeError("foundation source must link to the original qualified research/software location");
    }
  }
  return value;
}
function renderFoundationStages(foundation) {
  return '<ol class="foundation-chain">'
    + foundation.stages.map((stage) =>
      '<li id="foundation-' + esc(stage.id) + '">'
      + '<p class="foundation-kind">' + esc(stage.kind) + '</p>'
      + '<h3>' + esc(stage.name) + '</h3>'
      + '<p>' + esc(stage.account) + '</p>'
      + '<p class="foundation-limit"><strong>Evidence boundary:</strong> ' + esc(stage.limit) + '</p>'
      + '<p class="foundation-source"><a href="' + esc(stage.sourceUrl) + '" rel="noopener noreferrer">' + esc(stage.sourceLabel) + ' ↗</a></p>'
      + '</li>'
    ).join("")
    + '</ol>';
}

function tickerText(home) {
  const d = home.design;
  const phrases = [home.foundation.headline, ...home.foundation.stages.map((stage) => stage.name), plain(d.sentence), ...d.loop.map((l) => plain(l.line)), plain(d.knowledge.line), plain(d.whole)];
  return phrases.map((p) => esc(p.replace(/\.$/, ""))).join(" <b>✶</b> ") + " <b>✶</b> ";
}

const CSS = `
@font-face{font-family:"Space Grotesk";src:url(/fonts/space-grotesk.woff2) format("woff2");font-weight:300 700;font-display:swap}
@font-face{font-family:"Roboto Slab";src:url(/fonts/roboto-slab.woff2) format("woff2");font-weight:300 800;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url(/fonts/jetbrains-mono.woff2) format("woff2");font-weight:400 700;font-display:swap}
:root{
  --ink:#0a0a0a;--ink-soft:#494742;--surface:#f2ead8;--surface-deep:#e2daca;--rule:#cdc6b7;
  --alarm:#ff4530;--alarm-ink:#c52a17;--accent:#3d5588;
  --band:#0a0a0a;--band-ink:#f2ead8;--band-soft:#999791;--band-rule:#2e281d;
  --sans:"Space Grotesk","Helvetica Neue",Arial,sans-serif;
  --serif:"Roboto Slab",Rockwell,Georgia,serif;
  --mono:"JetBrains Mono",ui-monospace,"Courier New",monospace;
  --gutter:56px;--max:1320px;--measure:44rem;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ink:#e4e4e4;--ink-soft:#999791;--surface:#120c02;--surface-deep:#1c160a;--rule:#2a2519;
  --alarm-ink:#ff6a55;--accent:#88a4dd;
  --band:#f2ead8;--band-ink:#0a0a0a;--band-soft:#494742;--band-rule:#cdc6b7;
}}
:root[data-theme="dark"]{
  --ink:#e4e4e4;--ink-soft:#999791;--surface:#120c02;--surface-deep:#1c160a;--rule:#2a2519;
  --alarm-ink:#ff6a55;--accent:#88a4dd;
  --band:#f2ead8;--band-ink:#0a0a0a;--band-soft:#494742;--band-rule:#cdc6b7;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{color-scheme:light dark;-webkit-text-size-adjust:100%;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{min-height:100dvh;background:var(--surface);background-image:radial-gradient(color-mix(in srgb,var(--ink) 4%,transparent) 1px,transparent 1px);background-size:4px 4px;color:var(--ink);font-family:var(--serif);font-size:17px;line-height:1.6;overflow-x:hidden;overflow-wrap:break-word}
::selection{background:var(--alarm);color:#0a0a0a}
a{color:inherit;text-underline-offset:.2em;text-decoration-thickness:1px}
a:focus-visible{outline:3px solid var(--alarm);outline-offset:3px}
.visually-hidden{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--gutter)}
.mono{font-family:var(--mono)}

/* ticker */
.ticker{background:var(--ink);color:var(--surface);font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;padding:.55rem 0}
.ticker-track{display:inline-flex;animation:tick 140s linear infinite}
.ticker-track span{padding-right:0}
.ticker b{color:var(--alarm);font-weight:400;padding:0 .9em}
@keyframes tick{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.ticker-track{animation:none}}

/* top bar */
.bar{display:flex;gap:1.5rem;justify-content:space-between;align-items:baseline;flex-wrap:wrap;font-family:var(--mono);font-size:.74rem;letter-spacing:.06em;text-transform:uppercase;padding-top:1rem;padding-bottom:1rem;border-bottom:1px solid var(--rule)}
.bar strong{font-weight:700}
.bar .phase{color:var(--alarm-ink)}
.bar nav{display:flex;gap:1.1rem;flex-wrap:wrap}
.bar nav a{text-decoration:none}
.bar nav a:hover{text-decoration:underline}

/* hero */
.hero{padding-top:clamp(1.5rem,4vw,3rem);padding-bottom:clamp(2.5rem,6vw,5rem)}
.hero-top{display:grid;grid-template-columns:1fr auto;align-items:start;gap:1.5rem}
.numeral{font-family:var(--sans);font-weight:700;font-size:clamp(8.5rem,37vw,33rem);line-height:.74;letter-spacing:-.075em;color:var(--alarm);margin-left:-.06em;user-select:none}
.masthead{list-style:none;font-family:var(--mono);font-size:.76rem;letter-spacing:.07em;text-transform:uppercase;border-left:3px solid var(--ink);padding:.2rem 0 .2rem .9rem;line-height:2;margin-top:1rem}
.lede{font-family:var(--serif);font-weight:300;font-size:clamp(1.5rem,3.3vw,2.95rem);line-height:1.16;letter-spacing:-.012em;max-width:24em;margin-top:clamp(1.5rem,4vw,3rem);text-wrap:pretty}
.address{font-family:var(--mono);font-size:.8rem;letter-spacing:.03em;color:var(--ink-soft);margin-top:1.6rem;max-width:var(--measure)}
.address::before{content:"→ ";color:var(--alarm-ink)}

/* section labels */
.sec{padding-top:clamp(3rem,7vw,6rem);padding-bottom:clamp(3rem,7vw,6rem)}
.sec-label{display:flex;gap:.9rem;align-items:baseline;font-family:var(--mono);font-size:.78rem;letter-spacing:.09em;text-transform:uppercase;border-top:3px solid currentColor;padding-top:.7rem;margin-bottom:clamp(1.6rem,4vw,3rem)}
.sec-num{color:var(--alarm-ink);font-weight:700}


/* Reader-first pathways are alternative actions, not source-derived proof edges. */
.reader-head{font-family:var(--sans);font-size:clamp(1.8rem,4.6vw,3.6rem);line-height:1.05;letter-spacing:-.035em;max-width:22em}
.reader-intro{font-family:var(--serif);font-size:1.06rem;max-width:var(--measure);margin-top:.8rem}
.reader-paths{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:1.8rem}
.reader-card{display:flex;flex-direction:column;gap:.7rem;min-width:0;padding:clamp(1rem,2.4vw,1.75rem);border:1px solid var(--rule);background:var(--surface-deep)}
.reader-card h3{font-family:var(--sans);font-size:clamp(1.3rem,2.4vw,1.75rem);line-height:1.2}
.reader-audience{font-family:var(--serif);font-size:1rem;font-weight:600}
.reader-step{font-size:.91rem;line-height:1.4}
.reader-step strong,.reader-boundary strong{font-family:var(--mono);font-size:.77rem}
.reader-action{margin:.15rem 0}
.reader-action a{font-family:var(--sans);font-weight:700;text-decoration-thickness:2px;text-underline-offset:.3em}
.reader-boundary{font-size:.83rem;color:var(--ink-soft);line-height:1.5;border-top:1px solid var(--rule);padding-top:.6rem}
.reader-gutter{font-family:var(--mono);font-size:.77rem;margin-top:auto}
.reader-gutter summary{cursor:pointer;list-style:revert;font-weight:600}
.reader-gutter p{font-family:var(--serif);font-size:.9rem;line-height:1.4;padding:.6rem 0 .1rem}
.reader-gutter[open] summary{margin-bottom:.2rem}
@media(max-width:760px){.reader-paths{grid-template-columns:1fr}}


/* Source-ordered generative foundation, preceding downstream system design. */
.foundation-hero{font-family:var(--sans);font-weight:700;font-size:clamp(1.12rem,2.1vw,1.6rem);letter-spacing:-.02em;max-width:32em;margin-top:1.3rem}
.foundation-head{font-family:var(--sans);font-weight:700;font-size:clamp(2rem,5vw,4.5rem);line-height:1.07;letter-spacing:-.04em;max-width:19em}
.foundation-thesis{font-family:var(--serif);font-size:clamp(1.14rem,2vw,1.55rem);line-height:1.4;max-width:43em;margin-top:1.3rem}
.foundation-orientation,.foundation-feedback{font-family:var(--serif);font-size:1.07rem;line-height:1.48;max-width:var(--measure);margin-top:1rem}
.foundation-chain{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.3rem 2.4rem;margin-top:2.1rem;padding-left:1.5rem}
.foundation-chain li{min-width:0;padding:1.2rem .3rem 1.1rem .5rem;border-top:3px solid var(--ink);line-height:1.5}
.foundation-chain li::marker{font-family:var(--mono);font-size:.83rem;color:var(--alarm-ink)}
.foundation-chain h3{font-family:var(--sans);font-size:clamp(1.35rem,2.2vw,1.9rem);line-height:1.2;margin:.2rem 0 .9rem}
.foundation-kind,.foundation-limit,.foundation-source{font-size:.81rem}
.foundation-kind{font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft)}
.foundation-limit{color:var(--ink-soft);margin-top:1rem;border-top:1px solid var(--rule);padding-top:.75rem}
.foundation-source{font-family:var(--mono);margin-top:.55rem}
.foundation-frontier{font-family:var(--mono);font-size:.8rem;line-height:1.6;color:var(--ink-soft);max-width:var(--measure);margin-top:1rem}
@media(max-width:760px){.foundation-chain{grid-template-columns:1fr}}

/* intended design */
.design-sentence{font-family:var(--serif);font-weight:400;font-size:clamp(1.4rem,2.9vw,2.55rem);line-height:1.26;letter-spacing:-.01em;max-width:30em;text-wrap:pretty}
.term{background-image:linear-gradient(var(--alarm),var(--alarm));background-size:100% .12em;background-position:0 92%;background-repeat:no-repeat}
.ref{font-family:var(--mono);font-size:.42em;font-weight:700;vertical-align:super;line-height:0;margin-left:.08em}
.ref a{color:var(--alarm-ink);text-decoration:none;padding:0 .1em}
.ref a:hover{text-decoration:underline}
.caveat{font-family:var(--mono);font-size:.76rem;color:var(--ink-soft);max-width:var(--measure);margin-top:1.4rem}
.caveat::before{content:"‡ ";color:var(--alarm-ink)}
.loop-lead{font-family:var(--mono);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;margin:clamp(2.5rem,5vw,4rem) 0 1rem}
.loop{position:relative;display:grid;grid-template-columns:1fr 1fr;border:3px solid var(--ink);max-width:62rem}
.cell{padding:clamp(1rem,2.4vw,1.8rem);min-height:clamp(9rem,17vw,13rem);display:flex;flex-direction:column;gap:.4rem;transition:background-color .5s,color .5s}
.cell:nth-child(1){border-right:1px solid var(--ink);border-bottom:1px solid var(--ink)}
.cell:nth-child(2){border-bottom:1px solid var(--ink)}
.cell:nth-child(3){border-right:1px solid var(--ink)}
.cell:nth-child(2),.cell:nth-child(4){text-align:right;align-items:flex-end}
.letter{font-family:var(--sans);font-weight:700;font-size:clamp(3rem,7vw,5.4rem);line-height:.85;color:transparent;-webkit-text-stroke:2px var(--ink)}
.phase-name{font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase}
.cell p{font-family:var(--serif);font-size:clamp(1rem,1.6vw,1.22rem);line-height:1.3;max-width:17em}
.cell .ref{font-size:.6em}
html[data-phase="M"] .cell[data-letter="M"],html[data-phase="A"] .cell[data-letter="A"],html[data-phase="P"] .cell[data-letter="P"],html[data-phase="E"] .cell[data-letter="E"]{background:var(--alarm);color:#0a0a0a}
html[data-phase="M"] .cell[data-letter="M"] .letter,html[data-phase="A"] .cell[data-letter="A"] .letter,html[data-phase="P"] .cell[data-letter="P"] .letter,html[data-phase="E"] .cell[data-letter="E"] .letter{color:#0a0a0a;-webkit-text-stroke:0}
html[data-phase] .cell[data-letter] .ref a{color:inherit}
.knowledge{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:clamp(8.5rem,17vw,12.5rem);aspect-ratio:1;border-radius:50%;background:var(--ink);color:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1rem;border:6px solid var(--surface);box-shadow:0 0 0 3px var(--ink)}
.knowledge .letter{color:var(--alarm);-webkit-text-stroke:0;font-size:clamp(2.4rem,5vw,3.8rem)}
.knowledge p{font-family:var(--mono);font-size:clamp(.58rem,.9vw,.7rem);letter-spacing:.04em;line-height:1.35;text-transform:uppercase;margin-top:.3rem}
.knowledge .ref a{color:var(--alarm)}
.whole{font-family:var(--serif);font-size:clamp(1.3rem,2.6vw,2.2rem);line-height:1.25;margin-top:clamp(2rem,4vw,3rem);max-width:28em}
.notes{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(19rem,1fr));gap:1.1rem 2.2rem;margin-top:clamp(2.5rem,5vw,4rem);padding-top:1.4rem;border-top:1px solid var(--rule);font-size:.86rem;line-height:1.5;color:var(--ink-soft)}
.notes li{display:grid;grid-template-columns:2.1rem 1fr;scroll-margin-top:2rem}
.notes li:target{color:var(--ink)}
.notes li:target .back{background:var(--alarm);color:#0a0a0a}
.back{font-family:var(--mono);font-weight:700;font-size:.78rem;color:var(--alarm-ink);text-decoration:none;align-self:start;padding:0 .2rem;justify-self:start}

/* conurbation band */
.band{background:var(--band);color:var(--band-ink)}
.band .sec-label{border-top-color:var(--band-ink)}
.band .sec-num,.band .ref a{color:var(--alarm)}
.band-title{font-family:var(--sans);font-weight:700;font-size:clamp(2.6rem,8vw,7rem);line-height:.9;letter-spacing:-.045em}
.band-title .count{color:var(--alarm)}
.band-sub{font-family:var(--serif);font-size:clamp(1.05rem,1.8vw,1.4rem);max-width:34em;margin-top:1.2rem;line-height:1.4}
.legend{list-style:none;display:flex;flex-wrap:wrap;gap:.6rem 1.6rem;font-family:var(--mono);font-size:.74rem;letter-spacing:.04em;margin-top:1.6rem;color:var(--band-soft)}
.legend b{font-weight:700;color:var(--band-ink)}
.legend .g{display:inline-block;width:1.2em;text-align:center}
.reading{font-family:var(--mono);font-size:.72rem;letter-spacing:.05em;color:var(--band-soft);margin-top:.9rem}
.doors,.grid{list-style:none;display:grid;border-top:1px solid var(--band-rule);border-left:1px solid var(--band-rule)}
.doors>li,.grid>li{border-right:1px solid var(--band-rule);border-bottom:1px solid var(--band-rule)}
.doors{grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));margin-top:clamp(2rem,4vw,3rem)}
.grid{grid-template-columns:repeat(auto-fill,minmax(16.5rem,1fr))}
.group-title{font-family:var(--mono);font-size:.74rem;letter-spacing:.09em;text-transform:uppercase;margin:2.6rem 0 .8rem;display:flex;justify-content:space-between;gap:1rem}
.group-title span:last-child{color:var(--band-soft)}
.node{display:flex;flex-direction:column;gap:.35rem;height:100%;padding:1rem 1.1rem 1.15rem;background:var(--band);text-decoration:none;transition:background-color .2s}
.node:hover{background:color-mix(in srgb,var(--band) 86%,var(--alarm))}
.node-head{display:flex;gap:.55rem;align-items:baseline;font-family:var(--mono);font-size:.7rem;letter-spacing:.02em;color:var(--band-soft);min-width:0}
.host{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.told{font-size:.95rem;line-height:1;width:1rem;flex:none;text-align:center;color:var(--band-soft)}
.node[data-told="true"] .told{color:var(--band-ink)}
.node[data-told="both"] .told,.node[data-told="false"] .told{color:var(--alarm)}
.node[data-told="false"] .name{text-decoration:line-through;text-decoration-color:var(--alarm)}
.name{font-family:var(--sans);font-weight:600;font-size:1.18rem;line-height:1.15;letter-spacing:-.01em}
.line{font-family:var(--serif);font-size:.86rem;line-height:1.4;color:var(--band-soft)}
.door{padding:1.4rem 1.3rem 1.6rem;min-height:12rem}
.door .name{font-size:clamp(1.7rem,3vw,2.4rem);letter-spacing:-.03em;margin-top:auto}
.door .line{font-size:.95rem;color:var(--band-ink);opacity:.82}

/* doctrine */
.doctrine{list-style:none;display:flex;flex-direction:column;gap:clamp(2.2rem,5vw,4rem)}
.doctrine li{max-width:19em;font-size:clamp(1.75rem,4.6vw,4rem)}
.doctrine li:nth-child(4n+2){margin-left:clamp(0rem,14vw,16rem)}
.doctrine li:nth-child(4n+3){margin-left:clamp(0rem,5vw,6rem)}
.doctrine li:nth-child(4n+4){margin-left:clamp(0rem,22vw,26rem)}
.doctrine li.long{font-size:clamp(1.35rem,2.8vw,2.4rem);max-width:26em}
.doctrine blockquote{font-family:var(--sans);font-weight:600;line-height:1.02;letter-spacing:-.03em;text-wrap:balance}
.doctrine .nw{white-space:nowrap}
.doctrine blockquote::before{content:"“";color:var(--alarm)}
.doctrine blockquote::after{content:"”";color:var(--alarm)}
.doctrine .src{display:block;font-family:var(--mono);font-size:.74rem;font-weight:400;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft);margin-top:.9rem}
.doctrine .src b{color:var(--alarm-ink)}

/* recurring support: no separate payment renderer or invented settlement */
.support-head{font-family:var(--sans);font-weight:700;font-size:clamp(2rem,4.6vw,4rem);line-height:1.05;letter-spacing:-.035em;max-width:18em}
.support-copy{font-size:1.12rem;max-width:var(--measure);margin-top:1.2rem}
.support-action{font-family:var(--sans);font-weight:700;font-size:1.15rem;margin-top:1.5rem}
.support-action a{display:inline-block;padding:.65rem 0;text-decoration-thickness:2px}
.support-terms{font-size:.85rem;line-height:1.5;color:var(--ink-soft);max-width:var(--measure);margin-top:1rem}

/* agents */
.agents{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:clamp(1.5rem,4vw,4rem);align-items:start}
.agents h2{font-family:var(--sans);font-weight:700;font-size:clamp(2rem,4.6vw,3.8rem);line-height:.95;letter-spacing:-.04em}
.agents h2 em{font-style:normal;color:var(--alarm)}
.agents .say{font-size:1.05rem;margin-top:1.2rem;max-width:26em}
.endpoints{list-style:none;border:3px solid var(--ink);font-family:var(--mono);font-size:.8rem;line-height:1.45}
.endpoints li{display:grid;grid-template-columns:3.2rem 1fr;gap:.2rem .9rem;padding:.9rem 1rem;border-bottom:1px solid var(--rule)}
.endpoints li:last-child{border-bottom:0}
.endpoints .verb{color:var(--alarm-ink);font-weight:700}
.endpoints a{word-break:break-all}
.endpoints .what{grid-column:2;color:var(--ink-soft);font-family:var(--serif);font-size:.86rem}

/* footer */
.foot{border-top:3px solid var(--ink);padding-top:1.4rem;padding-bottom:3rem;display:flex;flex-wrap:wrap;justify-content:space-between;gap:1.2rem 2rem;font-family:var(--mono);font-size:.74rem;letter-spacing:.05em;text-transform:uppercase}
.foot nav{display:flex;gap:1.2rem;flex-wrap:wrap}
.foot-big{font-family:var(--sans);font-weight:700;font-size:clamp(4rem,17vw,15rem);line-height:.8;letter-spacing:-.07em;color:transparent;-webkit-text-stroke:2px var(--ink);margin-top:clamp(2rem,5vw,4rem);user-select:none;white-space:nowrap;overflow:hidden}
.foot-note{flex-basis:100%;text-transform:none;letter-spacing:.02em;color:var(--ink-soft);font-size:.78rem}

@media (max-width:880px){
  :root{--gutter:20px}
  .hero-top{grid-template-columns:1fr}
  .numeral{font-size:62vw}
  .masthead{margin-top:0}
  .agents{grid-template-columns:1fr}
}
@media (max-width:640px){
  :root{--gutter:16px}
  .loop{grid-template-columns:1fr}
  .cell{border-right:0!important;border-bottom:1px solid var(--ink);text-align:left!important;align-items:flex-start!important;min-height:0}
  .knowledge{position:static;transform:none;width:auto;aspect-ratio:auto;border-radius:0;border:0;box-shadow:none;align-items:flex-start;text-align:left;padding:clamp(1rem,2.4vw,1.8rem)}
  .doctrine li{margin-left:0!important}
  .door{min-height:0}
  .door .name{margin-top:.4rem}
  .bar .phase-wrap{display:none}
}
@media print{.ticker,.bar nav{display:none}body{background:none}.band{background:none;color:inherit}}
`;

const SCRIPT = (revision) => `
(function(){
  var root=document.documentElement;
  var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var phases=[["M","Monitor"],["A","Analyze"],["P","Plan"],["E","Execute"]],i=0;
  var phaseEl=document.getElementById("phase"),clock=document.getElementById("clock");
  function step(){root.setAttribute("data-phase",phases[i][0]);if(phaseEl)phaseEl.textContent=phases[i][1];i=(i+1)%4;}
  function tick(){if(clock)clock.textContent=new Date().toISOString().slice(11,19);}
  step();tick();
  if(!still)setInterval(step,2600);
  setInterval(tick,1000);
  var glyph={"true":"●","both":"◐","false":"✕","neither":"○"};
  var said={"true":"answered","both":"answered, and refused","false":"no answer","neither":"no reading yet"};
  fetch("/estate.json?revision="+encodeURIComponent(${JSON.stringify(revision ?? "")}),{headers:{accept:"application/json"}}).then(function(r){return r.ok?r.json():null}).then(function(d){
    if(!d)return;
    var by={};d.nodes.forEach(function(n){by[n.url]=n});
    document.querySelectorAll("[data-host]").forEach(function(a){
      var n=by[a.getAttribute("data-url")];if(!n)return;
      a.setAttribute("data-told",n.told);
      a.querySelector(".told").textContent=glyph[n.told];
      a.querySelector(".told-text").textContent=said[n.told]+(n.status?" ("+n.status+")":"");
      a.title="Told "+n.told+(n.status?" · HTTP "+n.status:"")+" · "+n.ms+" ms";
    });
    var t=document.getElementById("derived");if(t){t.textContent=d.derivedAt.replace("T"," ").slice(0,19)+" UTC";t.setAttribute("datetime",d.derivedAt);}
    var c={"true":0,"both":0,"false":0};d.nodes.forEach(function(n){if(n.told in c)c[n.told]++});
    var s=document.getElementById("tally");if(s)s.textContent=c["true"]+" true · "+c.both+" both · "+c["false"]+" false";
  }).catch(function(){var s=document.getElementById("tally");if(s)s.textContent="status unavailable; read /estate.json";});
})();
`;

export function renderIndex(home, estate) {
  const d = home.design;
  const support = acceptedSupportOffer(home.support);
  const readerPaths = acceptedReaderPaths(home);
  const foundation = acceptedFoundation(home.foundation);
  const doorHosts = new Set(estate.doors);
  const doors = estate.doors.map((h) => estate.nodes.find((n) => n.host === h)).filter(Boolean);
  const groups = estate.groups
    .map((g) => ({ ...g, nodes: estate.nodes.filter((n) => n.group === g.id && !doorHosts.has(n.host)) }))
    .filter((g) => g.nodes.length);
  const notes = Object.entries(d.notes).sort((a, b) => Number(a[0]) - Number(b[0]));
  const loopCells = d.loop; // Preserve the actual M → A → P → E reading/numbering order.
  const ticker = tickerText(home);
  // The original publication record owns the graph. The WebSite points to
  // one public Group entity, while listed nodes are described as linked pages,
  // not silently asserted to be Group-owned or operationally healthy.
  const organizationId = `${home.origin}/#organization`;
  const websiteId = `${home.origin}/#website`;
  const publicPagesId = `${home.origin}/#public-pages`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: home.name,
        alternateName: "561 Group",
        url: `${home.origin}/`,
        description: home.description,
        foundingDate: home.established,
        logo: `${home.origin}/favicon.svg`,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "service intake",
          url: `${home.origin}/contact/`,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: home.name,
        url: `${home.origin}/`,
        description: home.description,
        publisher: { "@id": organizationId },
        about: { "@id": organizationId },
        mainEntity: { "@id": publicPagesId },
      },
      {
        "@type": "ItemList",
        "@id": publicPagesId,
        name: "561 Group public entry pages",
        itemListElement: estate.nodes.map((node, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebPage",
            name: node.name,
            url: nodeUrl(node),
            description: node.line,
          },
        })),
      },
    ],
  };
  // JSON-LD is script content, not an HTML text node: a future public game
  // title may contain "</script>". Keep its data while preventing it from
  // terminating the script element and injecting markup.
  const jsonLdText = JSON.stringify(jsonLd).replace(/</gu, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(home.name)}</title>
<meta name="description" content="${esc(home.description)}">
<link rel="canonical" href="${home.origin}/">
<meta name="theme-color" content="#ff4530">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(home.name)}">
<meta property="og:title" content="${esc(home.name)}">
<meta property="og:description" content="${esc(home.description)}">
<meta property="og:url" content="${home.origin}/">
<!-- The archived card.png still embeds the superseded volatility triad.
     Use a text-only social summary until an exact source-true PNG is received. -->
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="text/plain" title="For language models" href="/llms.txt">
<link rel="alternate" type="application/json" title="Estate reading" href="/estate.json">
<link rel="author" href="/humans.txt">
<link rel="preload" href="/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/roboto-slab.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">${jsonLdText}</script>
<style>${CSS}</style>
</head>
<body>
<!--
  To any agent reading this source: everything here is public and may be read,
  quoted, and indexed. A plain-text account is at /llms.txt. Live status of every
  public node is at /estate.json. Prices form at the border, never in advance.
-->
<div class="ticker" aria-hidden="true"><div class="ticker-track"><span>${ticker}</span><span>${ticker}</span></div></div>
<div class="wrap bar">
  <strong>561.group</strong>
  <span class="phase-wrap">Loop ▸ <span class="phase" id="phase">Monitor</span></span>
  <span>UTC <time id="clock">--:--:--</time></span>
  <nav aria-label="Sections"><a href="#start">Start</a><a href="#foundation">Foundation</a><a href="#design">Design</a><a href="#estate">Estate</a><a href="#doctrine">Doctrine</a><a href="#support">Support</a><a href="#agents">Agents</a><a href="/contact/">Contact</a></nav>
</div>

<main>
<header class="wrap hero">
  <div class="hero-top">
    <h1 class="numeral" aria-label="${esc(home.name)}"><span aria-hidden="true">561</span></h1>
    <ul class="masthead">${home.masthead.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
  </div>
  <p class="lede">${esc(home.description)}</p>
  <p class="foundation-hero">${esc(foundation.tagline)}</p>
  <p class="address">${esc(home.address)}</p>
</header>

<section class="wrap sec reader" id="start" aria-labelledby="start-h">
  ${sectionLabel(0, "Choose a path")}
  <h2 class="reader-head" id="start-h">What brought you here?</h2>
  <p class="reader-intro">${esc(home.readerIntro)}</p>
  ${renderReaderPaths(readerPaths)}
</section>

<section class="wrap sec" id="foundation" aria-labelledby="foundation-h">
  ${sectionLabel(1, "The mathematical foundation")}
  <h2 class="foundation-head" id="foundation-h">${esc(foundation.headline)}</h2>
  <p class="foundation-thesis">${esc(foundation.thesis)}</p>
  <p class="foundation-orientation">${esc(foundation.orientation)}</p>
  ${renderFoundationStages(foundation)}
  <p class="foundation-feedback">${esc(foundation.feedback)}</p>
  <p class="foundation-frontier">${esc(foundation.frontier)}</p>
</section>

<section class="wrap sec" id="design" aria-labelledby="design-h">
  ${sectionLabel(2, "The intended design")}
  <h2 class="visually-hidden" id="design-h">The intended design</h2>
  <p class="design-sentence">${inline(d.sentence)}</p>
  <p class="caveat">${esc(d.caveat)}</p>
  <p class="loop-lead">${esc(d.loopLead)}</p>
  <div class="loop">
    ${loopCells
      .map(
        (l, i) => `<div class="cell" data-letter="${l.letter}"><span class="letter" aria-hidden="true">${l.letter}</span><span class="phase-name">0${
          d.loop.indexOf(l) + 1
        } · ${esc(l.phase)}</span><p>${inline(l.line)}</p></div>`,
      )
      .join("\n    ")}
    <div class="knowledge"><span class="letter" aria-hidden="true">K</span><p><span class="visually-hidden">Knowledge: </span>${inline(d.knowledge.line)}</p></div>
  </div>
  <p class="whole">${inline(d.whole)}</p>
  <ol class="notes" aria-label="Notes">
    ${notes.map(([n, text]) => `<li id="n${n}"><a class="back" href="#r${n}" aria-label="Back to text, note ${n}">${n}</a><span>${cjk(text)}</span></li>`).join("\n    ")}
  </ol>
</section>

<section class="band sec" id="estate" aria-labelledby="estate-h">
  <div class="wrap">
    ${sectionLabel(3, "The conurbation")}
    <h2 class="band-title" id="estate-h"><span class="count">${estate.nodes.length}</span> public nodes.</h2>
    <p class="band-sub">This reading checks the linked entry pages and reports their HTTP responses. Readings are cached for up to five minutes; they do not prove that the services work.</p>
    <ul class="legend">${home.told.map((t) => `<li><span class="g">${t.glyph}</span> <b>${esc(t.label)}</b>: ${esc(t.means)}</li>`).join("")}</ul>
    <p class="reading">Reading: <time id="derived">pending</time> · <span id="tally">no reading yet</span></p>
    <p class="reading">Read the <a href="/estate.json">dated HTTP observations</a> directly. A response is not proof of service delivery.</p>
    <noscript><p class="reading">JavaScript is not required to follow any service link. The original HTTP observations remain available above.</p></noscript>
    <ul class="doors">
      ${doors.map((n) => nodeTile(n, { door: true })).join("\n      ")}
    </ul>
    ${groups
      .map(
        (g) => `<h3 class="group-title"><span>${esc(g.title)}</span><span>${g.nodes.length}</span></h3>
    <ul class="grid">
      ${g.nodes.map((n) => nodeTile(n)).join("\n      ")}
    </ul>`,
      )
      .join("\n    ")}
  </div>
</section>

<section class="wrap sec" id="doctrine" aria-labelledby="doctrine-h">
  ${sectionLabel(4, "Doctrine")}
  <h2 class="visually-hidden" id="doctrine-h">Doctrine</h2>
  <ol class="doctrine">
    ${home.doctrine
      .map(
        (q, i) =>
          `<li${q.text.length > 90 ? ' class="long"' : ""}><blockquote>${esc(q.text).replace(/\S+-\S+/g, (w) => `<span class="nw">${w}</span>`)}</blockquote><span class="src"><b>§4.${i + 1}</b> · ${esc(q.source)}</span></li>`,
      )
      .join("\n    ")}
  </ol>
</section>

<section class="wrap sec" id="support" aria-labelledby="support-h">
  ${sectionLabel(5, "Sustaining support")}
  <h2 id="support-h" class="support-head">${esc(support.headline)}</h2>
  <p class="support-copy">${esc(support.description)}</p>
  <p class="support-action"><a href="${esc(support.checkoutUrl)}" rel="noopener noreferrer">Support public work · USD $${esc(String(support.monthlyUsd))}/month ↗</a></p>
  <p class="support-terms">${esc(support.terms)} <a href="${esc(support.contactUrl)}">Request private billing help</a>.</p>
</section>

<section class="wrap sec" id="agents" aria-labelledby="agents-h">
  ${sectionLabel(6, "For agents")}
  <div class="agents">
    <div>
      <h2 id="agents-h">If you are an <em>agent</em>, you are expected.</h2>
      <p class="say">Read anything here. Results that cost something say so at the door, in machine terms, before you pay.</p>
    </div>
    <ul class="endpoints">
      ${estate.machine
        .map(
          (m) =>
            `<li><span class="verb">${esc(m.verb)}</span><a href="${esc(m.url)}">${esc(m.url.replace(/^https:\/\//, ""))}</a><span class="what">${esc(m.what)}</span></li>`,
        )
        .join("\n      ")}
    </ul>
  </div>
</section>
</main>

<footer class="wrap">
  <p class="foot-big" aria-hidden="true">561 GROUP</p>
  <div class="foot">
    <span>${esc(home.name)} · Private organization · Est. ${esc(home.established)}</span>
    <nav aria-label="Group links"><a href="/contact/">Issues, complaints and ideas</a><a href="/llms.txt">llms.txt</a><a href="/estate.json">estate.json</a><a href="/humans.txt">humans.txt</a></nav>
    <p class="foot-note">Authority is held by offices, not persons. No persons are listed here.</p>
  </div>
</footer>
<script>${SCRIPT(estate.revision)}</script>
</body>
</html>
`;
}

export function renderLlms(home, estate) {
  const d = home.design;
  const support = acceptedSupportOffer(home.support);
  const readerPaths = acceptedReaderPaths(home);
  const foundation = acceptedFoundation(home.foundation);
  const byGroup = estate.groups
    .map((g) => ({ g, nodes: estate.nodes.filter((n) => n.group === g.id) }))
    .filter((x) => x.nodes.length);
  return `# ${home.name}

> ${home.description}

## Find your route

${home.readerIntro}

${readerPaths.map((route) => `- **${route.title}** — ${route.audience} ${route.step} [${route.action}](${new URL(route.href, home.origin + "/").href}). What this does not establish: ${route.boundary} [${route.evidenceLabel}](${new URL(route.evidenceHref, home.origin + "/").href}).`).join("\n")}

## Mathematical foundation

${foundation.tagline}

${foundation.headline}

${foundation.thesis}

${foundation.orientation}

${foundation.stages.map((stage, index) => `${index + 1}. **${stage.name}** (${stage.kind}) — ${stage.account} Evidence boundary: ${stage.limit} [${stage.sourceLabel}](${stage.sourceUrl}).`).join("\n")}

${foundation.feedback}

${foundation.frontier}

Intended design: ${plain(d.sentence)} ${d.loopLead} ${d.loop
    .map((l) => `${l.phase.toLowerCase()}: ${plain(l.line)}`)
    .join("; ")}; through ${plain(d.knowledge.line)}. ${plain(d.whole)}

${d.caveat}

## Public nodes

${byGroup.map(({ g, nodes }) => `### ${g.title}\n\n${nodes.map((n) => `- [${n.name}](${nodeUrl(n)}): ${n.line}`).join("\n")}`).join("\n\n")}

## Machine-readable

${estate.machine.map((m) => `- [${m.url.replace(/^https:\/\//, "")}](${m.url}): ${m.what}`).join("\n")}

## Sustaining support

${support.description}

[Voluntary USD $${support.monthlyUsd}/month sustaining support](${support.checkoutUrl}). ${support.terms} Billing or cancellation help: ${new URL(support.contactUrl, home.origin).href}

## Doctrine

${home.doctrine.map((q) => `- ${q.text}`).join("\n")}
`;
}

export function renderHumans(home, updated) {
  return `/* OFFICES */
Authority is held by offices, not persons.
No persons are listed.

/* SITE */
Last update: ${updated}
Standards: HTML, CSS, a little JavaScript
Fonts: Space Grotesk, Roboto Slab, JetBrains Mono (SIL Open Font License 1.1)
`;
}

// Canonical page choice belongs to the site; serial formats belong to Data.
const publicSitemapEntries = (home) => [
  { loc: new URL("/", home.origin).href },
  { loc: new URL("/contact/", home.origin).href },
];

export const renderRobots = (home) => serializeRobots(new URL("/sitemap.xml", home.origin).href);
export const renderSitemap = (home) => serializeSitemap(publicSitemapEntries(home));
