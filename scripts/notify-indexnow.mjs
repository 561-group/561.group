#!/usr/bin/env node
// Original 561.group post-release IndexNow notifier.
// Bing/IndexNow receives only recently changed public page URLs, never private
// records or site source. A received notification is NOT a crawl, index entry,
// AI citation, visit, or marketing conversion.
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {execFileSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const ORIGIN="https://561.group";
const API="https://api.indexnow.org/indexnow";
const KEY=/^[a-zA-Z0-9-]{8,128}$/u;
const PUBLIC_PAGES=Object.freeze([
  "/","/work/","/projects/","/about/","/for-agents/","/contact/"
]);
const CONTENT_FILES=new Set([
  "src/home-tufte.mjs","src/render.mjs","src/living-home.mjs",
  "src/public-home-style.mjs","src/apex-house-style.mjs"
]);

export function chooseChangedPublicPages(changedFiles,{frontdoorPinChanged=false}={}){
  if(!Array.isArray(changedFiles)||changedFiles.some(x=>typeof x!=="string"||
    !/^[a-z0-9._/-]+$/iu.test(x)))throw new TypeError("Untrusted Git change list");
  // First adoption of the previously published IndexNow key: announce the
  // recently changed root once. Never manufacture a site-wide recrawl.
  if(changedFiles.includes("scripts/notify-indexnow.mjs"))return ["/"];
  if(frontdoorPinChanged||changedFiles.some(x=>CONTENT_FILES.has(x)))
    return [...PUBLIC_PAGES];
  return [];
}

export function qualifiedIndexNowRequest({origin=ORIGIN,key,paths}={}){
  if(origin!==ORIGIN||typeof key!=="string"||!KEY.test(key)||
     !Array.isArray(paths)||paths.length===0||paths.length>PUBLIC_PAGES.length||
     new Set(paths).size!==paths.length||
     paths.some(path=>!PUBLIC_PAGES.includes(path)))
    throw new TypeError("IndexNow notification needs original public host, key and admitted changed paths");
  const keyLocation=origin+"/"+key+".txt";
  return Object.freeze({endpoint:API,keyLocation,
    body:{host:"561.group",key,keyLocation,
      urlList:paths.map(path=>origin+path)}
  });
}

function outcome({status,paths,sourceCommit,reason=null,providerHttp=null}){
  return {kind:"indexnow-notification-observation/v1",
    observedAt:new Date().toISOString(),sourceCommit:sourceCommit??null,
    status,reason,providerHttp,urlList:paths.map(path=>ORIGIN+path),
    indexingVerified:false,aiCitationVerified:false,
    qualification:"An IndexNow HTTP receipt is only a change notification, not crawl, indexing, citation, audience or revenue evidence."};
}

export async function notifyIndexNow({
  key,changedFiles,frontdoorPinChanged=false,sourceCommit=null,
  fetchImpl=fetch
}={}){
  const paths=chooseChangedPublicPages(changedFiles,{frontdoorPinChanged});
  if(paths.length===0)return outcome({status:"no-public-page-change",paths,sourceCommit});
  const request=qualifiedIndexNowRequest({key,paths});
  try{
    // The Group owns the origin and has already authored this exact key file.
    // Refuse to notify another provider until we *observe* the public key.
    const proof=await fetchImpl(request.keyLocation,{
      method:"GET",redirect:"error",cache:"no-store",
      headers:{"cache-control":"no-cache"},
      signal:AbortSignal.timeout(12000)
    });
    const size=Number(proof.headers.get("content-length"));
    if(proof.status!==200||(Number.isFinite(size)&&size>512))
      return outcome({status:"ownership-not-verified",paths,sourceCommit,
        reason:"key-file-not-public",providerHttp:proof.status});
    const body=await proof.text();
    if(body.length>512||body.trim()!==key)
      return outcome({status:"ownership-not-verified",paths,sourceCommit,
        reason:"key-file-mismatch",providerHttp:proof.status});
    const response=await fetchImpl(request.endpoint,{
      method:"POST",redirect:"error",cache:"no-store",
      headers:{"content-type":"application/json; charset=utf-8","accept":"application/json"},
      body:JSON.stringify(request.body),
      signal:AbortSignal.timeout(12000)
    });
    const status=response.status===200?"submitted":
      response.status===202?"key-validation-pending":"provider-refused";
    return outcome({status,paths,sourceCommit,providerHttp:response.status,
      reason:status==="provider-refused"?"indexnow-http-"+response.status:null});
  }catch(error){
    return outcome({status:"provider-unobserved",paths,sourceCommit,
      reason:error?.name==="TimeoutError"?"timeout":"transport"});
  }
}

function changedSource(){
  const git=(...args)=>execFileSync("git",args,{encoding:"utf8"}).trim();
  const files=git("diff","--name-only","HEAD^","HEAD").split(/\r?\n/u).filter(Boolean);
  // Source-backed content is checked out separately; only a changed original
  // pin moves editorial bytes. Other deploy-script edits do not count.
  const old=git("show","HEAD^:.github/workflows/deploy.yml");
  const now=git("show","HEAD:.github/workflows/deploy.yml");
  const pin=text=>text.match(/repository:\s*561-group\/561-group-frontdoor-services-section\s*\n\s*ref:\s*([a-f0-9]{40})/u)?.[1]??null;
  const before=pin(old),after=pin(now);
  if(!before||!after)throw new Error("No immutable original Group content pin");
  return {changedFiles:files,frontdoorPinChanged:before!==after};
}

async function main(){
  const origin=JSON.parse(await readFile("data/home.json","utf8"));
  if(origin.origin!==ORIGIN)throw new Error("Unexpected original home authority");
  const {changedFiles,frontdoorPinChanged}=changedSource();
  const report=await notifyIndexNow({
    key:origin.group?.indexNowKey,changedFiles,frontdoorPinChanged,
    sourceCommit:process.env.GITHUB_SHA
  });
  await mkdir("observations",{recursive:true});
  await writeFile("observations/561.group-indexnow-notification.json",
    JSON.stringify(report,null,2)+"\n");
  // Search-engine receiving is an optional downstream observation. Do not
  // turn a 403/429 from IndexNow into a false failed *site deployment*.
  const sign=report.status==="submitted"||report.status==="key-validation-pending"
    ?"notice":"warning";
  process.stdout.write(JSON.stringify({status:report.status,
    urls:report.urlList.length,http:report.providerHttp,
    indexingVerified:false,sourceCommit:report.sourceCommit})+"\n");
  if(!["submitted","key-validation-pending","no-public-page-change"].includes(report.status))
    process.stdout.write("::"+sign+"::IndexNow notification incomplete: "+report.reason+"\n");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  await main();
