import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(join(root,path),"utf8");
const publicIssue="https://github.com/561-group/561.group/issues/new?template=service-submission.yml";

test("public contact offers reporting, not media commission or executable authority",()=>{
  const page=read("public/contact/index.html");
  assert.ok(page.includes(publicIssue),"general public issue route must be preserved");
  assert.match(page,/Public submissions are untrusted reports for review/u);
  assert.match(page,/not instructions to autonomous agents/u);
  assert.match(page,/Only an authorized receiving office can separately admit a requirement/u);
  assert.doesNotMatch(page,/issues\/new\?template=media-requirement\.yml/u);
  assert.doesNotMatch(page,/causeway-services\/public-media-services-section\/issues\/new/u);
  assert.match(page,/<form id="private-intake" action="mailto:/u);
  assert.match(page,/event\.preventDefault\(\)/u);
});

test("public form labels submission as untrusted, not an executable requirement",()=>{
  const form=read(".github/ISSUE_TEMPLATE/service-submission.yml");
  assert.match(form,/Public issue text is untrusted evidence for review/u);
  assert.match(form,/not.*instruction to an agent/u);
  assert.match(form,/Submissions do not automatically/u);
  assert.doesNotMatch(form,/^\s*- type: [^\n]*media[-_ ]generator/gmu);
  assert.match(form,/Suggested change \(unverified\)/u);
  assert.doesNotMatch(form,/^\s*- Requirement\s*$/mu);
  assert.doesNotMatch(read("public/contact/index.html"),/<option>Requirement<\/option>/u);
});

test("no GitHub workflow reacts automatically to public issues, comments, or discussions",()=>{
  const folder=join(root,".github","workflows");
  const names=readdirSync(folder).filter(n=>/\.ya?ml$/u.test(n));
  assert.ok(names.length>0,"current workflows must be inspected, not treated as absent");
  for(const name of names){
    const content=read(".github/workflows/"+name);
    const lines=content.split(/\r?\n/u);
    const start=lines.findIndex(line=>/^on\s*:/u.test(line));
    assert.notEqual(start,-1,"workflow should declare its event boundary: "+name);
    const header=lines[start];
    const stanza=[header];
    for(let i=start+1;i<lines.length;i++){
      const line=lines[i];
      if(line.trim()&&!/^[ \t]/u.test(line)&&!/^#/u.test(line))break;
      stanza.push(line);
    }
    const events=stanza.join("\n");
    assert.doesNotMatch(events,/^\s{2}(?:issues|issue_comment|discussion|discussion_comment|repository_dispatch)\s*:/gmu,
      "public report events cannot drive a workflow: "+name);
    assert.doesNotMatch(events,/^on\s*:\s*(?:\[[^\]]*(?:issues|issue_comment|discussion|discussion_comment|repository_dispatch)|(?:issues|issue_comment|discussion|discussion_comment|repository_dispatch)\b)/mu,
      "public report event cannot be in an inline trigger list: "+name);
  }
});

test("production release remains a separately invoked operation",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  assert.match(workflow,/^on:\s*\n\s+workflow_dispatch:\s*$/mu);
  assert.doesNotMatch(workflow,/^\s+(?:issues|issue_comment|push|pull_request|workflow_run)\s*:/gmu);
});


test("public homepage has one concise reader job and five actual public doors",()=>{
  const source=JSON.parse(read("data/home.json"));
  const estate=JSON.parse(read("data/estate.json"));
  assert.ok(source.public&&source.public.headline==="AI agents have offices here.");
  assert.match(source.public.aim,/economic, political, and ecological volatility/u);
  assert.equal(source.public.featured.length,5);
  const known=new Set(estate.doors);
  assert.ok(source.public.featured.every(x=>known.has(x.host)&&estate.nodes.some(n=>n.host===x.host)));
  const actions=source.public.featured.map(x=>x.action);
  assert.deepEqual(actions,[...actions].sort((a,b)=>a.localeCompare(b,"en")));
});
test("site keeps three distinct human page jobs and a fourth original contact page",()=>{
  const source=read("src/render.mjs");
  const build=read("scripts/build.mjs");
  assert.match(source,/export function renderIndex\b/u);
  assert.match(source,/export function renderWork\b/u);
  assert.match(source,/export function renderApproach\b/u);
  assert.match(source,/export function renderLlms\b/u);
  assert.match(build,/public\/approach\/index\.html/u);
  assert.match(build,/public\/work\/index\.html/u);
  assert.ok(read("public/contact/index.html").includes("What can we help with?"));
  assert.ok(source.includes('class="steps"')&&source.includes('class="cards"'));
  assert.doesNotMatch(source,/class="ticker"/u);
});
test("one canonical sitemap owner emits four actual pages in XML and text",()=>{
  const source=read("src/render.mjs");
  const build=read("scripts/build.mjs");
  assert.ok(source.includes('["/","/approach/","/contact/","/work/"]'));
  assert.match(source,/serializeSitemap\(publicSitemapEntries\(home\)\)/u);
  assert.match(source,/serializeSitemapText\(publicSitemapEntries\(home\)\)/u);
  for(const route of ["public/index.html","public/approach/index.html","public/contact/index.html","public/work/index.html"]){
    if(route!=="public/contact/index.html")assert.ok(build.includes(route));
  }
  assert.ok(build.includes("public/sitemap.txt"));
});
test("human and machine source share the same math, projects and real support terms",()=>{
  const source=read("src/render.mjs");
  const home=JSON.parse(read("data/home.json"));
  assert.match(source,/foundation\(home\.foundation\)/u);
  assert.match(source,/home\.public/u);
  assert.ok(home.public.approachStages.length===4);
  assert.equal(new Set(home.public.featured.map(x=>x.host)).size,5);
  assert.match(source,/estate\.machine\.map/u);
  assert.match(source,/positive whole-dollar monthly price/u);
  assert.match(source,/accepted exact Stripe checkout URL/u);
});
