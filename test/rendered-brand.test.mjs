import test from "node:test";
import assert from "node:assert/strict";
import {qualifyRenderedBrand,visualReviewPacket} from "../scripts/assay-rendered-brand.mjs";

const good=()=>({
  viewportWidth:1440,houseStyle:true,tufte:true,
  bodyBackground:"rgb(242, 234, 216)",
  mastheadTop:"1px",markContent:'"561"',markBracket:"8px",
  markColor:"rgb(10, 10, 10)",markSize:76,
  markFamily:'"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
  readingFamily:'"Roboto Slab", Rockwell, Georgia, serif',
  metadataFamily:'"JetBrains Mono", ui-monospace, "Courier New", monospace',
  introBackground:"rgba(0, 0, 0, 0)",heroSize:49.6,
  mainTileIds:["introduction","paths","companies","explore","contact"],
  companyCount:4,pathCount:4,ordinaryActionColor:"rgb(10, 10, 10)",
  introActionTextColor:"rgb(242, 234, 216)",contactWidthRatio:1,
  prohibitedTopicLabels:false,
  fontFaces:[
    {family:"Space Grotesk",status:"loaded"},
    {family:"Roboto Slab",status:"loaded"},
    {family:"JetBrains Mono",status:"loaded"}
  ],
  tileCount:11,hasLead:false,hasNavigation:true,hasContact:true,focusWidth:3,
  overflowX:false,identityAppeal:false
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
test("the browser refuses the giant red mark, red general-purpose action and billboard introduction",()=>{
  const old={...good(),markSize:416,markColor:"rgb(255, 69, 48)",
    introBackground:"rgb(10, 10, 10)",heroSize:104,
    ordinaryActionColor:"rgb(255, 69, 48)"};
  const x=qualifyRenderedBrand(old);
  assert.equal(x.passed,false);
  for(const term of ["ink-on-bone","oversized","black billboard","giant display","hazard red"])
    assert.ok(x.errors.some(err=>err.includes(term)),term);
});

test("the real user-facing primary CTA and contact must be readable, not dark-on-dark or stranded in a narrow side tile",()=>{
  const unreadable={...good(),introActionTextColor:"rgb(10, 10, 10)"};
  assert.ok(qualifyRenderedBrand(unreadable).errors.some(x=>x.includes("button text is invisible")));
  const cramped={...good(),contactWidthRatio:.32};
  assert.ok(qualifyRenderedBrand(cramped).errors.some(x=>x.includes("crammed")));
});

test("the browser refuses culture-as-homepage-advertising and missing visitor journeys",()=>{
  const x=qualifyRenderedBrand({...good(),mainTileIds:["introduction","frontiers","paths","services","support"],
    prohibitedTopicLabels:true,companyCount:0,pathCount:3});
  assert.equal(x.passed,false);
  assert.ok(x.errors.some(e=>e.includes("topic-of-the-day")));
  assert.ok(x.errors.some(e=>e.includes("Identity labels")));
  assert.ok(x.errors.some(e=>e.includes("accountable companies")));
});

test("phone navigation is balanced, keyboard-reachable and has actual usable touch targets",()=>{
  const mobile={...good(),viewportWidth:390,markSize:43.2,heroSize:32,
    navRowSizes:[3,3],navMinHitHeight:36};
  assert.equal(qualifyRenderedBrand(mobile).passed,true);
  const orphaned={...mobile,navRowSizes:[5,1]};
  assert.ok(qualifyRenderedBrand(orphaned).errors.some(x=>x.includes("orphaned action")));
  const tiny={...mobile,navMinHitHeight:22};
  assert.ok(qualifyRenderedBrand(tiny).errors.some(x=>x.includes("touch targets")));
});

test("a real secondary visitor page uses its own lead and independent tile count",()=>{
  const work={...good(),tileCount:4,hasLead:true,introBackground:"",
    serviceDetails:Array.from({length:8},()=>({hasSummary:true,open:false,hasInquiry:true}))};
  assert.equal(qualifyRenderedBrand(work,{path:"/work/"}).passed,true);
  const expanded={...work,serviceDetails:work.serviceDetails.map((x,i)=>
    i===0?{...x,open:true}:x)};
  assert.ok(qualifyRenderedBrand(expanded,{path:"/work/"}).errors.some(x=>
    x.includes("native compact scanning")));
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
