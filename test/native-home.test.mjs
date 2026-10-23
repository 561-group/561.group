import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { create561GroupLivingApplication } from "../src/living-home.mjs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const home=read("data/home.json");
const estate={...read("data/estate.json"),revision:"site-genuine-tufte-fixture"};
function fixture(){
  const events=[];
  const app=create561GroupLivingApplication({
    releaseHome:home,
    readHome:async context=>{events.push({source:"home",method:context.request.method});return home;},
    readEstate:async context=>{events.push({source:"estate",method:context.request.method});return estate;}
  });
  const request=(path="/",init={})=>app.fetch(new Request("https://561.group"+path,init));
  return {app,events,request};
}
test("the installed original LivingWebServer and TUFTE produce real human HTML",async()=>{
  const f=fixture();
  const response=await f.request("/",{headers:{accept:"text/html"}});
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type")??"",/text\/html/);
  const html=await response.text();
  assert.match(html,/<main[^>]*data-tufte/u);
  assert.match(html,/AI agents have offices here/u);
  assert.match(html,/Work with us/u);
  assert.match(html,/https:\/\/buy\.stripe\.com\//u);
  assert.match(html,/rel="canonical" href="https:\/\/561\.group\/"/u);
  assert.match(html,/name="fediverse:creator"/u);
  assert.match(html,/type="application\/ld\+json"/u);
  assert.doesNotMatch(html,/conurbanized ecosystem/u);
  assert.deepEqual(f.events.map(e=>e.source),["home","estate"]);
});
test("the exact same original source negotiates machine-readable TUFTE JSON",async()=>{
  const f=fixture();
  const response=await f.request("/",{headers:{accept:"application/json"}});
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type")??"",/application\/json/);
  const model=await response.json();
  assert.equal(model.kind,"tufte.projection");
  assert.equal(model.title,home.name);
  assert.equal(model.metadata.description,home.description);
  assert.equal(model.revision,estate.revision);
  assert.deepEqual(model.tiles.map(t=>t.id),["introduction","contact","explore","support","companies"]);
  assert.equal(model.metadata.structuredData["@graph"][0].subOrganization.length,4);
  assert.deepEqual(f.events.map(e=>e.source),["home","estate"]);
});
test("a different origin never reaches the Group's private-source decision",async()=>{
  const f=fixture();
  const response=await f.app.fetch(new Request("https://other.example/"));
  assert.equal(response.status,421);
  assert.deepEqual(f.events,[]);
});
test("unadmitted methods and unrelated routes cannot read a Group public home",async()=>{
  const f=fixture();
  const post=await f.request("/",{method:"POST"});
  assert.notEqual(post.status,200);
  const unknown=await f.request("/not-an-authored-group-page");
  assert.notEqual(unknown.status,200);
  assert.deepEqual(f.events,[]);
});
test("a Worker HEAD request has no HTML response body",async()=>{
  const f=fixture();
  const r=await f.request("/",{method:"HEAD"});
  assert.equal(r.status,200);
  assert.equal(await r.text(),"");
});
