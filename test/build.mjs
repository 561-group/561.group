import { mkdtemp, mkdir, cp, readFile, writeFile, symlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

// Qualifies the actual unchanged publication producer with a single original
// site-owned estate, not a copied test-game catalogue or a second renderer.
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const scratch=await mkdtemp(path.join(tmpdir(),"apex-publish-"));
const app=path.join(scratch,"app");
await cp(ROOT,app,{recursive:true,filter:p=>!p.includes("node_modules")});
await mkdir(path.join(app,"node_modules/@red-cup-engineering"),{recursive:true});
await symlink(path.dirname(fileURLToPath(import.meta.resolve("@red-cup-engineering/l-space/package.json"))),
  path.join(app,"node_modules/@red-cup-engineering/l-space"));
const preload=path.join(scratch,"offline.mjs");
await writeFile(preload,"globalThis.fetch=()=>{throw Error('Offline publication fixture');};\n");
const sourceCommit="0123456789abcdef0123456789abcdef01234567";
const base={...process.env,SITE_PUBLICATION_DATE:"2026-10-22",GITHUB_SHA:sourceCommit};
const run=(extra={})=>spawnSync(process.execPath,["--import",preload,"scripts/build.mjs"],{
  cwd:app,env:{...base,...extra},encoding:"utf8"
});
let passed=0;
const check=(name,fn)=>{fn();passed++;console.log("PASS",name);};
const first=run();
check("actual original build executes with installed L-Space supplier",()=>assert.equal(first.status,0,first.stderr));
const names=["source-revision.json","estate-records.json","index.html","zh-hans/index.html",
  "lkt/index.html","llms.txt","llms-full.txt","feed.json","feed.atom.xml",
  "feed.rss.xml",".well-known/security.txt","8d232583e7cba18a83bf5c0325fcc7c9.txt",
  "humans.txt","robots.txt","sitemap.xml"];
const readOutputs=async()=>Object.fromEntries(await Promise.all(names.map(async name=>[
  name,await readFile(path.join(app,"public",name),"utf8")])));
const before=await readOutputs();
const generated=JSON.parse(before["estate-records.json"]);
const authored=JSON.parse(await readFile(path.join(ROOT,"data/estate.json"),"utf8"));
check("public estate is exactly the original curated site source",()=>{
  assert.deepEqual(generated.nodes,authored.nodes);
  assert.deepEqual(generated.machines,authored.machines);
  assert.deepEqual(generated.doors,authored.doors);
});
check("original Play project stays discoverable without importing its full build",()=>{
  assert.equal(generated.nodes.filter(n=>n.host==="play.561.group").length,1);
  assert.equal(generated.nodes.some(n=>n.host==="fixture.invalid"),false);
});
check("current release identifies exact original source revision and producer",()=>{
  const receipt=JSON.parse(before["source-revision.json"]);
  assert.deepEqual(receipt,{repository:"561-group/561.group",sourceCommit,
    renderer:"TUFTE",application:"LivingWebServer",origin:"https://561.group"});
});
check("UTC publication date fixes original security and sitemap output",()=>{
  assert.match(before["sitemap.xml"],/2026-10-22/);
  assert.match(before[".well-known/security.txt"],/Expires: 2027-10-22/);
});
check("repeat original build succeeds",()=>{const second=run();assert.equal(second.status,0,second.stderr);});
const after=await readOutputs();
check("original human and machine artifacts are deterministic",()=>assert.deepEqual(after,before));
for(const [name,extra,pattern] of [
  ["invalid publication day",{SITE_PUBLICATION_DATE:"2026-02-30"},/real YYYY-MM-DD UTC day/],
  ["invalid source commit",{GITHUB_SHA:"not-a-commit"},/one exact source commit/]
]){
  const v=run(extra);
  check(name+" is refused",()=>{
    assert.notEqual(v.status,0);
    assert.match(v.stderr,pattern);
  });
}
const edited=structuredClone(authored);
for(let i=0;i<46;i++)edited.nodes.push({host:"fixture"+i+".invalid",name:"Fixture",group:"games",line:"Not real"});
await writeFile(path.join(app,"data/estate.json"),JSON.stringify(edited));
const oversized=run();
check("existing Worker probing budget still refuses an oversized owned estate",()=>{
  assert.notEqual(oversized.status,0);
  assert.match(oversized.stderr,/subrequest budget/);
});
console.log(JSON.stringify({passed,scope:"Actual site build + original installed language supplier, with offline feed/market observations. No private Play checkout, live deployment or public reader implied."}));
