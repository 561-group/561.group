#!/usr/bin/env node
// Browser-level receiving candidate for the ORIGINAL 561.group LivingWebServer
// TUFTE projection. Screenshots are review evidence, NOT accepted golden masters.
import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {create561GroupLivingApplication} from "../src/living-home.mjs";

const readJson=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const pages=Object.freeze([
  {name:"home",path:"/",width:1440,height:900},
  {name:"home-mobile",path:"/",width:390,height:844},
  {name:"work-mobile",path:"/work/",width:390,height:844},
  {name:"about",path:"/about/",width:1440,height:900}
]);
const expectedFontNames=["Space Grotesk","Roboto Slab","JetBrains Mono"];
const FONT_ROUTE=new Map([
  ["/fonts/space-grotesk.woff2","space-grotesk.woff2"],
  ["/fonts/roboto-slab.woff2","roboto-slab.woff2"],
  ["/fonts/jetbrains-mono.woff2","jetbrains-mono.woff2"]
]);
const rgb=(r,g,b)=>"rgb("+[r,g,b].join(", ")+")";

export function qualifyRenderedBrand(value) {
  const errors=[];
  const need=(truth,claim)=>{if(!truth)errors.push(claim)};
  need(value?.houseStyle===true,"Original Group CSS not emitted into real TUFTE head");
  need(value?.tufte===true,"Real TUFTE shell is absent");
  need(value?.bodyBackground===rgb(242,234,216),"Visible body background lost house bone");
  need(value?.mastheadTop==="8px","Institutional masthead lost eight-pixel ink rule");
  need(value?.markContent==='"561"', "Giant original typographic 561 mark is absent");
  need(value?.markColor===rgb(255,69,48),"561 mark lost reserved alarm-red role");
  need(value?.markSize>=105,"561 mark is no longer large enough to carry hierarchy");
  need(value?.markFamily?.includes("Space Grotesk"),"561 mark lost display type channel");
  need(value?.readingFamily?.includes("Roboto Slab"),"Main reading type lost slab channel");
  need(value?.metadataFamily?.includes("JetBrains Mono"),"Evidence labels lost monospaced channel");
  need(value?.fontFaces?.every(x=>x.status==="loaded") &&
       expectedFontNames.every(name=>value.fontFaces.some(x=>x.family===name)),
       "A local required font was not loaded");
  need(value?.introBackground===rgb(10,10,10),"Introduction lost black-ink mass");
  need(value?.tileCount>=5,"A real public visitor route lost its content tiles");
  need(value?.hasNavigation===true,"Useful public navigation disappeared");
  need(value?.hasContact===true,"An actual contact pathway disappeared");
  need(value?.focusWidth>=3,"Keyboard focus has no sufficiently visible outline");
  need(value?.overflowX===false,"Layout overflows viewport horizontally");
  need(value?.identityAppeal===false,"Rejected Lakota-founded appeal is visible again");
  need(value?.viewportWidth>=320,"Visual assay viewport is not a supported width");
  return Object.freeze({passed:errors.length===0,errors});
}

async function servedOriginalApplication() {
  const [home,estate,frontdoor]=await Promise.all([
    readJson("data/home.json"),readJson("data/estate.json"),readJson("data/frontdoor.json")
  ]);
  const application=create561GroupLivingApplication({
    readHome:async()=>home,readEstate:async()=>estate,readFrontdoor:async()=>frontdoor,
    releaseHome:home
  });
  const server=createServer(async(req,res)=>{
    try{
      const pathname=new URL(req.url??"/","http://127.0.0.1").pathname;
      if(FONT_ROUTE.has(pathname)){
        const bytes=await readFile(new URL("../public/fonts/"+FONT_ROUTE.get(pathname),import.meta.url));
        res.writeHead(200,{"content-type":"font/woff2","cache-control":"no-store"});
        res.end(bytes);return;
      }
      if(!["/","/work/","/about/"].includes(pathname)||req.method!=="GET"){
        res.writeHead(404);res.end();return;
      }
      // Same original application as src/worker.mjs, with canonical Request
      // identity. This browser host is only a test adapter, not a new publisher.
      const original=new Request("https://561.group"+pathname,{
        headers:{accept:"text/html"}
      });
      const received=await application.fetch(original);
      const bytes=Buffer.from(await received.arrayBuffer());
      res.writeHead(received.status,{"content-type":received.headers.get("content-type")??"text/plain",
        "cache-control":"no-store"});
      res.end(bytes);
    }catch(error){
      res.writeHead(500,{"content-type":"text/plain"});
      res.end("Original TUFTE projection refused in browser assay");
      console.error("assay host:",error?.message??String(error));
    }
  });
  await new Promise((resolve,reject)=>{
    server.once("error",reject);server.listen(0,"127.0.0.1",resolve);
  });
  return{origin:"http://127.0.0.1:"+server.address().port,
    close:()=>new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()))};
}

export async function receiveBrowserVisuals({output="artifacts/brand-visual",sourceCommit=process.env.GITHUB_SHA??null}={}) {
  const {chromium}=await import("playwright");
  const host=await servedOriginalApplication();
  let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?
      {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
    await mkdir(output,{recursive:true});
    const cases=[];
    for(const item of pages){
      const context=await browser.newContext({
        viewport:{width:item.width,height:item.height},deviceScaleFactor:1,
        colorScheme:"light",reducedMotion:"reduce",javaScriptEnabled:false
      });
      try{
        // Avoid third-party network dependencies. Local fonts are from this exact source.
        await context.route("**/*",async route=>{
          const target=new URL(route.request().url());
          if(target.origin===host.origin)await route.continue();
          else await route.abort("blockedbyclient");
        });
        const page=await context.newPage();
        const response=await page.goto(host.origin+item.path,{waitUntil:"networkidle"});
        if(!response || response.status()!==200 ||
          !(response.headers()["content-type"]??"").includes("text/html"))
          throw Error(item.name+" did not render authentic original TUFTE HTML");
        await page.evaluate(()=>document.fonts.ready);
        await page.keyboard.press("Tab");
        const reading=await page.evaluate(()=>{
          const el=(sel)=>document.querySelector(sel);
          const style=(sel,pseudo)=>getComputedStyle(el(sel),pseudo);
          const pseudo=style(".tufte-masthead","::before");
          const root=el("html"),active=document.activeElement;
          const intro=el("#introduction");
          const meta=el(".tufte-eyebrow");
          const tileElements=[...document.querySelectorAll(".tufte-grid>.tufte-tile")];
          const focusWidth=active?parseFloat(getComputedStyle(active).outlineWidth):0;
          return{
            viewportWidth:innerWidth,bodyBackground:style("body").backgroundColor,
            mastheadTop:style(".tufte-masthead").borderTopWidth,
            markContent:pseudo.content,markColor:pseudo.color,markSize:parseFloat(pseudo.fontSize),
            markFamily:pseudo.fontFamily,
            readingFamily:style(".tufte-tile-body").fontFamily,
            metadataFamily:meta?getComputedStyle(meta).fontFamily:style(".tufte-eyebrow").fontFamily,
            introBackground:intro?getComputedStyle(intro).backgroundColor:"",
            houseStyle:!!el('style[data-561-house="visual-design-bible-v0.4-candidate"]'),
            tufte:!!el(".tufte-shell[data-tufte]"),
            tileCount:tileElements.length,
            hasNavigation:!!el("[data-tufte-navigation] a"),
            hasContact:!![...document.querySelectorAll("a")].find(a=>a.getAttribute("href")==="/contact/"),
            focusWidth:Number.isFinite(focusWidth)?focusWidth:0,
            overflowX:root.scrollWidth>innerWidth+1,
            identityAppeal:/Lakota-founded/i.test(document.body.innerText),
            fontFaces:[...document.fonts].map(f=>({family:f.family,status:f.status})),
            title:document.title
          };
        });
        const result=qualifyRenderedBrand(reading);
        const screenshot=join(output,item.name+".png");
        await page.screenshot({path:screenshot,fullPage:true,animations:"disabled"});
        const hash=createHash("sha256").update(await readFile(screenshot)).digest("hex");
        cases.push({name:item.name,path:item.path,viewport:{width:item.width,height:item.height},
          ...result,reading,screenshot:item.name+".png",sha256:hash});
      }finally{await context.close()}
    }
    const witness={
      schema:"561.group/rendered-visual-witness/v1",
      sourceCommit,kind:"actual-original-LivingWebServer-TUFTE-in-headless-Chromium",
      houseSource:"data/brand-source.json",
      acceptance:"CANDIDATE: machine browser conformance; golden-baseline and independent human approval NOT established",
      playwrightVersion:"1.62.1",recordedAt:new Date().toISOString(),cases
    };
    await writeFile(join(output,"witness.json"),JSON.stringify(witness,null,2)+"\n");
    const failing=cases.filter(x=>!x.passed);
    if(failing.length)throw Error("Rendered brand did not conform: "+
      failing.map(x=>x.name+": "+x.errors.join("; ")).join(" | "));
    console.log(JSON.stringify({result:"browser-style-conformant",cases:cases.length,
      screenshots:cases.map(x=>x.screenshot),independentHumanAccepted:false}));
    return witness;
  }finally{await browser?.close();await host.close()}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  await receiveBrowserVisuals();
}
