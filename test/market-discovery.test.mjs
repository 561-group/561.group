import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {renderIndex,renderWork,renderApproach,renderLlms,renderSitemap,renderSitemapText} from "../src/render.mjs";

const root=new URL("../",import.meta.url);
const home=JSON.parse(await readFile(new URL("data/home.json",root),"utf8"));
const estate=JSON.parse(await readFile(new URL("data/estate.json",root),"utf8"));
const human=()=>renderIndex(home,estate);
const machine=()=>renderLlms(home,estate);
const clone=x=>structuredClone(x);

test("machine market preserves original x402, A2A and MCP authorities without fabricated quantities",()=>{
 const urls=[
  "https://market.561.group/.well-known/agent-card.json",
  "https://market.561.group/.well-known/x402.json",
  "https://market.561.group/.well-known/x402-service.json",
  "https://market.561.group/v1/catalog",
  "https://market.561.group/llms.txt",
  "https://market.561.group/mcp"
 ];
 for(const url of urls)assert.equal(estate.machine.filter(x=>x.url===url).length,1);
 assert.equal(estate.machine.filter(x=>x.url.startsWith("https://market.561.group")).length,6);
 const market=estate.nodes.find(x=>x.host==="market.561.group");
 assert.match(market.line,/seller's priced computations|x402 terms/u);
 assert.doesNotMatch(market.line,/\b\d+\s+skills\b/iu);
});

test("homepage does its proper job instead of displaying the encyclopedia",()=>{
 const page=human();
 const main=page.match(/<main id="main">([\s\S]*?)<\/main>/u)?.[1];
 assert.ok(main,"one main landmark");
 assert.equal((main.match(/<h1>/gu)||[]).length,1);
 assert.ok(home.public.headline.length<=90,"readable source-owned homepage headline");
 assert.ok(main.includes("<h1>"+home.public.headline+"</h1>"),"current source headline projects to reader");
 assert.ok(main.includes(home.public.intro),"source-owned introductory claim reaches reader");
 assert.ok(main.includes(home.public.aim),"source-owned mission reaches reader");
 assert.match(main,/href="#work">Explore the work/u);
 assert.match(main,/href="\/contact\/">Get in touch/u);
 assert.ok(main.length<5500,"reader's core page must remain concise");
 assert.doesNotMatch(main,/Huidu Guanli|Rendanheyi|transfinitely-valued|MAPE-K|Knaster/u);
 assert.doesNotMatch(page,/class="ticker"|id="clock"|data-phase=/u);
});

test("each featured link is an actual authored public door with a clear reader action",()=>{
 const page=human();
 assert.equal((page.match(/class="card"/gu)||[]).length,5);
 for(const entry of home.public.featured){
  const n=estate.nodes.find(n=>n.host===entry.host);
  assert.ok(estate.doors.includes(n.host));
  assert.ok(page.includes('href="'+(n.url||"https://"+n.host+"/")+'"'));
  assert.ok(page.includes(entry.action));
  assert.ok(page.includes(entry.summary));
 }
 assert.match(page,/href="\/work\/">See the full project directory/u);
});

test("directory is a separate page-type and retains every authored public project",()=>{
 const page=renderWork(home,estate);
 assert.match(page,/<h1>Find a project\.<\/h1>/u);
 assert.equal((page.match(/<h1>/gu)||[]).length,1);
 for(const n of estate.nodes) {
  assert.ok(page.includes(">"+n.name+" →</a>"),"missing project "+n.name);
  assert.ok(page.includes(n.line),"missing description "+n.name);
 }
 assert.match(page,/\/estate\.json/u);
 assert.doesNotMatch(page,/<time[^>]*id="derived"/u);
});

test("research explanation is separate, readable and ordered by actual dependency",()=>{
 const page=renderApproach(home,estate);
 assert.match(page,/How our research becomes technology\./u);
 assert.equal((page.match(/<h1>/gu)||[]).length,1);
 assert.match(page,/<ol class="steps">/u);
 let prev=-1;
 for(let i=0;i<4;i++){
  const stage=home.foundation.stages[i];
  const at=page.indexOf('>'+stage.name+'</h2>');
  assert.ok(at>prev,"source phase order: "+stage.name);prev=at;
  assert.ok(page.includes(home.public.approachStages[i]));
  assert.ok(page.includes(stage.sourceUrl));
  assert.ok(page.includes(stage.limit));
 }
 assert.match(page,/What our software accomplishes/u);
});

test("metas and JSON-LD use one genuine Organization while preserving source-truth and no script escape",()=>{
 const page=human();
 assert.ok(home.public.intro.includes("Lakota-founded"),"preserve founded provenance in the source-owned public description");
 const summaryOf=html=>html.match(/<meta name="description" content="([^"]+)">/u)?.[1];
 assert.equal(summaryOf(page),home.public.intro);
 assert.equal(summaryOf(renderWork(home,estate)),home.public.workDirectoryIntro);
 assert.equal(summaryOf(renderApproach(home,estate)),home.public.approachPageIntro);
 assert.equal(new Set([summaryOf(page),summaryOf(renderWork(home,estate)),summaryOf(renderApproach(home,estate))]).size,3);

 const txt=page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
 assert.ok(txt);
 const data=JSON.parse(txt);
 const [org,site,list]=data["@graph"];
 assert.equal(org.description,home.description);
 assert.equal(site.publisher["@id"],org["@id"]);
 assert.equal(org.logo,"https://561.group/favicon.svg");
 assert.deepEqual(list.itemListElement.map(x=>x.item.url),estate.nodes.map(n=>n.url||"https://"+n.host+"/"));
 assert.ok(list.itemListElement.every(x=>x.item["@type"]==="WebPage"));
 assert.doesNotMatch(page,/property="og:image"|summary_large_image/u,"outdated social card remains withdrawn");
});

test("agent account provides authoritative real routes, safe scope and the same institutional aim",()=>{
 const txt=machine();
 assert.ok(txt.includes(home.public.aim));
 for(const path of ["/approach/","/contact/","/work/","/estate.json"])assert.ok(txt.includes("https://561.group"+path));
 for(const n of estate.nodes)assert.ok(txt.includes(n.name),"agent misses "+n.name);
 for(const m of estate.machine)assert.ok(txt.includes(m.url),"agent misses "+m.url);
 for(let i=0;i<4;i++) {
  assert.ok(txt.includes(home.public.approachStages[i]));
  assert.ok(txt.includes(home.foundation.stages[i].limit));
 }
 assert.doesNotMatch(txt,/Huidu Guanli|Rendanheyi/u);
});

test("visible support links share one genuine checkout with full terms, and spoofed offers are refused",()=>{
 const url=home.support.checkoutUrl,page=human(),agent=machine();
 const checkoutUrls=[...page.matchAll(/href="(https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+)"/gu)].map(match=>match[1]);
 assert.ok(checkoutUrls.length>=1,"a reader can find voluntary support");
 assert.deepEqual([...new Set(checkoutUrls)],[url],"every support CTA uses the one authorized checkout");
 assert.ok(agent.includes(url));assert.match(page,/not a tax-deductible charitable contribution/u);
 assert.match(page,/USD \$10\/month/u);assert.match(agent,/Voluntary USD \$10\/month/u);
 for(const fake of ["https://evil.invalid/pay","http://buy.stripe.com/abc","https://buy.stripe.com/xyz?a=1"]){
  const copy=clone(home);copy.support.checkoutUrl=fake;
  assert.throws(()=>renderIndex(copy,estate),/accepted exact Stripe checkout URL/u);
 }
 const copy=clone(home);copy.support.monthlyUsd=0;
 assert.throws(()=>renderLlms(copy,estate),/positive whole-dollar monthly price/u);
});

test("unsafe homepage/source edits refuse rather than silently corrupt a reader path",()=>{
 const invalid=[
  c=>{c.public.featured.reverse()},
  c=>{c.public.featured[0].host="unlisted.invalid"},
  c=>{c.public.approachStages=[]},
  c=>{c.public.headline=""},
  c=>{c.foundation.stages.reverse()},
  c=>{c.foundation.stages[1].limit=""},
  c=>{c.foundation.stages[2].sourceUrl="https://github.com.evil.invalid/a/b/blob/main/x"},
  c=>{c.foundation.stages[2].sourceUrl="javascript:alert(1)"},
  c=>{c.public.aim="volatility"},
 ];
 for(const change of invalid) {
  const copy=clone(home);change(copy);
  assert.throws(()=>renderIndex(copy,estate));
  assert.throws(()=>renderLlms(copy,estate));
 }
});

test("authored text escapes in HTML but source stays intact in JSON-LD",()=>{
 const attack='</script><script>alert("untrusted")</script>';
 const changed=clone(home);changed.public.intro=attack;
 const html=renderIndex(changed,estate);
 assert.doesNotMatch(html,/<script>alert\("untrusted"\)<\/script>/u);
 assert.match(html,/&lt;\/script&gt;&lt;script&gt;alert/u);
 const estateCopy=clone(estate);estateCopy.nodes[0].line=attack;
 const page=renderIndex(home,estateCopy);
 const txt=page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
 assert.equal(JSON.parse(txt)["@graph"][2].itemListElement[0].item.description,attack);
});

test("sitemaps enumerate only real supported page types and retain route parity",()=>{
 const expected=["https://561.group/","https://561.group/approach/","https://561.group/contact/","https://561.group/work/"];
 const xml=renderSitemap(home);
 const plain=renderSitemapText(home);
 const xmlUrls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map(x=>x[1]);
 assert.deepEqual(xmlUrls,expected);
 assert.deepEqual(plain.trimEnd().split("\n"),expected);
 assert.ok(plain.endsWith("\n"));
});

test("all three human templates retain accessible navigation, single main, and no JavaScript dependence",()=>{
 for(const page of [human(),renderApproach(home,estate),renderWork(home,estate)]){
  assert.match(page,/href="#main">Skip to content/u);
  assert.match(page,/<main id="main">/u);
  assert.match(page,/<nav class="site-nav" aria-label="Main">/u);
  assert.match(page,/<html lang="en">/u);
  assert.match(page,/@media\(max-width:700px\)/u);
  assert.doesNotMatch(page,/<script(?! type="application\/ld\+json")/u);
 }
});
