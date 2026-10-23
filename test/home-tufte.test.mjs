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
    ["introduction","paths","services","method","physical-world","explore","trade","companies","agents","support"]);
  const hero=tile(root,"introduction").html;
  assert.ok(hero.includes(frontdoor.proposition));
  assert.ok(hero.includes(frontdoor.promise));
  assert.ok(hero.includes(home.public.intro));
  assert.ok(hero.includes('href="/work/"'));
  assert.ok(hero.includes('href="/projects/"'));
  assert.doesNotMatch(hero,/conurbanized|Huidu Guanli|type-theoretic/u);
  const wayfinding=tile(root,"paths").html;
  for(const path of frontdoor.paths) {
    assert.ok(wayfinding.includes(path.title));
    assert.ok(wayfinding.includes('href="'+path.href+'"'));
  }
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
  assert.ok(tile(about,"principles").html.includes(home.public.materialApproach.scope.replace(/&/gu,"&amp;")));
  assert.ok(tile(about,"source").html.includes(home.group.githubOrg));
  const agent=model("/for-agents/");
  const protocols=tile(agent,"endpoints").html;
  for(const entry of estate.machine) {
    assert.ok(protocols.includes(entry.url));
    assert.ok(protocols.includes(entry.what));
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
  const modified=structuredClone(home);
  modified.group.handle='<script>alert(1)</script>';
  assert.doesNotMatch(project561GroupHead(modified),/<script>/u);
  assert.throws(()=>project561GroupHead({...home,origin:"https://other.example"}),TypeError);
});
