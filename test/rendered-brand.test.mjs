import test from "node:test";
import assert from "node:assert/strict";
import {qualifyRenderedBrand} from "../scripts/assay-rendered-brand.mjs";

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
