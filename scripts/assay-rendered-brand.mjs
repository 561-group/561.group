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

export function qualifyRenderedBrand(value,{path="/"}={}) {
  const errors=[];
  const need=(truth,claim)=>{if(!truth)errors.push(claim)};
  need(value?.houseStyle===true,"Original Group CSS not emitted into real TUFTE head");
  need(value?.tufte===true,"Real TUFTE shell is absent");
  need(value?.bodyBackground===rgb(242,234,216),"Visible body background lost house bone");
  need(value?.mastheadTop==="1px","Homepage header lost its quiet rule");
  need(value?.markContent==='"561"', "Original source-owned 561 wordmark is absent");
  need(value?.markColor===rgb(10,10,10),"Original 561 mark must be ink-on-bone, not decorative alarm red");
  need(value?.markSize>=32 && value.markSize<=88,
    "561 mark is oversized or too small for the actual institutional masthead");
  need(value?.markBracket==="8px",
    "Original source-owned 561 mark lost its compact ink bracket rule");
  need(value?.markFamily?.includes("Space Grotesk"),"561 mark lost display type channel");
  need(value?.readingFamily?.includes("Roboto Slab"),"Main reading type lost slab channel");
  need(value?.metadataFamily?.includes("JetBrains Mono"),"Evidence labels lost monospaced channel");
  need(value?.fontFaces?.every(x=>x.status==="loaded") &&
       expectedFontNames.every(name=>value.fontFaces.some(x=>x.family===name)),
       "A local required font was not loaded");
  if(path==="/work/")need(Array.isArray(value?.serviceDetails) &&
    value.serviceDetails.length===8 &&
    value.serviceDetails.every(item=>item.hasSummary && !item.open && item.hasInquiry),
    "Public service entries no longer allow native compact scanning with an immediate lawful inquiry");
  if(path==="/"){
    need(value?.introBackground==="rgba(0, 0, 0, 0)",
      "Homepage introduction reverted to a heavy black billboard");
    need(value?.heroSize>=28 && value.heroSize<=56,
      "Homepage headline is giant display type, not usable institutional hierarchy");
    need(value?.mainTileIds?.join(",")==="introduction,paths,companies,explore,contact",
      "Homepage grew topic-of-the-day cards or lost practical visitor paths");
    need(value?.companyCount===4 && value?.pathCount===4,
      "Homepage lost the accountable companies or useful navigation choices");
    need(value?.ordinaryActionColor===rgb(10,10,10),
      "Ordinary homepage action is using hazard red instead of ink");
    need(value?.introActionTextColor===rgb(242,234,216),
      "Actual primary homepage button text is invisible or lacks source bone contrast");
    need(value?.contactWidthRatio>=0.9,
      "Actual contact region is crammed into a narrow incidental grid column");
    need(value?.prohibitedTopicLabels===false,
      "Identity labels, speculative research or mythopoetry are being promoted on the homepage");
  }
  else need(value?.hasLead===true,"Non-home visitor page lost its own lead section");
  need(value?.tileCount>=(path==="/"?5:3),"A real public visitor route lost its content tiles");
  need(value?.hasNavigation===true,"Useful public navigation disappeared");
  if(value?.viewportWidth<=430){
    need(value?.navRowSizes?.length===2 && value.navRowSizes.every(size=>size===3),
      "Phone navigation has an orphaned action instead of six paths in balanced rows");
    need(value?.navMinHitHeight>=36,
      "Phone navigation touch targets have dropped below their 36px designed hit height");
  }
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
      if(pathname==="/contact/" && req.method==="GET"){
        // Contact is the exact original static asset owned by this Worker,
        // not a second TUFTE projection or a mocked intake implementation.
        const bytes=await readFile(new URL("../public/contact/index.html",import.meta.url));
        res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});
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

/**
 * A candidate reviewer packet; never an automatically accepted golden master.
 */
export function visualReviewPacket(witness){
  if(!witness||!Array.isArray(witness.cases)||!witness.cases.length)
    throw new TypeError("A real multi-viewport visual witness is required");
  return [
    "# 561 Group visual receiving — REVIEW CANDIDATE",
    "",
    "**Status: NOT INDEPENDENTLY RECEIVED.** Screenshots and computed-style tests",
    "do not appoint the builder as a human visual assayer.",
    "",
    "Tested revision: "+(witness.sourceCommit??"unknown")+" ("+
      (witness.sourceRole??"unknown role")+").",
    "Original PR head: "+(witness.originalPrHead??"not applicable")+".",
    "Brand source: data/brand-source.json (v0.3 DTCG).",
    "The illustrated v0.4 Bible remains candidate evidence, not an adopted edition.",
    "",
    "| Route | Viewport | Computed result | Image | SHA-256 |",
    "| --- | --- | --- | --- | --- |",
    ...witness.cases.map(c=>"| "+c.path+" | "+c.viewport.width+"x"+
      c.viewport.height+" | "+(c.passed?"pass":"REFUSED: "+c.errors.join("; "))+ 
      " | ["+c.screenshot+"]("+c.screenshot+") | "+c.sha256+" |"),
    "",
    "## Independent reader/visual-review task",
    "",
    "Inspect each image without treating implementation tickets as evidence",
    "of aesthetic fit. Compare to the approved original Group works and the",
    "source-owned Design Bible:",
    "https://github.com/561-group/561-group-content-design-services-section",
    "Review hierarchy, modest ink numeral, bone/ink, reserved alarm color,",
    "clear paths to services/projects/research, readable company responsibility,",
    "mobile readability, and whether research/culture remains on About rather than the homepage.",
    "The historical v0.3 6% alarm and 3% witness bounding-box color budgets",
    "require a separate measured image proof; CSS declaration is insufficient.",
    "Two additional actual /contact/ screenshots and a native browser interaction",
    "check the public private-email draft for both a normal and CARE-related service.",
    "The source-owned rights scope is disabled when not selected, and the visitor",
    "can change the service without leaking previously entered scoped responses.",
    "This is a technically tested input boundary, NOT community consent or review.",
    "",
    "Keyboard focus and reduced-motion settings were checked, but full WCAG",
    "or screen-reader accessibility audits were not performed by this job.",
    "",
    "Record accept/reject/contested/not-observed for the EXACT SOURCE and",
    "screen specimen with reviewer authority, reasons and original Work",
    "through existing independent receiving. Do not treat this document",
    "or a passing CI as its own independent customer-acceptance record.",
    ""
  ].join("\n");
}


/**
 * Exercise the ACTUAL source-owned, static /contact/ and its existing
 * client-side email draft. A separate Actor's approval or data transfer is
 * never inferred. Test that rights-specific fields are absent from unrelated
 * inquiries, visible when truly selected, and omitted again when deselected.
 */
async function receivePrivateDataIntake(browser,host,output){
  const context=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:1,
    colorScheme:"light",reducedMotion:"reduce",javaScriptEnabled:true
  });
  try{
    await context.route("**/*",async route=>{
      const target=new URL(route.request().url());
      if(target.origin===host.origin)await route.continue();
      else await route.abort("blockedbyclient");
    });
    const page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    const general=await page.goto(host.origin+
      "/contact/?service=Research%20and%20formal%20methods",{waitUntil:"networkidle"});
    if(!general || general.status()!==200)
      throw Error("Original public static contact route failed");
    const scope=page.locator("#data-stewardship-scope");
    const inactive=await scope.evaluate(node=>({
      hidden:node.hidden,disabled:node.disabled,
      visiblyHidden:getComputedStyle(node).display==="none"
    }));
    if(!inactive.hidden || !inactive.disabled || !inactive.visiblyHidden)
      throw Error("Unrelated service inquiry exposed protected-data scope: "+JSON.stringify(inactive));
    const contactOrder=await page.evaluate(()=>({
      formY:document.querySelector("#private-intake")?.getBoundingClientRect().top+scrollY,
      alternativesY:document.querySelector("#other-contact-options")?.getBoundingClientRect().top+scrollY,
      optionCount:document.querySelectorAll(".contact-option").length,
      optionsAllClosed:[...document.querySelectorAll(".contact-option")].every(node=>!node.open),
      servicePrefill:document.querySelector("#affected")?.value
    }));
    if(!Number.isFinite(contactOrder.formY) || contactOrder.formY>850 ||
       contactOrder.formY>=contactOrder.alternativesY ||
       contactOrder.optionCount!==4 || !contactOrder.optionsAllClosed ||
       contactOrder.servicePrefill!=="Research and formal methods")
      throw Error("Actual contact inquiry remains buried under procedural guidance: "+JSON.stringify(contactOrder));
    const other=page.locator(".contact-option").first(),opener=other.locator("summary");
    await opener.click();
    if(!await other.evaluate(node=>node.open))
      throw Error("Native alternative contact channels cannot open");
    await opener.click();
    if(await other.evaluate(node=>node.open))
      throw Error("Native alternative contact channels cannot close");
    const genericPath=join(output,"contact-mobile.png");
    await page.screenshot({path:genericPath,fullPage:true,animations:"disabled"});
    const rights=await page.goto(host.origin+
      "/contact/?service=Data%20rights%20and%20stewardship",{waitUntil:"networkidle"});
    const active=await scope.evaluate(node=>({
      hidden:node.hidden,disabled:node.disabled,
      visiblyHidden:getComputedStyle(node).display==="none"
    }));
    if(!rights || rights.status()!==200 || active.hidden || active.disabled ||
       active.visiblyHidden)
      throw Error("Original CARE-related service source did not activate the rights gate: "+JSON.stringify(active));
    if(await page.locator("#reply-permission").inputValue()!=="not-specified" ||
       await page.locator("#submission-type").inputValue()!=="Paid service inquiry" ||
       await page.locator("#affected").inputValue()!=="Data rights and stewardship")
      throw Error("CARE service route silently granted a reply or order permission");
    await page.evaluate(()=>document.fonts.ready);
    const screen=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      gateVisible:!!document.querySelector("#data-stewardship-scope")?.getClientRects().length,
      heading:document.querySelector("h1")?.textContent?.trim(),
      hasPrimaryNav:!!document.querySelector('nav[aria-label="Primary"]'),
      externalForms:[...document.querySelectorAll("form")].filter(form=>
        !form.getAttribute("action")?.startsWith("mailto:")).length
    }));
    if(screen.overflow || !screen.gateVisible || !screen.hasPrimaryNav ||
       screen.externalForms!==0 || screen.heading!=="What needs attention?")
      throw Error("Actual private data service route lost coherent usable intake or privacy");
    const sourceScreenshot=join(output,"contact-data-stewardship-mobile.png");
    await page.screenshot({path:sourceScreenshot,fullPage:true,animations:"disabled"});
    const hash=async path=>createHash("sha256").update(await readFile(path)).digest("hex");
    const screenshotDigest=await hash(sourceScreenshot),genericDigest=await hash(genericPath);
    await page.locator("#need").fill("Discuss a rights review. No source records enclosed.");
    await page.locator("#data-authority").fill("REVIEW-PENDING-ROLE-NOT-A-PERSON");
    await page.locator("#data-benefit").fill("COMMUNITY-BENEFIT-UNASSESSED");
    await page.locator("#data-refusal").fill("PERMISSIONS-UNVERIFIED");
    await page.locator("#data-responsibility").fill("FUTURE-USE-NOT-APPROVED");
    await page.locator('button[type="submit"]').click();
    if(!await page.locator("#email-draft").isVisible())
      throw Error("Private data inquiry failed to produce the visitor-owned email draft");
    const rightsDraft=await page.locator("#email-text").inputValue();
    for(const text of ["REVIEW-PENDING-ROLE-NOT-A-PERSON",
      "COMMUNITY-BENEFIT-UNASSESSED","PERMISSIONS-UNVERIFIED",
      "FUTURE-USE-NOT-APPROVED","not-specified"]){
      if(!rightsDraft.includes(text))
        throw Error("Private scoped rights draft omitted necessary context: "+text);
    }
    if(await page.locator("#copy-email").isHidden() &&
       (await page.locator("#open-email").getAttribute("href"))?.startsWith("http"))
      throw Error("Private draft unexpectedly sends the data to a server");
    // Changing only the service restores the default: hidden, disabled, and
    // omitted from the email draft, even if it was filled earlier.
    await page.locator("#affected").fill("Research and formal methods");
    const withdrawn=await scope.evaluate(node=>({
      hidden:node.hidden,disabled:node.disabled,
      visiblyHidden:getComputedStyle(node).display==="none"
    }));
    if(!withdrawn.hidden || !withdrawn.disabled || !withdrawn.visiblyHidden)
      throw Error("A changed service cannot remove the rights-specific collection: "+JSON.stringify(withdrawn));
    await page.locator('button[type="submit"]').click();
    const genericDraft=await page.locator("#email-text").inputValue();
    for(const marker of ["REVIEW-PENDING-ROLE-NOT-A-PERSON",
      "COMMUNITY-BENEFIT-UNASSESSED","PERMISSIONS-UNVERIFIED",
      "FUTURE-USE-NOT-APPROVED"]){
      if(genericDraft.includes(marker))
        throw Error("Private email leaked formerly scoped data into an unrelated inquiry");
    }
    if(errors.length)throw Error("Actual contact script error: "+errors.join("; "));
    return {
      source:"public/contact/index.html",
      result:"source-owned-private-rights-gate-interaction-conformant",
      labels:["contact-mobile.png","contact-data-stewardship-mobile.png"],
      sha256:[genericDigest,screenshotDigest],
      simulatedParticipant:false,contactPermission:false,independentAcceptance:false,
      noPublicPost:true,contactFormY:contactOrder.formY,
      alternateRoutesY:contactOrder.alternativesY,
      nativeRoutesClosed:contactOrder.optionsAllClosed
    };
  }finally{await context.close()}
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
            markBracket:pseudo.borderTopWidth,
            markFamily:pseudo.fontFamily,
            readingFamily:style(".tufte-tile-body").fontFamily,
            metadataFamily:meta?getComputedStyle(meta).fontFamily:style(".tufte-eyebrow").fontFamily,
            introBackground:intro?getComputedStyle(intro).backgroundColor:"",
            heroSize:parseFloat(style(".site-display").fontSize),
            mainTileIds:tileElements.map(tile=>tile.id),
            companyCount:document.querySelectorAll("#companies .site-house-list>li").length,
            pathCount:document.querySelectorAll("#paths .site-card").length,
            ordinaryActionColor:el(".site-action")?getComputedStyle(el(".site-action")).backgroundColor:"",
            introActionTextColor:el("#introduction a.site-action:not(.site-action--quiet)")?
              getComputedStyle(el("#introduction a.site-action:not(.site-action--quiet)")).color:"",
            contactWidthRatio:el("#contact")&&el(".tufte-grid")?
              el("#contact").getBoundingClientRect().width/el(".tufte-grid").getBoundingClientRect().width:0,
            prohibitedTopicLabels:location.pathname==="/" && /Indigenous-grounded|Indigenous data governance|Union of Harmonious Colonies|silica-rich|Artificial Abiogenesis|Jiangshi|SHRIMP/iu.test(document.body.innerText),
            serviceDetails:[...document.querySelectorAll("#services .site-service-detail")].map(node=>({
              hasSummary:!!node.querySelector("summary"),open:node.open,
              hasInquiry:!!node.closest("li.site-service")?.querySelector("a.site-service-inquiry")
            })),

            houseStyle:!!el('style[data-561-house="visual-design-bible-v0.4-candidate"]'),
            tufte:!!el(".tufte-shell[data-tufte]"),
            tileCount:tileElements.length,hasLead:!!el("#lead"),
            hasNavigation:!!el("[data-tufte-navigation] a"),
            navRowSizes:(()=>{
              const tops=[...document.querySelectorAll("[data-tufte-navigation] a")]
                .map(node=>Math.round(node.getBoundingClientRect().top));
              return [...new Set(tops)].map(top=>tops.filter(value=>value===top).length);
            })(),
            navMinHitHeight:Math.min(...[...document.querySelectorAll("[data-tufte-navigation] a")]
              .map(node=>node.getBoundingClientRect().height)),
            hasContact:!![...document.querySelectorAll("a")].find(a=>a.getAttribute("href")==="/contact/"),
            focusWidth:Number.isFinite(focusWidth)?focusWidth:0,
            overflowX:root.scrollWidth>innerWidth+1,
            identityAppeal:/Lakota-founded/i.test(document.body.innerText),
            fontFaces:[...document.fonts].map(f=>({family:f.family,status:f.status})),
            title:document.title
          };
        });
        const result=qualifyRenderedBrand(reading,{path:item.path});
        const screenshot=join(output,item.name+".png");
        // Keep keyboard-focus evidence in the JSON, but collect the visual
        // specimen without the test harness leaving a skip-link focus box.
        await page.evaluate(()=>document.activeElement?.blur());
        await page.screenshot({path:screenshot,fullPage:true,animations:"disabled"});
        const hash=createHash("sha256").update(await readFile(screenshot)).digest("hex");
        if(item.path==="/work/"){
          // A real native HTML control must remain usable without script:
          // the initial screenshot is collapsed so the reader sees all eight
          // services before choosing one, and the viewer can open/close it.
          const first=page.locator("#services .site-service-detail").first();
          const opener=first.locator("summary");
          await opener.click();
          if(!await first.evaluate(node=>node.open))
            throw Error("The original source detail cannot open without JavaScript");
          await opener.click();
          if(await first.evaluate(node=>node.open))
            throw Error("The original source detail cannot close without JavaScript");
        }
        cases.push({name:item.name,path:item.path,viewport:{width:item.width,height:item.height},
          ...result,reading,screenshot:item.name+".png",sha256:hash});
      }finally{await context.close()}
    }
    const sourceRole=process.env.GITHUB_EVENT_NAME==="pull_request"?
      "pull-request-merge-evaluation":"source-commit";
    const originalPrHead=process.env.ORIGINAL_PR_HEAD_SHA??null;
    if(sourceRole==="pull-request-merge-evaluation" &&
      !/^[a-f0-9]{40}$/u.test(originalPrHead??""))
      throw Error("A PR visual witness must distinguish its real head from the evaluated merge ref");
    const contactIntake=await receivePrivateDataIntake(browser,host,output);
    console.log(JSON.stringify({result:contactIntake.result,
      screenshotCount:contactIntake.labels.length,externallyAccepted:false}));
    const witness={
      schema:"561.group/rendered-visual-witness/v1",
      sourceCommit,sourceRole,originalPrHead,
      kind:"actual-original-LivingWebServer-TUFTE-in-headless-Chromium",
      houseSource:"data/brand-source.json",
      acceptance:"CANDIDATE: machine browser conformance; golden-baseline and independent human approval NOT established",
      playwrightVersion:"1.62.1",recordedAt:new Date().toISOString(),cases,
      contactIntake
    };
    await writeFile(join(output,"witness.json"),JSON.stringify(witness,null,2)+"\n");
    await writeFile(join(output,"REVIEW.md"),visualReviewPacket(witness));
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
