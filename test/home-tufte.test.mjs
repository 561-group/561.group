import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  PUBLIC_ROUTES,project561GroupHome,project561GroupPage,project561GroupHead
} from "../src/home-tufte.mjs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const home=read("data/home.json"),estate=read("data/estate.json"),
  frontdoor=read("data/frontdoor.json");
const model=path=>project561GroupPage({home,estate,frontdoor,path});
const tile=(page,id)=>page.tiles.find(t=>t.id===id);

test("a visitor can tell what the Group is, what they can hire, and where to go immediately",()=>{
  const root=project561GroupHome({home,estate,frontdoor});
  assert.equal(root.title,home.name);
  assert.equal(root.metadata.description,home.description);
  assert.equal(root.metadata.canonical,"https://561.group/");
  assert.equal(root.metadata.structuredData["@graph"][0].subOrganization.length,4);
  assert.deepEqual(root.navigation.map(x=>x.href),
    ["/","/work/","/projects/","/about/","/for-agents/","/contact/"]);
  assert.deepEqual(root.tiles.map(x=>x.id),
    ["introduction","work-folio","frontiers","paths","services","method","physical-world","explore","trade","companies","agents","support"]);
  const hero=tile(root,"introduction").html;
  assert.ok(hero.includes(frontdoor.proposition));
  assert.ok(hero.includes(frontdoor.promise));
  assert.ok(hero.includes(home.public.intro));
  assert.ok(hero.includes('href="/work/"'));
  assert.ok(hero.includes('href="/projects/"'));
  assert.doesNotMatch(hero,/conurbanized|Huidu Guanli|type-theoretic/u);
  const folio=tile(root,"work-folio").html;
  assert.equal(tile(root,"work-folio").title,frontdoor.workFolio.title);
  assert.ok(folio.includes(frontdoor.workFolio.introduction));
  assert.ok(folio.includes(frontdoor.workFolio.boundary));
  assert.equal((folio.match(/class="site-folio-movement"/gu)||[]).length,4);
  for(const house of home.group.companies){
    assert.ok(folio.includes('data-house="'+house.id+'"'));
    assert.ok(folio.includes('href="'+house.url+'"'));
    assert.ok(folio.includes(house.name));
  }
  for(const beat of frontdoor.workFolio.movements) {
    assert.ok(folio.includes(beat.title));
    assert.ok(folio.includes(beat.line));
  }
  assert.ok(folio.includes('aria-hidden="true"'),"art must remain decorative");
  assert.ok(root.tiles.findIndex(t=>t.id==="work-folio")<root.tiles.findIndex(t=>t.id==="frontiers"),
    "real responsibilities must appear before abstract future frontiers");
  const horizon=tile(root,"frontiers").html;
  assert.ok(horizon.includes("Union of Harmonious Colonies"));
  assert.ok(horizon.includes("settler-colonial"));
  assert.ok(horizon.includes("silica"));
  assert.ok(horizon.includes("carbon"));
  assert.ok(horizon.includes('href="/about/"'));
  assert.ok(horizon.includes('href="/work/"'));
  assert.ok(!horizon.includes("has already replaced") && !horizon.includes("we created living silica"));
  const wayfinding=tile(root,"paths").html;
  for(const path of frontdoor.paths) {
    assert.ok(wayfinding.includes(path.title));
    assert.ok(wayfinding.includes('href="'+path.href+'"'));
  }
  // The first research-reading path must reach the independently published
  // original Science resource, rather than silently treating news as research.
  assert.equal(frontdoor.paths.find(p=>p.id==="read").href,"https://science.561.group/");
  assert.ok(wayfinding.includes('href="https://science.561.group/"'));
  assert.ok(tile(root,"explore").html.includes('href="https://koios.news/"'),
    "independent newsroom discovery remains a separate, live homepage affordance");
  assert.equal(tile(root,"physical-world").title,home.public.materialApproach.headline);
  assert.ok(tile(root,"physical-world").html.includes(home.public.materialApproach.body));
  assert.ok(tile(root,"physical-world").html.includes(home.public.materialApproach.scope));
  assert.match(tile(root,"physical-world").html,/water-cycle-informed governance/u);
  assert.match(tile(root,"physical-world").html,/Indigenous and treaty rights/u);
  assert.ok(root.tiles.findIndex(t=>t.id==="services")<root.tiles.findIndex(t=>t.id==="support"),
    "public sales and use are not hidden behind a donation pitch");
});

test("services are tied to an existing accountable company, and only inquiry is offered",()=>{
  const root=model("/");
  const services=tile(root,"services").html;
  assert.ok(services.includes("Persistent AI systems"));
  assert.ok(services.includes("Indigenous data governance"));
  const work=model("/work/");
  const list=tile(work,"services").html;
  for(const item of frontdoor.offers) {
    assert.ok(list.includes('id="'+item.id+'"'));
    const expected=item.scope.replace(/&/gu,"&amp;").replace(/'/gu,"&#39;");
    assert.ok(list.includes(expected));
    assert.ok(list.includes(home.group.companies.find(c=>c.id===item.provider).name));
  }
  assert.ok(list.includes('href="/contact/#work"'));
  assert.ok(tile(work,"process").html.includes("An inquiry is not an order"));
  assert.doesNotMatch(list,/Buy now|guaranteed revenue|instant acceptance/u);
});

test("real named projects and distinct buying venues are prominent, not inferred offers",()=>{
  const root=model("/");
  const featured=tile(root,"explore").html;
  for(const entry of home.public.featured) {
    const node=estate.nodes.find(x=>x.host===entry.host);
    assert.ok(featured.includes(entry.action));
    assert.ok(featured.includes("https://"+node.host+"/"));
  }
  for(const venue of home.group.storefronts) {
    assert.ok(tile(root,"trade").html.includes(venue.name));
    assert.ok(tile(root,"trade").html.includes(venue.url));
  }
  const projects=model("/projects/");
  const listing=tile(projects,"directory").html;
  for(const node of estate.nodes) {
    assert.ok(listing.includes(node.name));
    assert.ok(listing.includes("https://"+node.host+"/"));
  }
  assert.ok(listing.includes('href="/estate.json"'));
  assert.match(projects.metadata.canonical,/\/projects\/$/u);
});

test("about and agent pages give real source identities and safe action boundaries",()=>{
  const about=model("/about/");
  assert.equal(tile(about,"companies").html.match(/<strong>/gu)?.length,4);
  const vision=tile(about,"frontiers").html;
  for(const frontier of frontdoor.vision.frontiers){
    assert.ok(vision.includes(frontier.title));
    assert.ok(vision.includes(frontier.thesis));
    assert.ok(vision.includes(frontier.present));
    assert.ok(vision.includes(frontier.boundary));
  }
  assert.ok(vision.includes("No software confers Indigenous sovereignty"));
  assert.ok(vision.includes("We have not created silicon-based life"));
  assert.ok(vision.includes("science.561.group"));
  assert.ok(tile(about,"principles").html.includes(home.public.materialApproach.scope.replace(/&/gu,"&amp;")));
  assert.ok(tile(about,"source").html.includes(home.group.githubOrg));
  const agent=model("/for-agents/");
  const protocols=tile(agent,"endpoints").html;
  for(const entry of estate.machine) {
    assert.ok(protocols.includes(entry.url));
    const safeText=entry.what.replace(/[&<>"']/gu,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    assert.ok(protocols.includes(safeText),
      "the public machine description is preserved through safe HTML escaping: "+entry.url);
  }
  assert.ok(protocols.includes('class="site-method">POST</span><code>'),
    "the website lists but never automatically invokes POST endpoints");
  assert.ok(tile(agent,"boundaries").html.includes("authorization"));
});

test("a single original TUFTE application has only exact known public routes",()=>{
  assert.deepEqual(PUBLIC_ROUTES,["/","/work/","/projects/","/about/","/for-agents/"]);
  for(const route of PUBLIC_ROUTES) {
    const page=model(route);
    assert.equal(page.metadata.canonical,"https://561.group"+route);
    assert.equal(page.metadata.language,"en");
    assert.equal(page.revision,"unversioned");
    assert.ok(page.tiles.length>=3);
  }
  for(const path of ["/contact/","/actors/group","/work/fake/","/internal/"])
    assert.throws(()=>model(path),/Unadmitted/);
});

test("public editorial records are data, escaped and checked at the original boundary",()=>{
  const copy=structuredClone(frontdoor);
  copy.promise='<img src=x onerror=alert(1)>';
  copy.paths[0].title='<em>not HTML</em>';
  const safe=project561GroupPage({home,estate,frontdoor:copy});
  assert.ok(tile(safe,"introduction").html.includes("&lt;img"));
  assert.ok(!tile(safe,"introduction").html.includes("<img"));
  assert.ok(tile(safe,"paths").html.includes("&lt;em&gt;"));
  const missing=structuredClone(estate);
  missing.nodes=missing.nodes.filter(n=>n.host!==home.public.featured[0].host);
  assert.throws(()=>project561GroupPage({home,estate:missing,frontdoor}),
    /not a published estate entry/);
  const malicious=structuredClone(frontdoor);
  malicious.paths[0].href="javascript:alert(1)";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:malicious}),/Only public HTTPS/);
  const duplicate=structuredClone(frontdoor);
  duplicate.offers.push({...duplicate.offers[0]});
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:duplicate}),/Duplicate/);
  const incompletePosition=structuredClone(home);
  delete incompletePosition.public.materialApproach.scope;
  assert.throws(()=>project561GroupPage({home:incompletePosition,estate,frontdoor}),/material-world position/u);
  const strippedFolio=structuredClone(frontdoor);
  strippedFolio.workFolio.movements.pop();
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:strippedFolio}),
    /four real, ordered Group companies/u);
  const displaced=structuredClone(frontdoor);
  displaced.workFolio.movements[1].company="science";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:displaced}),
    /four real, ordered Group companies/u);
  const marked=structuredClone(frontdoor);
  marked.workFolio.movements[0].title="<script>alert(1)</script>";
  const safeFolio=tile(project561GroupPage({home,estate,frontdoor:marked}),"work-folio").html;
  assert.ok(safeFolio.includes("&lt;script&gt;"));
  assert.doesNotMatch(safeFolio,/<script>/u);
  const missingVision=structuredClone(frontdoor);
  missingVision.vision.frontiers.pop();
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:missingVision}),
    /Two complete, distinct/u);
  const injectedVision=structuredClone(frontdoor);
  injectedVision.vision.frontiers[0].thesis='<script>alert(1)</script>';
  const rendered=tile(project561GroupPage({home,estate,frontdoor:injectedVision}),"frontiers").html;
  assert.ok(rendered.includes("&lt;script&gt;"));
  assert.ok(!rendered.includes("<script>"));
  const improper=structuredClone(frontdoor);
  improper.offers[0].provider="nonexistent";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:improper}),/no original accountable company/);
  const poisoned=structuredClone(home);
  poisoned.group.sustainingSupport.url="data:text/html,x";
  assert.throws(()=>project561GroupPage({home:poisoned,estate,frontdoor}),/Only public HTTPS/);
});

test("the genuine TUFTE document keeps discoverability, responsive design, keyboard focus and reduced motion",()=>{
  const head=project561GroupHead(home);
  assert.match(head,/name="fediverse:creator" content="@group@561\.group"/u);
  assert.match(head,/rel="me" href="https:\/\/561\.group\/actors\/group"/u);
  assert.match(head,/name="fediverse:creator"/u);
  for(const path of ["/llms.txt","/feed.json","/feed.atom.xml","/feed.rss.xml","/estate.json"])
    assert.ok(head.includes('href="'+path+'"'));
  for(const lang of ["en","zh-Hans","lkt","x-default"])
    assert.ok(head.includes('hreflang="'+lang+'"'));
  assert.ok(head.includes(":focus-visible"));
  assert.ok(head.includes("max-width:430px"));
  assert.ok(head.includes("prefers-reduced-motion:reduce"));
  assert.ok(head.includes("site-display"));
  assert.ok(head.includes('data-561-house="visual-design-bible-v0.4-candidate"'));
  for(const value of ["#F2EAD8","#0A0A0A","#FF4530","#3D5588","Space Grotesk","Roboto Slab","JetBrains Mono"])
    assert.ok(head.includes(value),"original 561 house visual token must survive: "+value);
  assert.ok(head.includes(".tufte-masthead::before"),"preserve the original giant 561 numeral");
  assert.ok(head.includes("#frontiers"),"integrate civilizational vision into the source-owned house design");
  assert.ok(!home.description.startsWith("The Lakota-founded"),"lead with the work, not a founding-identity appeal");
  const modified=structuredClone(home);
  modified.group.handle='<script>alert(1)</script>';
  assert.doesNotMatch(project561GroupHead(modified),/<script>/u);
  assert.throws(()=>project561GroupHead({...home,origin:"https://other.example"}),TypeError);
});
