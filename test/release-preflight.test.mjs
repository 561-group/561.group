import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {qualifyRelease} from "../scripts/release-preflight.mjs";

const sha="0123456789abcdef0123456789abcdef01234567";
const receipt={repository:"561-group/561.group",origin:"https://561.group",
  renderer:"TUFTE",application:"LivingWebServer",sourceCommit:sha};
const requiredAssets=["public/estate-records.json","public/contact/index.html",
  "public/llms.txt","public/llms-full.txt","public/sitemap.xml",
  "public/robots.txt","public/zh-hans/index.html","public/lkt/index.html"];
const valid={mainBranch:"main",sourceSha:sha,checkoutSha:sha,receipt,
  lockPresent:true,dependenciesInstalled:true,requiredAssets,duplicateIndex:false};
test("one qualified local source is not mistaken for a deployed provider release",()=>{
  const result=qualifyRelease(valid);
  assert.equal(result.sourceCommit,sha);
  assert.equal(result.providerDeployed,false);
  assert.equal(result.independentlyAccepted,false);
  assert.equal(result.application,"LivingWebServer");
});
test("unqualified branches, missing checkout identity, and stale source receipts refuse",()=>{
  for(const variant of [
    {mainBranch:"feature"},{sourceSha:"main"},
    {checkoutSha:"f".repeat(40)},
    {receipt:{...receipt,sourceCommit:"f".repeat(40)}},
    {receipt:{...receipt,renderer:"Other"}}
  ])assert.throws(()=>qualifyRelease({...valid,...variant}));
});
test("no original supplier lock, installed Fetch runtime, or intact public assets means no release",()=>{
  for(const variant of [
    {lockPresent:false},{dependenciesInstalled:false},
    {requiredAssets:requiredAssets.slice(1)},
    {duplicateIndex:true}
  ])assert.throws(()=>qualifyRelease({...valid,...variant}));
});
test("ordinary npm deploy script cannot bypass source and native tests with bare Wrangler",()=>{
  const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
  assert.match(pkg.scripts.deploy,/npm run check/u);
  assert.match(pkg.scripts.deploy,/npm test/u);
  assert.match(pkg.scripts.deploy,/npm run build/u);
  assert.match(pkg.scripts.deploy,/node scripts\/release-preflight\.mjs/u);
  assert.match(pkg.scripts.deploy,/wrangler deploy/u);
  assert.equal(pkg.dependencies["@red-cup-engineering/l-space"],undefined);
  assert.ok(pkg.dependencies["@red-cup-engineering/living-web-server"]);
});
