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

test("the homepage is an economical, useful institutional entrance—not a culture or research billboard",()=>{
  const root=project561GroupHome({home,estate,frontdoor});
  assert.equal(root.title,home.name);
  assert.equal(root.metadata.description,home.description);
  assert.equal(root.metadata.canonical,"https://561.group/");
  assert.equal(root.metadata.structuredData["@graph"][0].subOrganization.length,4);
  assert.deepEqual(root.navigation.map(x=>x.href),
    ["/","/work/","/projects/","/about/","/for-agents/","/contact/"]);
  assert.deepEqual(root.tiles.map(x=>x.id),
    ["introduction","paths","companies","explore","contact"],
    "Culture, governance theory, speculative biology, merchant terms and machines have their own pages");
  const hero=tile(root,"introduction").html;
  assert.ok(hero.includes(frontdoor.proposition));
  assert.ok(hero.includes(frontdoor.promise));
  assert.ok(hero.includes(home.public.intro));
  assert.ok(hero.includes('href="/work/"'));
  assert.ok(hero.includes('href="/contact/#work"'));
  const wayfinding=tile(root,"paths").html;
  for(const route of frontdoor.paths){
    assert.ok(wayfinding.includes(route.title));
    assert.ok(wayfinding.includes('href="'+route.href+'"'));
  }
  for(const company of home.group.companies)
    assert.ok(tile(root,"companies").html.includes(company.name));
  for(const feature of home.public.featured){
    const node=estate.nodes.find(x=>x.host===feature.host);
    assert.ok(tile(root,"explore").html.includes(node.name));
    assert.ok(tile(root,"explore").html.includes(feature.action));
  }
  assert.ok(tile(root,"contact").html.includes('href="/contact/#work"'));
  assert.ok(tile(root,"contact").html.includes('href="/about/"'));
  const humanVisible=root.tiles.map(x=>x.title+" "+x.html).join(" ");
  assert.doesNotMatch(humanVisible,/Indigenous-grounded|Indigenous data governance|settler-colonial|silica-rich|Artificial Abiogenesis|Union of Harmonious Colonies|SHRIMP|Jiangshi|404→200/iu,
    "none of the Group's real culture or speculative research becomes homepage advertising merely by being discussed");
  assert.ok(!humanVisible.includes("Buy now"));
});

test("services are tied to an existing accountable company, and only inquiry is offered",()=>{
  assert.equal(tile(model("/"),"services"),undefined,
    "Homepage service menu is not a second entire client-contract catalog");
  const work=model("/work/");
  const list=tile(work,"services").html;
  assert.ok(list.includes("Persistent AI systems"));
  assert.ok(list.includes("Data rights and stewardship"));
  assert.ok(!list.includes("Indigenous data governance"),
    "identity is not a substitute for real data-governance methods");
  const data=frontdoor.offers.find(x=>x.id==="indigenous-data");
  assert.ok(data.scope.includes("CARE Principles"));
  assert.ok(data.scope.includes("relevant rights holders"));
  assert.ok(data.example.includes("Authority-to-control"));
  assert.ok(list.includes('href="'+data.framework.href+'"'));
  assert.ok(list.includes(data.framework.qualification.replace(/'/gu,"&#39;")),
    "actual HTML must preserve and safely escape the rights-holder caveat");

  for(const item of frontdoor.offers) {
    assert.ok(list.includes('id="'+item.id+'"'));
    const expected=item.scope.replace(/&/gu,"&amp;").replace(/'/gu,"&#39;");
    assert.ok(list.includes(expected));
    assert.ok(list.includes(home.group.companies.find(c=>c.id===item.provider).name));
  }
  for(const service of frontdoor.offers){
    const href="/contact/?service="+encodeURIComponent(service.title)+"#work";
    assert.ok(list.includes('href="'+href+'"'),
      "each service can open its own existing intake context: "+service.id);
  }
  assert.equal((list.match(/<details class="site-service-detail">/gu)||[]).length,
    frontdoor.offers.length,"all eight original service details are accessible but collapsed");
  assert.equal((list.match(/<summary>Scope, examples and source evidence<\/summary>/gu)||[]).length,
    frontdoor.offers.length,"native disclosure is a real no-script HTML control");
  assert.equal((list.match(/class="site-service-inquiry"/gu)||[]).length,
    frontdoor.offers.length,"buyer inquiries remain reachable without opening details");
  assert.equal((list.match(/Ask about this work/g)||[]).length,frontdoor.offers.length,
    "do not duplicate the existing inquiry destination or invent an order path");
  for(const item of frontdoor.offers.filter(x=>x.evidence)){
    assert.ok(list.includes('href="'+item.evidence.href+'"'),
      "a reader can inspect directly related public material: "+item.id);
    const escapedLabel=item.evidence.label.replace(/&/gu,"&amp;")
      .replace(/</gu,"&lt;").replace(/>/gu,"&gt;")
      .replace(/"/gu,"&quot;").replace(/'/gu,"&#39;");
    assert.ok(list.includes(escapedLabel),
      "visible links retain escaped HTML labels: "+item.id);
    assert.ok(list.includes(item.evidence.qualification));
  }
  assert.equal(frontdoor.offers.filter(x=>x.evidence).length,5,
    "only five independently labeled, bounded original evidence entrances are admitted");
  const pilots=frontdoor.offers.filter(x=>x.paidProposal);
  assert.deepEqual(pilots.map(x=>x.id),["green-web-pilot","evidence-marketing-pilot"]);
  assert.equal(frontdoor.offers.length,8);
  for(const service of pilots) {
    const proposal=service.paidProposal;
    assert.equal(service.provider,"services","the original Causeway seller remains responsible");
    assert.ok(proposal.href.startsWith("https://services.561.group/"));
    assert.ok(list.includes('href="'+proposal.href+'"'),"buyer can read original provider scope");
    assert.ok(list.includes(proposal.label));
    const escaped=proposal.qualification.replace(/&/gu,"&amp;")
      .replace(/'/gu,"&#39;");
    assert.ok(list.includes(escaped),"a proposal remains visibly nonbinding");
    assert.ok(!("price" in service) && !("checkout" in service),
      "the corporate source must not duplicate the real seller's prices or merchant");
  }
  assert.doesNotMatch(list,/Buy now|guaranteed earnings|confirmed price|currently available to book/iu);
  const structured=work.metadata.structuredData["@graph"][2].mainEntity;
  assert.equal(structured["@type"],"ItemList");
  assert.deepEqual(structured.itemListElement.map(x=>x.item.name),
    frontdoor.offers.map(x=>x.title));
  for(const [i,x] of structured.itemListElement.entries()){
    const service=frontdoor.offers[i];
    const provider=home.group.companies.find(comp=>comp.id===service.provider);
    assert.equal(x.item.provider["@id"],provider.url+"#organization");
    assert.equal(x.item.url,"https://561.group/work/#"+service.id);
    assert.equal(x.item["@type"],"Service");
    assert.ok(!("offers" in x.item) && !("aggregateRating" in x.item),
      "an inquiry must not silently become a priced or independently reviewed service");
  }
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
  const projects=model("/projects/");
  for(const venue of home.group.storefronts) {
    assert.ok(tile(projects,"trade").html.includes(venue.name));
    assert.ok(tile(projects,"trade").html.includes(venue.url));
  }
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
  assert.ok(vision.includes("Software does not confer community authority"));
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

test("data stewardship refuses a counterfeit CARE framework and loss of owner authority",()=>{
  const counterfeit=structuredClone(frontdoor);
  counterfeit.offers.find(x=>x.id==="indigenous-data").framework.href=
    "https://unrelated.example/indigenous-certified";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:counterfeit,path:"/work/"}),
    /CARE Principles/);
  const labelOnly=structuredClone(frontdoor);
  delete labelOnly.offers.find(x=>x.id==="indigenous-data").framework;
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:labelOnly,path:"/work/"}),
    /Data stewardship must expose its applicable CARE/u);
  const inspected=model("/about/");
  const practice=tile(inspected,"principles").html;
  assert.ok(practice.includes(home.public.materialApproach.headline));
  assert.ok(practice.includes("Energy")||practice.includes("energy"));
  assert.ok(practice.includes("rights holders"));
  assert.ok(!tile(model("/"),"introduction").html.includes("Indigenous"));
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
  const missingVision=structuredClone(frontdoor);
  missingVision.vision.frontiers.pop();
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:missingVision}),
    /Two complete, distinct/u);
  const injectedVision=structuredClone(frontdoor);
  injectedVision.vision.frontiers[0].thesis='<script>alert(1)</script>';
  const rendered=tile(project561GroupPage({home,estate,frontdoor:injectedVision,path:"/about/"}),"frontiers").html;
  assert.ok(rendered.includes("&lt;script&gt;"));
  assert.ok(!rendered.includes("<script>"));
  const improper=structuredClone(frontdoor);
  improper.offers[0].provider="nonexistent";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:improper}),/no original accountable company/);
  const unsafeEvidence=structuredClone(frontdoor);
  unsafeEvidence.offers[0].evidence={href:"javascript:alert(1)",label:"Fake proof",qualification:"No"};
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:unsafeEvidence}),/Only public HTTPS/);
  const unqualifiedEvidence=structuredClone(frontdoor);
  unqualifiedEvidence.offers[0].evidence={href:"https://science.561.group/",label:"Unverified",qualification:""};
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:unqualifiedEvidence}),
    /Inspectable service evidence/);
  const wrongSeller=structuredClone(frontdoor);
  wrongSeller.offers.find(x=>x.id==="green-web-pilot").provider="science";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:wrongSeller}),
    /competent Causeway seller/);
  const unsafeProposal=structuredClone(frontdoor);
  unsafeProposal.offers.find(x=>x.id==="green-web-pilot").paidProposal.href=
    "https://outside.example/not-a-causeway-publication/";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:unsafeProposal}),
    /canonical original Causeway publication/);
  const ambiguousProposal=structuredClone(frontdoor);
  ambiguousProposal.offers.find(x=>x.id==="green-web-pilot").paidProposal.href=
    "https://services.561.group/green-web-service-pilot/?unverified=1";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:ambiguousProposal}),
    /canonical original Causeway publication/);
  const noPriceCaveat=structuredClone(frontdoor);
  noPriceCaveat.offers.find(x=>x.id==="green-web-pilot").paidProposal.qualification="";
  assert.throws(()=>project561GroupPage({home,estate,frontdoor:noPriceCaveat}),
    /qualified proposal/);
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
  assert.ok(head.includes(".tufte-masthead::before"),"preserve the original compact ink 561 mark");
  assert.ok(head.includes("#frontiers"),"integrate civilizational vision into the source-owned house design");
  assert.ok(!home.description.startsWith("The Lakota-founded"),"lead with the work, not a founding-identity appeal");
  const modified=structuredClone(home);
  modified.group.handle='<script>alert(1)</script>';
  assert.doesNotMatch(project561GroupHead(modified),/<script>/u);
  assert.throws(()=>project561GroupHead({...home,origin:"https://other.example"}),TypeError);
});


test("original paid Work-receiving pilot exposes an honest, bounded customer inquiry rather than a fake checkout",()=>{
  const service=frontdoor.offers.find(item=>item.id==="agent-operations");
  assert.equal(service.provider,"services");
  assert.match(service.scope,/public GitHub Work\/Actions source/u);
  assert.match(service.scope,/customer-authorized, redacted Asana\/Jira export/u);
  assert.match(service.scope,/without account access, migration or customer-system changes/u);
  assert.match(service.example,/Provisional \$200 pilot estimate \(not a quote\)/u);
  assert.match(service.example,/up to 20 source Work records/u);
  assert.match(service.example,/no-purchase recommendation/u);
  assert.match(service.example,/Do not send tokens or private records/u);
  const work=tile(model("/work/"),"services").html;
  assert.equal(tile(model("/"),"services"),undefined);
  for(const html of [work]){
    assert.ok(html.includes("Provisional $200 pilot estimate"),
      "the actual source-owned service pitch must be visible to prospective customers");
    assert.ok(html.includes("customer-authorized, redacted Asana/Jira export"));
    assert.ok(html.includes("up to 20 source Work records"));
    assert.doesNotMatch(html,/Buy now|guaranteed return|payment complete|instant checkout/u);
  }
  assert.ok(work.includes('href="/contact/?service=Persistent%20AI%20systems#work"'),
    "keep the original accepted customer-inquiry path; no invented payment or lead intake");
  const registered=model("/work/").metadata.structuredData["@graph"][2].mainEntity;
  const entry=registered.itemListElement.find(x=>x.item["@id"].endsWith("#agent-operations"));
  assert.ok(entry);
  assert.equal(entry.item.provider["@id"],
    home.group.companies.find(x=>x.id==="services").url+"#organization");
  assert.equal("offers" in entry.item,false,
    "a provisional service estimate must not become an enforceable schema.org Offer or payment claim");
});

test("first-party GitHub audit evidence gives a paying prospect a bounded example without fake client proof",()=>{
 const service=frontdoor.offers.find(s=>s.id==="agent-operations");
 const source="https://github.com/561-group/561.group/issues/17#issuecomment-6378737097";
 assert.equal(service.evidence.href,source);
 assert.match(service.evidence.label,/20-record Work-continuity sample/u);
 assert.match(service.evidence.qualification,/First-party source inspection/u);
 assert.match(service.evidence.qualification,/Not an outside customer audit/u);
 assert.match(service.evidence.qualification,/earned sale or Asana\/Jira parity evidence/u);
 for(const page of ["/work/"]){
  const markup=tile(model(page),"services").html;
  assert.ok(markup.includes('href="'+source+'"'),
    "real first-party Work source can be reached from the original service card");
  assert.ok(markup.includes(service.evidence.label));
  assert.ok(markup.includes(service.evidence.qualification));
  assert.ok(markup.includes('href="/contact/?service=Persistent%20AI%20systems#work"'),
    "original seller intake survives public source-evidence discovery");
  assert.doesNotMatch(markup,/Buy now|guaranteed savings|validated customer results/u);
 }
 const business=model("/work/").metadata.structuredData["@graph"][2].mainEntity;
 const details=business.itemListElement.find(row=>row.item["@id"].endsWith("#agent-operations")).item;
 assert.equal(details.provider["@id"],home.group.companies.find(p=>p.id==="services").url+"#organization");
 assert.equal("offers" in details,false);
 assert.equal("aggregateRating" in details,false);
 const noEvidence=structuredClone(frontdoor);
 noEvidence.offers.find(s=>s.id==="agent-operations").evidence.href="javascript:alert(1)";
 assert.throws(()=>project561GroupPage({home,estate,frontdoor:noEvidence,path:"/work/"}),
   /Only public HTTPS resources/u);
});
