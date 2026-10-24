import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {create561GroupLivingApplication,PUBLIC_ROUTES} from "../src/living-home.mjs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const home=read("data/home.json");
const estate={...read("data/estate.json"),revision:"installed-editorial-fixture"};
const frontdoor=read("data/frontdoor.json");
function fixture(){
  const reads=[];
  const app=create561GroupLivingApplication({
    releaseHome:home,
    readHome:async context=>{reads.push(["home",context.request.method]);return home;},
    readEstate:async context=>{reads.push(["estate",context.request.method]);return estate;},
    readFrontdoor:async context=>{reads.push(["frontdoor",context.request.method]);return frontdoor;}
  });
  const request=(path="/",options={})=>app.fetch(new Request("https://561.group"+path,options));
  return {app,reads,request};
}
test("real installed TUFTE/LWS publishes a quiet useful homepage, not a thematic billboard",async()=>{
  const f=fixture();
  const response=await f.request("/",{headers:{accept:"text/html"}});
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type")??"",/text\/html/u);
  const html=await response.text();
  assert.match(html,/<main[^>]*data-tufte/u);
  assert.ok(html.includes(frontdoor.proposition));
  for(const phrase of ["What the Group does","Find what you need","The four companies",
    "Public projects and publications","Get in touch", "Lenticule Science",
    "Red Cup Engineering","Coesite Operations","Causeway Services"]){
    assert.ok(html.includes(phrase),"a visitor needs a coherent institutional route: "+phrase);
  }
  for(const route of ["/work/","/projects/","/about/","/for-agents/","/contact/"])
    assert.ok(html.includes('href="'+route+'"'),"one-click public route "+route);
  assert.ok(html.includes('href="https://science.561.group/"'));
  assert.ok(html.includes('href="https://koios.news/"'));
  const visibleMain=html.slice(html.indexOf("<main"),html.indexOf("</main>")+7);
  assert.doesNotMatch(visibleMain,/Indigenous-grounded|Indigenous data governance|SHRIMP|Jiangshi|Artificial Abiogenesis|silica-rich|Beyond settler-colonial governance/iu,
    "Homepage visible content must not inherit the legitimate long-form research metadata");
  assert.match(html,/rel="canonical" href="https:\/\/561\.group\/"/u);
  assert.match(html,/name="fediverse:creator"/u);
  assert.match(html,/type="application\/ld\+json"/u);
  assert.ok(html.includes(":focus-visible"));
  assert.ok(html.includes("max-width:430px"));
  assert.deepEqual(f.reads.map(x=>x[0]),["home","estate","frontdoor"]);
});
test("the SAME real source yields useful machine-readable TUFTE JSON",async()=>{
  const f=fixture();
  const response=await f.request("/",{headers:{accept:"application/json"}});
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type")??"",/application\/json/u);
  const model=await response.json();
  assert.equal(model.kind,"tufte.projection");
  assert.equal(model.title,home.name);
  assert.equal(model.metadata.description,home.description);
  assert.equal(model.revision,estate.revision);
  assert.ok(model.tiles.find(t=>t.id==="paths")?.html.includes('href="https://science.561.group/"'),
    "machine-readable TUFTE readers must receive the same research path");

  assert.deepEqual(model.tiles.map(t=>t.id),
    ["introduction","paths","companies","explore","contact"]);
  assert.equal(model.metadata.structuredData["@graph"][0].subOrganization.length,4);
  const homeTopics=model.metadata.structuredData["@graph"][0].knowsAbout;
  assert.deepEqual(homeTopics,["research","software engineering",
    "operational coordination","energy and resource management","public services"]);
  assert.ok(!homeTopics.includes("Artificial Abiogenesis and Smartgoo"),
    "homepage semantic metadata must match its useful visible public purpose");
  assert.ok(!model.tiles.some(t=>["frontiers","physical-world","support","trade","services"].includes(t.id)),
    "projected home stays a five-part visitor entrance, not a place for every research or commercial subject");
  assert.ok(model.tiles.some(t=>t.id==="companies" && t.html.includes("Causeway Services")));

  assert.deepEqual(f.reads.map(x=>x[0]),["home","estate","frontdoor"]);
});
test("each substantive source-owned page renders different useful HTML AND JSON",async()=>{
  const f=fixture();
  const cells=[
    {path:"/work/",phrase:"Areas we can scope",id:"services"},
    {path:"/projects/",phrase:"Shop, Bazaar and Market",id:"trade"},
    {path:"/about/",phrase:"The companies",id:"companies"},
    {path:"/for-agents/",phrase:"Published machine-readable interfaces",id:"endpoints"}
  ];
  for(const {path,phrase,id} of cells){
    const page=await f.request(path,{headers:{accept:"text/html"}});
    assert.equal(page.status,200,path);
    const html=await page.text();
    assert.ok(html.includes(phrase),path+" human task");
    assert.ok(html.includes('href="https://561.group'+path+'"'),path+" canonical metadata");
    const machine=await f.request(path,{headers:{accept:"application/json"}});
    assert.equal(machine.status,200,path+" JSON");
    const data=await machine.json();
    assert.equal(data.kind,"tufte.projection");
    assert.equal(data.metadata.canonical,"https://561.group"+path);
    const discoveryText=data.metadata.description;
    assert.ok(discoveryText.length>=95 && discoveryText.length<=185,
      path+" has a useful bounded search and social preview description");
    assert.ok(discoveryText.includes("561 Group"),path+" names its responsible institution");
    assert.notEqual(discoveryText,data.subtitle,
      path+" page-specific description should answer the external reader's actual question");
    const metaDescription=[...html.matchAll(/<meta\b[^>]*>/giu)].map(match=>match[0])
      .find(tag=>/\bname=["']description["']/iu.test(tag));
    assert.ok(metaDescription,path+" emits original HTML description metadata");
    const escapedDescription=discoveryText.replaceAll("&","&amp;")
      .replaceAll("'","&#39;").replaceAll('"',"&quot;");
    assert.ok(metaDescription.includes(discoveryText) ||
      metaDescription.includes(escapedDescription),
      path+" emitted HTML and JSON description must describe the same actual page");
    assert.ok(data.tiles.some(t=>t.id===id),path+" relevant TUFTE model");
    if(path==="/work/"){
      const services=data.tiles.find(t=>t.id==="services").html;
      for(const offer of frontdoor.offers.filter(s=>s.evidence)){
        assert.ok(services.includes('href="'+offer.evidence.href+'"'),
          "public TUFTE source evidence link: "+offer.id);
        assert.ok(services.includes(offer.evidence.qualification),
          "public evidence is visibly qualified: "+offer.id);
      }
      const pilots=frontdoor.offers.filter(s=>s.paidProposal);
      assert.equal(pilots.length,2,"only two original accepted provider proposals are promoted");
      for(const offer of pilots){
        assert.ok(services.includes('href="'+offer.paidProposal.href+'"'),
          "real LivingWebServer model links to the seller's accepted pilot source");
        assert.ok(services.includes(offer.paidProposal.qualification),
          "the actual machine projection keeps quote/acceptance limitations visible");
        assert.ok(!("price" in offer),
          "machine consumer does not invent a current merchant price");
      }
      const listings=data.metadata.structuredData["@graph"][2].mainEntity;
      assert.equal(listings["@type"],"ItemList");
      assert.equal(listings.itemListElement.length,frontdoor.offers.length);
      assert.ok(listings.itemListElement.every(x=>x.item["@type"]==="Service" &&
        !("offers" in x.item)),"no unauthorized checkout terms");
    }
  }
  assert.equal(f.reads.length,3*cells.length*2);
});
test("origin, method and undeclared URL cannot acquire a public source read",async()=>{
  const f=fixture();
  const offsite=await f.app.fetch(new Request("https://other.example/"));
  assert.equal(offsite.status,421);
  assert.deepEqual(f.reads,[]);
  for(const path of ["/","/work/","/projects/","/about/","/for-agents/"]){
    const post=await f.request(path,{method:"POST"});
    assert.notEqual(post.status,200);
  }
  assert.notEqual((await f.request("/private/")).status,200);
  assert.notEqual((await f.request("/contact/")).status,200,
    "contact is retained by the original Worker assets, not duplicated by LWS");
  assert.deepEqual(f.reads,[]);
});
test("all admitted pages implement native HEAD without leaking response body",async()=>{
  const f=fixture();
  for(const path of PUBLIC_ROUTES){
    const response=await f.request(path,{method:"HEAD"});
    assert.equal(response.status,200,path);
    assert.equal(await response.text(),"",path+" HEAD response");
  }
});
test("new front-door reader is required; missing source cannot yield a vague blank homepage",()=>{
  assert.throws(()=>create561GroupLivingApplication({
    readHome:()=>home,readEstate:()=>estate,releaseHome:home
  }),/readFrontdoor/);
});


test("public about page makes the two literal long-horizon programs inspectable, not falsely completed",async()=>{
  const {request}=fixture();
  const res=await request("/about/",{headers:{accept:"application/json"}});
  assert.equal(res.status,200);
  const model=await res.json();
  assert.ok(model.metadata.structuredData["@graph"][0].knowsAbout.includes(
    "Artificial Abiogenesis and Smartgoo"),
    "long-form original research metadata must remain discoverable on About");
  const frontier=model.tiles.find(x=>x.id==="frontiers");
  assert.ok(frontier);
  assert.ok(frontier.html.includes("Coordinating autonomous communities"));
  assert.ok(frontier.html.includes("siloxane"));
  assert.ok(frontier.html.includes("We have not created silicon-based life"));
  assert.ok(frontier.html.includes("Software does not confer community authority"));
  assert.ok(frontier.html.includes("treaty rights"));
  assert.ok(frontier.html.includes("must be chosen by the people"));

  assert.ok(frontier.html.includes("https://science.561.group/"));
});
