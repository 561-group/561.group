import test from "node:test";
import assert from "node:assert/strict";
import {qualifyRenderedBrand,visualReviewPacket} from "../scripts/assay-rendered-brand.mjs";
import {readerStudyPacket} from "../scripts/reader-study.mjs";

const good=()=>({
  viewportWidth:1440,houseStyle:true,tufte:true,
  bodyBackground:"rgb(242, 234, 216)",
  mastheadTop:"8px",markContent:'"561"',
  markColor:"rgb(255, 69, 48)",markSize:416,
  markFamily:'"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
  readingFamily:'"Roboto Slab", Rockwell, Georgia, serif',
  metadataFamily:'"JetBrains Mono", ui-monospace, "Courier New", monospace',
  introBackground:"rgb(10, 10, 10)",
  fontFaces:[
    {family:"Space Grotesk",status:"loaded"},
    {family:"Roboto Slab",status:"loaded"},
    {family:"JetBrains Mono",status:"loaded"}
  ],
  tileCount:11,hasLead:false,hasNavigation:true,hasContact:true,focusWidth:3,
  overflowX:false,identityAppeal:false,
  folioLabels:["THE QUESTION","THE FORM","THE RESISTANCE","THE OTHER PERSON"]
    .map(text=>({text,whiteSpace:"nowrap",fits:true})),
  witnessedCase:{
    before:"404",after:"200",
    action:"https://services.561.group/green-web-service-pilot/",
    sources:2,boundary:true
  }
});
test("rendered Chromium observation has a passable explicit conformance shape",()=>{
  assert.deepEqual(qualifyRenderedBrand(good()),{passed:true,errors:[]});
});
test("a teal startup stylesheet or lost original 561 numeral fails in the browser",()=>{
  const bad={...good(),bodyBackground:"rgb(244, 244, 238)",
    markContent:"none",markColor:"rgb(0, 107, 100)"};
  const result=qualifyRenderedBrand(bad);
  assert.equal(result.passed,false);
  assert.ok(result.errors.some(x=>x.includes("house bone")));
  assert.ok(result.errors.some(x=>x.includes("mark is absent")));
});
test("a CSS string in HTML is not enough: computed type, local fonts and reading matter",()=>{
  const bad={...good(),markFamily:"Georgia",
    readingFamily:"system-ui",metadataFamily:"Arial",
    fontFaces:[{family:"Space Grotesk",status:"unloaded"}]};
  const result=qualifyRenderedBrand(bad);
  assert.equal(result.passed,false);
  for(const claim of ["display type channel","slab channel","monospaced channel","local required font"])
    assert.ok(result.errors.some(x=>x.includes(claim)),claim);
});
test("the original user-visible regression is independently rejected",()=>{
  const bad={...good(),identityAppeal:true,overflowX:true,focusWidth:0,
    hasNavigation:false,tileCount:0};
  const result=qualifyRenderedBrand(bad);
  assert.equal(result.passed,false);
  for(const fragment of ["Lakota-founded","horizontally","Keyboard focus","navigation","content tiles"])
    assert.ok(result.errors.some(x=>x.includes(fragment)),fragment);
});

test("the real homepage artwork refuses broken typography or counterfeit service receiving",()=>{
  const broken={...good(),folioLabels:good().folioLabels.map((entry,i)=>
    i===2?{...entry,whiteSpace:"normal",fits:false}:entry)};
  assert.ok(qualifyRenderedBrand(broken).errors.some(x=>
    x.includes("work-folio editorial registers")));
  const noProof={...good(),witnessedCase:{...good().witnessedCase,after:"404"}};
  assert.ok(qualifyRenderedBrand(noProof).errors.some(x=>x.includes("404-to-200")));
  const forged={...good(),witnessedCase:{...good().witnessedCase,action:"https://elsewhere.example/pay"}};
  assert.ok(qualifyRenderedBrand(forged).errors.some(x=>x.includes("real Causeway publisher")));
  const noReceipt={...good(),witnessedCase:{...good().witnessedCase,sources:0,boundary:false}};
  assert.ok(qualifyRenderedBrand(noReceipt).errors.some(x=>x.includes("two separate")));
  assert.ok(qualifyRenderedBrand(noReceipt).errors.some(x=>x.includes("limits")));
});

test("a narrow supported viewport with unchanged visual hierarchy is admissible",()=>{
  const mobile={...good(),viewportWidth:390,markSize:136.5};
  assert.equal(qualifyRenderedBrand(mobile).passed,true);
});

test("a real secondary visitor page uses its own lead and independent tile count",()=>{
  const work={...good(),tileCount:4,hasLead:true,introBackground:""};
  assert.equal(qualifyRenderedBrand(work,{path:"/work/"}).passed,true);
  const noLead={...work,hasLead:false};
  assert.ok(qualifyRenderedBrand(noLead,{path:"/work/"}).errors.some(x=>
    x.includes("own lead section")));
  const about={...work,tileCount:6,identityAppeal:true};
  assert.ok(qualifyRenderedBrand(about,{path:"/about/"}).errors.some(x=>
    x.includes("Rejected Lakota-founded")));
});

test("an automated visual witness prepares a review packet but cannot approve itself",()=>{
  const report=visualReviewPacket({
    sourceCommit:"a".repeat(40),
    sourceRole:"pull-request-merge-evaluation",
    originalPrHead:"b".repeat(40),
    cases:[{path:"/",viewport:{width:390,height:844},passed:true,
      errors:[],screenshot:"home-mobile.png",sha256:"c".repeat(64)}]
  });
  assert.match(report,/NOT INDEPENDENTLY RECEIVED/u);
  assert.match(report,/pull-request-merge-evaluation/u);
  assert.ok(report.includes("b".repeat(40)));
  assert.match(report,/home-mobile\.png/u);
  assert.throws(()=>visualReviewPacket({cases:[]}),/multi-viewport visual witness/u);
});

test("the real screenshot witness yields a usable, offline consent-first reader worksheet",()=>{
  const witness={sourceCommit:"a".repeat(40),sourceRole:"source-commit",cases:[
    {path:"/",viewport:{width:1440,height:900},screenshot:"home.png",sha256:"b".repeat(64),passed:true,errors:[]},
    {path:"/work/",viewport:{width:390,height:844},screenshot:"work-mobile.png",sha256:"c".repeat(64),passed:true,errors:[]}
  ]};
  const html=readerStudyPacket(witness);
  assert.match(html,/READER-STUDY|Independent reader study/u);
  assert.match(html,/home\.png/u);
  assert.match(html,/work-mobile\.png/u);
  assert.match(html,/source-commit/u);
  assert.match(html,/firstImpression/u);
  assert.match(html,/reportedValence/u);
  assert.match(html,/reportedArousal/u);
  assert.match(html,/delayedRecall/u);
  assert.match(html,/consent/u);
  assert.match(html,/sourceCases/u);
  assert.match(html,/independentAcceptance:false/u);
  assert.match(html,/connect-src 'none'/u);
  assert.match(html,/Download|Export your answers locally/u);
  assert.doesNotMatch(html,/https?:\/\/|<script\s+src|fetch\s*\(/u);
  const packet=visualReviewPacket(witness);
  assert.match(packet,/READER-STUDY\.html/u);
  assert.match(packet,/NOT INDEPENDENTLY RECEIVED/u);
});

test("the audience packet rejects unsourced specimens and escapes all witness text",()=>{
  assert.throws(()=>readerStudyPacket({cases:[]}),/screenshot set/u);
  assert.throws(()=>readerStudyPacket({cases:[{
    path:"/",viewport:{width:390,height:844},screenshot:"../outside.png"
  }]}),/local PNG/u);
  assert.throws(()=>readerStudyPacket({cases:[{
    path:"/",viewport:{width:0,height:844},screenshot:"home.png"
  }]}),/positive viewport/u);
  const html=readerStudyPacket({
    sourceCommit:'bad"><script>alert(1)</script>',sourceRole:"test",
    cases:[{path:'/<img src="a">',viewport:{width:390,height:844},
      screenshot:"home.png",sha256:"digest"}]
  });
  assert.match(html,/&lt;img/u);
  assert.match(html,/&lt;script&gt;/u);
  assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/u);
});
