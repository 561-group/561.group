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

test("a production deploy has a main-ref and predeploy safety boundary",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  assert.match(workflow,/if:\s*github\.ref == 'refs\/heads\/main'/u,
    "a manual dispatch on another ref must never deploy the apex");
  const publish=workflow.indexOf("cloudflare/wrangler-action");
  assert.ok(publish>0,"the existing provider deployment must remain explicit");
  const before=workflow.slice(0,publish);
  const legacyInterlock=/Refuse unqualified standalone deployment/u.test(before) &&
    /exit 1/u.test(before);
  const qualifiedRelease=/test -s package-lock\.json/u.test(before) &&
    /npm ci --omit=optional --ignore-scripts/u.test(before) &&
    /npm run check/u.test(before) && /npm test/u.test(before) &&
    /npm run build/u.test(before) && /source-revision\.json/u.test(before);
  assert.ok(legacyInterlock||qualifiedRelease,
    "production needs a fail-closed legacy interlock or an exact-source build, test and receipt before Wrangler");
});

test("ordinary buyer and supplier opportunities use the same private intake without becoming orders",()=>{
  const page=read("public/contact/index.html");
  assert.match(page, /<h2 id="work">Request paid work or offer to supply it<\/h2>/u);
  assert.match(page, /<option>Paid service inquiry<\/option>/u);
  assert.match(page, /<option>Supplier or subcontractor offer<\/option>/u);
  assert.match(page, /name="budget"/u);
  assert.match(page, /name="timing"/u);
  assert.match(page, /name="reply-channel"/u);
  assert.match(page, /\[561 Group sales inquiry\] Request a scope and quote/u);
  assert.match(page, /\[561 Group procurement\] Supplier capacity proposal/u);
  assert.match(page, /const body = fields\.map/u);
  assert.match(page, /const base = `mailto:emsenn@561\.group\?subject=/u);
  assert.match(page, /does not create a purchase, authorize outside contact, assign a job, or record revenue/u);
  assert.match(page, /No GitHub account is needed/u);
});

test("production deployment consumes the exact dependency lock before provider writes",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  const provider=workflow.indexOf("cloudflare/wrangler-action");
  assert.ok(provider>0,"the existing provider must be identifiable");
  const before=workflow.slice(0,provider);
  assert.match(before,/test -s package-lock\.json/u,"absence of the native lock must refuse publication");
  assert.match(before,/npm ci --omit=optional --ignore-scripts/u,"production must use a frozen edge-only npm install");
  assert.doesNotMatch(before,/npm install --ignore-scripts/u,"unlocked npm install is not a release");
  for(const command of ["npm run check","npm test","npm run build","public/source-revision.json"]){
    assert.ok(before.includes(command),"native build/receipt is required before Wrangler: "+command);
  }
});
