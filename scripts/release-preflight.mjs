#!/usr/bin/env node
// This is a local/manual release guard for the ONE original 561.group Worker.
// It never deploys or invents a provider receipt. A successful local CLI exit
// is not production acceptance; the separate Cloudflare/public readback remains.
import {readFile,stat} from "node:fs/promises";
import {execFileSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const SHA=/^[a-f0-9]{40}$/iu;
const required=[
  "public/estate-records.json",
  "public/contact/index.html",
  "public/llms.txt",
  "public/llms-full.txt",
  "public/sitemap.xml",
  "public/robots.txt",
  "public/zh-hans/index.html",
  "public/lkt/index.html"
];

export function qualifyRelease({mainBranch,sourceSha,checkoutSha,receipt,
  lockPresent,dependenciesInstalled,requiredAssets,duplicateIndex}){
  if(mainBranch!=="main")throw new Error("Only the original main branch may be released");
  if(!SHA.test(sourceSha??"")||!SHA.test(checkoutSha??"")||
     sourceSha.toLowerCase()!==checkoutSha.toLowerCase())
    throw new Error("Release must name the exact checked-out source commit");
  if(receipt?.repository!=="561-group/561.group"||
     receipt?.origin!=="https://561.group"||
     receipt?.renderer!=="TUFTE"||
     receipt?.application!=="LivingWebServer"||
     receipt?.sourceCommit?.toLowerCase()!==sourceSha.toLowerCase())
    throw new Error("Generated site does not belong to this original source commit");
  if(!lockPresent)throw new Error("No committed immutable dependency lock is available");
  if(!dependenciesInstalled)throw new Error("Actual LivingWebServer Fetch package is not installed");
  if(duplicateIndex)throw new Error("An obsolete static English root conflicts with TUFTE");
  if(!Array.isArray(requiredAssets)||requiredAssets.length!==required.length||
     requiredAssets.some(p=>!required.includes(p)))
    throw new Error("Not all original publication assets have been qualified");
  return Object.freeze({schema:"561.group.preflight/v1",sourceCommit:sourceSha,
    application:"LivingWebServer",renderer:"TUFTE",providerDeployed:false,
    independentlyAccepted:false});
}
const missing=async path=>{try{await stat(path);return false;}catch(error){
  if(error.code==="ENOENT")return true;throw error;
}};
async function main(){
  const run=(...args)=>execFileSync("git",args,{encoding:"utf8"}).trim();
  const mainBranch=run("branch","--show-current");
  const checkoutSha=run("rev-parse","HEAD");
  const sourceSha=process.env.GITHUB_SHA;
  const receipt=JSON.parse(await readFile("public/source-revision.json","utf8"));
  const lockPresent=!(await missing("package-lock.json"));
  let dependenciesInstalled=false;
  try{
    const installed=JSON.parse(await readFile("node_modules/@red-cup-engineering/living-web-server/package.json","utf8"));
    dependenciesInstalled=Boolean(installed.exports?.["./fetch"]);
  }catch(error){if(error.code!=="ENOENT")throw error;}
  const requiredAssets=[];
  for(const path of required)if(!(await missing(path))&&(await stat(path)).size>50)requiredAssets.push(path);
  const receiptOf=qualifyRelease({mainBranch,sourceSha,checkoutSha,receipt,
    lockPresent,dependenciesInstalled,requiredAssets,
    duplicateIndex:!(await missing("public/index.html"))});
  console.log("Original public source preflight "+receiptOf.sourceCommit+
    "; provider deployment and independent reader acceptance NOT claimed");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
