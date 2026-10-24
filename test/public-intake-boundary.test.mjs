import test from "node:test";
import {runInNewContext} from "node:vm";
import assert from "node:assert/strict";
import {readFileSync,readdirSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {spawnSync} from "node:child_process";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {bindContent} from "../scripts/bind-content.mjs";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(join(root,path),"utf8");
const publicIssue="https://github.com/561-group/561.group/issues/new?template=service-submission.yml";

test("Group-owned front-door files cannot be silently overwritten from a tracked app source",()=>{
  const scratch=mkdtempSync(join(tmpdir(),"group-source-custody-"));
  const source=join(scratch,"reviewed-group");
  const target=join(scratch,"app");
  const files=[
    "data/home.json","data/estate.json","data/frontdoor.json","data/brand-source.json",
    "locales/en.arb","locales/lkt.arb","locales/zh-Hans.arb",
    "public/contact/index.html","public/favicon.svg","public/logo.png",
  ];
  try{
    mkdirSync(target,{recursive:true});
    for(const file of files){
      const dest=join(source,file);
      mkdirSync(dirname(dest),{recursive:true});
      writeFileSync(dest,"source-owned "+file);
    }
    const git=(...args)=>{
      const result=spawnSync("git",args,{cwd:target,encoding:"utf8"});
      assert.equal(result.status,0,result.stderr);
    };
    git("init","-q");
    const admitted=bindContent(source,target);
    assert.equal(admitted.bound,true);
    assert.equal(readFileSync(join(target,"public/contact/index.html"),"utf8"),
      "source-owned public/contact/index.html");
    // A legacy app PR may still hold an old tracked contact file. Refuse the
    // next bind before destroying that authored evidence or claiming it shipped.
    writeFileSync(join(target,"public/contact/index.html"),"unreceived application change");
    git("add","public/contact/index.html");
    assert.throws(()=>bindContent(source,target),
      /Group-owned content is tracked in the application checkout/u);
    assert.equal(readFileSync(join(target,"public/contact/index.html"),"utf8"),
      "unreceived application change","refusal must happen before any overwrite");
  }finally{rmSync(scratch,{recursive:true,force:true});}
});

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

test("source-qualified service hints prefill only editable fields, never authorization or transmission",()=>{
  const page=read("public/contact/index.html");
  const script=/<script>([\s\S]*?)<\/script>/u.exec(page)?.[1];
  assert.ok(script,"the same original private form owns this source");
  const simulate=search=>{
    const called=[];
    const elements={"submission-type":{value:"Issue"},"affected":{value:""},
      "reply-permission":{value:"not-specified"}};
    const scope={hidden:true,disabled:true};
    const preparedDraft={hidden:true};
    const form={elements,addEventListener:(event,callback)=>called.push([event,callback])};
    const document={getElementById:id=>{
      if(id==="private-intake")return form;
      if(id==="data-stewardship-scope")return scope;
      if(id==="email-draft")return preparedDraft;
      assert.fail("unknown or duplicate intake authority: "+id);
    }};
    runInNewContext(script,{document,location:{search},URLSearchParams},{timeout:1000});
    return {elements,called,scope};
  };
  const actual=simulate("?service="+encodeURIComponent("Research and formal methods"));
  assert.equal(actual.elements["submission-type"].value,"Paid service inquiry");
  assert.equal(actual.elements["reply-permission"].value,"not-specified");
  assert.equal(actual.elements.affected.value,"Research and formal methods");
  assert.equal(actual.scope.disabled,true,"unrelated visitors never supply data-governance assessments");
  assert.equal(actual.scope.hidden,true);
  assert.deepEqual(actual.called.map(([event])=>event),["input","change","submit"]);
  const rights=simulate("?service="+encodeURIComponent("Data rights and stewardship"));
  assert.equal(rights.elements["submission-type"].value,"Paid service inquiry");
  assert.equal(rights.elements["reply-permission"].value,"not-specified");
  assert.equal(rights.scope.disabled,false);
  assert.equal(rights.scope.hidden,false);
  // The visitor can change their mind without leaking formerly relevant fields.
  rights.elements.affected.value="Software and agent engineering";
  rights.called.find(([event])=>event==="input")[1]();
  assert.equal(rights.scope.disabled,true);
  assert.equal(rights.scope.hidden,true);
  rights.elements.affected.value="Data rights and stewardship";
  rights.called.find(([event])=>event==="change")[1]();
  assert.equal(rights.scope.disabled,false);
  rights.elements["submission-type"].value="Idea";
  rights.called.find(([event])=>event==="input")[1]();
  assert.equal(rights.scope.disabled,true,"the service hint is not independent authority to collect data");
  for(const bad of ["","?service=%3Cscript%3E",
      "?service="+encodeURIComponent("x".repeat(150))]){
    const item=simulate(bad);
    assert.equal(item.elements.affected.value,"");
    assert.equal(item.elements["submission-type"].value,"Issue");
    assert.equal(item.elements["reply-permission"].value,"not-specified");
    assert.equal(item.scope.disabled,true);
    assert.deepEqual(item.called.map(([event])=>event),["input","change","submit"]);
  }
  assert.match(page,/Preparing the draft does not send it/u);
  assert.match(page,/we will not treat an inquiry as an order/u);
});

test("sales contact consent is an explicit buyer-owned field, not inferred from a reply address",()=>{
  const page=read("public/contact/index.html");
  const start=page.indexOf('<label for="reply-permission">');
  const end=page.indexOf('<label for="conditions">',start);
  assert.ok(start>0&&end>start,"the existing original form carries explicit reply scope");
  const segment=page.slice(start,end);
  assert.match(segment,/<select id="reply-permission" name="reply-permission">/u);
  const choices=[...segment.matchAll(/<option value="([^"]+)">/gu)].map(match=>match[1]);
  assert.deepEqual(choices,["not-specified","inquiry-only","no-contact"],
    "unknown is the default; no marketing or contact grant is inferred");
  assert.match(segment,/reply about this inquiry only, not marketing/u);
  assert.match(segment,/A reply address alone does not authorize outreach/u);
  assert.match(page,/const body = fields\.map/u,
    "the visitor-reviewed existing private email retains the selected contact scope");
  assert.match(page,/Preparing the draft does not send it/u);
});

test("long private buyer inquiries have a user-activated clipboard fallback without sending",async()=>{
  const page=read("public/contact/index.html");
  const script=/<script>([\s\S]*?)<\/script>/u.exec(page)?.[1];
  assert.ok(script);
  assert.match(page,/<button id="copy-email-body" class="action" type="button">Copy message<\/button>/u);
  assert.match(page,/id="copy-email-status" role="status" aria-live="polite"/u);
  assert.match(page,/button:focus-visible/u);
  const fields=[
    ["submission-type","Paid service inquiry"],
    ["affected","Research and formal methods"],
    ["need","A bounded demonstration. ".repeat(150)],
    ["reply-channel","buyer@example.test"],
    ["reply-permission","inquiry-only"],
  ];
  const nodes={
    "email-subject":{value:""},
    "email-text":{value:"",focus(){this.focused=true;},select(){this.selected=true;}},
    "open-email":{href:"",removeAttribute(name){assert.equal(name,"href");delete this.href;}},
    "copy-email":{hidden:true},
    "email-draft":{hidden:true},
    "copy-email-body":{onclick:null},
    "copy-email-status":{textContent:""},
  };
  const handlers={};
  const form={
    elements:{"submission-type":{value:"Paid service inquiry"},"affected":{value:"Research and formal methods"}},
    addEventListener:(name,fn)=>{handlers[name]=fn;},
    querySelector:selector=>({textContent:selector.match(/label\[for="([^"]+)"\]/u)?.[1]??""}),
  };
  const rightsScope={hidden:false,disabled:false};
  const doc={getElementById:id=>id==="private-intake"?form:
    id==="data-stewardship-scope"?rightsScope:nodes[id]};
  const copied=[];
  const navigator={clipboard:{writeText:async value=>{copied.push(value);}}};
  class FakeFormData {constructor(received){assert.equal(received,form);return fields;}}
  runInNewContext(script,{document:doc,location:{search:""},URLSearchParams,FormData:FakeFormData,navigator},{timeout:1000});
  let prevented=0;
  handlers.submit({preventDefault:()=>{prevented++;}});
  assert.equal(prevented,1);
  assert.equal(nodes["copy-email"].hidden,false,"long mailto body is correctly omitted");
  assert.equal(nodes["email-draft"].hidden,false);
  assert.ok(nodes["open-email"].href.startsWith("mailto:emsenn@561.group?subject="));
  assert.equal(nodes["open-email"].href.includes("&body="),false,
    "no silent truncation or automatic external submission");
  assert.equal(nodes["email-text"].value.includes("reply-permission\ninquiry-only"),true);
  await nodes["copy-email-body"].onclick();
  assert.deepEqual(copied,[nodes["email-text"].value]);
  assert.match(nodes["copy-email-status"].textContent,/send it yourself/u);
  // Re-preparing a visitor draft must invalidate a successful *previous* copy.
  fields[2][1] = "Updated paid inquiry. ".repeat(170);
  handlers.submit({preventDefault() {}});
  assert.equal(nodes["copy-email-status"].textContent, "",
    "newly prepared buyer copy must not inherit an old clipboard success");
  let resolveClipboard;
  navigator.clipboard = {writeText: value => {
    copied.push(value);
    return new Promise(resolve => { resolveClipboard = resolve; });
  }};
  const staleText = nodes["email-text"].value;
  const pendingCopy = nodes["copy-email-body"].onclick();
  fields[2][1] = "Later revised paid inquiry. ".repeat(170);
  handlers.submit({preventDefault() {}});
  assert.notEqual(nodes["email-text"].value, staleText);
  resolveClipboard();
  await pendingCopy;
  assert.equal(nodes["copy-email-status"].textContent, "",
    "a late clipboard completion must not falsely confirm the newer draft");
  navigator.clipboard = {writeText: async value => { copied.push(value); }};
  await nodes["copy-email-body"].onclick();
  assert.equal(copied.at(-1), nodes["email-text"].value,
    "the latest visitor-approved message remains copyable");
  assert.match(nodes["copy-email-status"].textContent, /send it yourself/u);
  // The same guard must refuse a delayed clipboard *error* on an obsolete draft.
  let rejectClipboard;
  navigator.clipboard = {writeText: () => new Promise((_, reject) => { rejectClipboard = reject; })};
  const staleError = nodes["copy-email-body"].onclick();
  fields[2][1] = "Final revised supplier inquiry. ".repeat(170);
  handlers.submit({preventDefault() {}});
  rejectClipboard(new Error("Browser rejected an obsolete clipboard attempt"));
  await staleError;
  assert.equal(nodes["copy-email-status"].textContent, "",
    "an old async rejection must not focus or report fallback for a newer draft");
  delete navigator.clipboard;
  await nodes["copy-email-body"].onclick();
  assert.equal(nodes["email-text"].selected,true,"fallback exposes text for manual copying");
  assert.match(nodes["copy-email-status"].textContent,/manually/u);
  // Buyers using webmail need Copy message even for short mailto drafts.
  fields[2][1]="Short buyer inquiry asking for a bounded quote.";
  navigator.clipboard={writeText:async value=>{copied.push(value);}};
  handlers.submit({preventDefault() {}});
  assert.equal(nodes["copy-email"].hidden,true,
    "a short mailto needs no long-message warning");
  assert.ok(nodes["open-email"].href.includes("&body="),
    "short mailto messages keep their original complete body");
  assert.equal(nodes["email-draft"].hidden,false);
  assert.equal(typeof nodes["copy-email-body"].onclick,"function",
    "the explicit copy control remains available to webmail users");
  await nodes["copy-email-body"].onclick();
  assert.equal(copied.at(-1),nodes["email-text"].value,
    "the short message is copied exactly, with reply scope intact");
  assert.ok(nodes["email-text"].value.includes("reply-permission\ninquiry-only"));
  assert.match(nodes["copy-email-status"].textContent,/send it yourself/u);
  // An edit to the *live form*, including changed consent, invalidates a
  // previously prepared mailto immediately; requiring a second submit is not
  // sufficient because buyers can still click the stale Open email link.
  let resolveStaleCopy;
  navigator.clipboard={writeText:()=>new Promise(resolve=>{resolveStaleCopy=resolve;})};
  const inflight=nodes["copy-email-body"].onclick();
  fields[4][1]="no-contact";
  handlers.change();
  assert.equal(nodes["email-draft"].hidden,true,
    "a revised contact-permission choice must hide the old outbound draft");
  assert.equal(nodes["email-text"].value,"",
    "a stale message claiming outdated consent must not remain copyable");
  assert.equal(nodes["email-subject"].value,"");
  assert.equal(Object.hasOwn(nodes["open-email"],"href"),false,
    "the outdated mailto link is removed, not merely superseded");
  assert.equal(nodes["copy-email-body"].onclick,null);
  resolveStaleCopy();await inflight;
  assert.equal(nodes["copy-email-status"].textContent,"",
    "an in-flight old copy cannot confirm a draft after form revision");
  handlers.submit({preventDefault(){}});
  assert.equal(nodes["email-draft"].hidden,false);
  assert.match(nodes["email-text"].value,/reply-permission\nno-contact/u,
    "new buyer-authored consent is incorporated only after explicit regeneration");
  assert.doesNotMatch(nodes["email-text"].value,/reply-permission\ninquiry-only/u);
  fields[2][1]="Buyer revised the scope after seeing the drafted email";
  handlers.input();
  assert.equal(nodes["email-draft"].hidden,true,
    "ordinary scope changes also invalidate the old emailed offer");
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

test("production is triggered only manually or by a successful original main-source CI push",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  assert.match(workflow,/^on:\s*\n\s+workflow_dispatch:\s*$/mu);
  assert.match(workflow,/^\s{2}workflow_run:\s*$/mu);
  assert.match(workflow,/workflows:\s*\n\s+- "561\.group source, public-intake and TUFTE consumer qualification"/u);
  assert.match(workflow,/github\.event\.workflow_run\.event == 'push'/u);
  assert.match(workflow,/github\.event\.workflow_run\.head_branch == 'main'/u);
  assert.match(workflow,/github\.event\.workflow_run\.conclusion == 'success'/u);
  assert.match(workflow,/git ls-remote origin refs\/heads\/main/u);
  assert.match(workflow,/test "\$GITHUB_SHA" = "\$ADMITTED_SOURCE_SHA"/u);
  assert.doesNotMatch(workflow,/^\s{2}(?:issues|issue_comment|push|pull_request)\s*:/gmu);
});

test("a production deploy has a main-ref and predeploy safety boundary",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  assert.match(workflow,/github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main'/u,
    "manual dispatches on an unreviewed ref must never deploy");
  assert.match(workflow,/github\.event\.workflow_run\.conclusion == 'success'/u,
    "an automatic release must follow a successful source CI run");
  const publish=workflow.indexOf("cloudflare/wrangler-action");
  assert.ok(publish>0,"the existing provider deployment must remain explicit");
  const before=workflow.slice(0,publish);
  const legacyInterlock=/Refuse unqualified standalone deployment/u.test(before) &&
    /exit 1/u.test(before);
  const qualifiedRelease=/test -s package-lock\.json/u.test(before) &&
    /npm ci --ignore-scripts/u.test(before) &&
    /npm run check/u.test(before) && /npm test/u.test(before) &&
    /npm run build/u.test(before) && /source-revision\.json/u.test(before);
  assert.ok(legacyInterlock||qualifiedRelease,
    "production needs a fail-closed legacy interlock or an exact-source build, test and receipt before Wrangler");
});

test("production Group content admission verifies reviewed trees across merge and refusal cases",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  const checkout=workflow.indexOf("Read reviewed Group front-door main");
  const guard=workflow.indexOf("Refuse an unmerged or superseded Group source before production");
  const bind=workflow.indexOf("Bind front-door content",guard);
  const publish=workflow.indexOf("cloudflare/wrangler-action");
  assert.ok(checkout>0 && checkout<guard && guard<bind && bind<publish,
    "Group main source must be checked before any production provider write");
  const source=workflow.slice(checkout,guard);
  assert.ok(source.includes("repository: 561-group/561-group-frontdoor-services-section"));
  assert.match(source,/ref: main/u,"production must fetch Group main, not an unreviewed feature SHA");
  assert.doesNotMatch(source,/ref: [a-f0-9]{40}/u);
  const admission=workflow.slice(guard,bind);
  // Test the installed source acceptance rule against the actual CI
  // checkout, not a revision-dependent literal copied from an older PR.
  const declaration=/QUALIFIED_FRONTDOOR_TREE: ([a-f0-9]{40})/u.exec(admission);
  assert.ok(declaration,"release must declare a specific accepted Group tree");
  if(process.env.GITHUB_ACTIONS==="true") {
    const candidate=spawnSync("git",["-C",join(root,"content"),"rev-parse","HEAD^{tree}"],
      {encoding:"utf8"});
    assert.equal(candidate.status,0,
      "native CI must checkout original Group source: "+candidate.stderr);
    assert.equal(candidate.stdout.trim(),declaration[1],
      "CI must qualify exactly the Group tree that production will admit");
  }
  assert.match(admission,/git -C content rev-parse 'HEAD\^\{tree\}'/u);
  const newline=String.fromCharCode(10);
  const runBlock=admission.split("        run: |"+newline)[1];
  assert.ok(runBlock,"exercise the actual installed deploy gate, not a test-only replacement");
  const shell=runBlock.split(newline).filter(line=>line.startsWith("          "))
    .map(line=>line.slice(10)).join(newline);
  const temp=mkdtempSync(join(tmpdir(),"original-group-content-admission-"));
  try {
    mkdirSync(join(temp,"content"));
    const git=(...args)=>{
      const result=spawnSync("git",args,{cwd:temp,encoding:"utf8"});
      assert.equal(result.status,0,result.stderr);
      return result.stdout.trim();
    };
    git("init","-q","content");
    const commit=(body,label)=>{
      writeFileSync(join(temp,"content","fixture.txt"),body);
      git("-C","content","add","fixture.txt");
      git("-C","content","-c","user.name=Receiving Fixture",
        "-c","user.email=fixture@example.invalid","commit","-qm",label);
      return git("-C","content","rev-parse","HEAD");
    };
    const first=commit("accepted source","normal");
    const firstTree=git("-C","content","rev-parse","HEAD^{tree}");
    const run=expected=>spawnSync("bash",["-c",shell],{
      cwd:temp,encoding:"utf8",
      env:{...process.env,QUALIFIED_FRONTDOOR_TREE:expected}
    });
    assert.equal(run(firstTree).status,0,"qualified Group main content tree is admitted");
    // A new merge/metadata commit with identical files must not trigger
    // needless repinning or a repeat qualification cycle.
    git("-C","content","-c","user.name=Receiving Fixture",
      "-c","user.email=fixture@example.invalid","commit","--allow-empty","-qm","merge metadata");
    const rebased=git("-C","content","rev-parse","HEAD");
    assert.notEqual(rebased,first,"a distinct commit can retain exactly reviewed bytes");
    assert.equal(git("-C","content","rev-parse","HEAD^{tree}"),firstTree);
    assert.equal(run(firstTree).status,0,"reviewed source remains admitted after metadata-only merge");
    const second=commit("newly reviewed source","alternate");
    const secondTree=git("-C","content","rev-parse","HEAD^{tree}");
    assert.notEqual(first,second);
    assert.notEqual(firstTree,secondTree,"real content changes alter the tree");
    assert.notEqual(run(firstTree).status,0,"old review pin refuses changed Group main content");
    assert.equal(run(secondTree).status,0,"separately qualified new source is admissible");
    assert.notEqual(run("f".repeat(40)).status,0,"unqualified tree cannot publish");
    rmSync(join(temp,"content"),{recursive:true,force:true});
    assert.notEqual(run(secondTree).status,0,"missing Group source must fail closed");
  } finally {
    rmSync(temp,{recursive:true,force:true});
  }
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
  assert.match(before,/npm ci --ignore-scripts/u,"production must use a frozen npm install with required native platform binaries");
  assert.doesNotMatch(before,/npm install --ignore-scripts/u,"unlocked npm install is not a release");
  for(const command of ["npm run check","npm test","npm run build","public/source-revision.json"]){
    assert.ok(before.includes(command),"native build/receipt is required before Wrangler: "+command);
  }
});

test("production release keeps homepage useful and receives culture, real support and CARE at the right routes",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  const editorial=JSON.parse(read("data/frontdoor.json"));
  assert.ok(editorial.proposition.includes("Research, engineering, operations"));
  assert.deepEqual(editorial.vision.frontiers.map(f=>f.id),
    ["union-of-harmonious-colonies","bicameral-biology"],
    "culture and long-horizon research remain source-owned without homepage promotion");
  assert.ok(workflow.includes("html.includes(frontdoor.proposition)"));
  assert.ok(workflow.includes("frontdoor.vision.frontiers.every"));
  for(const sourceGate of ["homeSignals.journeys","homeSignals.companies",
    "homeSignals.projects","homeSignals.inquiry","homeSignals.mythologized"]){
    assert.ok(workflow.includes(sourceGate),"actual public source must keep "+sourceGate);
  }
  assert.ok(workflow.includes("aboutHtml.includes('buy.stripe.com')"),
    "original genuine optional support remains accessible on About rather than hijacking homepage");
  assert.ok(workflow.includes("workHtml.includes('CARE Principles')"),
    "real data-rights inquiry must reference the actual CARE source");
  assert.ok(workflow.includes("receipt.artifactDigests"),
    "correcting what is published cannot weaken original release byte verification");
  assert.ok(!workflow.includes("homeSignals.frontiers.some"),
    "speculative science and constitutional plans cannot be required as homepage advertising");
});

test("production independently reads human HTML using browser content negotiation, not an ambiguous default",()=>{
  const workflow=readFileSync(fileURLToPath(new URL("../.github/workflows/deploy.yml",import.meta.url)),"utf8");
  assert.match(workflow,/const home=await read\('\/','text\/html'\)/u);
  assert.match(workflow,/const htmlResponse=await read\(page\.path,'text\/html'\)/u);
  assert.match(workflow,/Independent public home browser-mode receipt/u);
  assert.match(workflow,/accept:'application\/json'/u);
});

test("manual source release independently binds generated artifacts, not source SHA alone",()=>{
  const workflow=read(".github/workflows/deploy.yml");
  assert.ok(workflow.includes("receipt.artifactDigests"));
  assert.ok(workflow.includes("digest('hex')"),"original predeploy source digest required");
  assert.ok(workflow.includes("crypto.subtle.digest('SHA-256',raw)"),"independent public bytes digest required");
  assert.match(workflow,/sourceCommit!==process\.env\.GITHUB_SHA/u);
  assert.match(workflow,/SITE_PUBLICATION_DATE/u);
  assert.match(workflow,/cloudflare\/wrangler-action/u);
});

test("private work inquiry leads the actual contact page, with reporting and follow-up still available as native alternatives",()=>{
  const html=read("public/contact/index.html");
  const form=html.indexOf('<form id="private-intake"');
  const help=html.indexOf('<h2 id="other-contact-options">');
  const report=html.indexOf('Report an issue publicly');
  assert.ok(form>0&&help>form&&report>help,
    "a buyer should reach the real private intake before lengthy public-issue or aftercare instructions");
  assert.equal((html.match(/<details class="contact-option">/gu)||[]).length,4);
  for(const summary of ["More about buying or offering services",
    "Report an issue publicly","Email or another existing private channel",
    "Track an existing request"]){
    assert.ok(html.includes('<summary>'+summary+'</summary>'),summary);
  }
  for(const preserved of ["Public submissions are untrusted reports for review",
    "Preparing the draft does not send it","Only an authorized receiving office",
    "An issue's closure alone does not establish",
    'id="email-draft" hidden','id="data-stewardship-scope" class="governance-scope" hidden disabled']){
    assert.ok(html.includes(preserved),"the original source must retain "+preserved);
  }
  assert.ok(html.includes('href="/work/"') && html.includes('href="/projects/"'),
    "the contact page must share the Group's quiet institutional navigation");
});

test("actual CARE intake asks about roles, collective benefit, refusal and harm without collecting protected data automatically",()=>{
  const html=read("public/contact/index.html");
  const block=/<fieldset id="data-stewardship-scope"[^>]*>([\s\S]*?)<\/fieldset>/u.exec(html);
  assert.ok(block,"the exact original contact page has a rights-governance gate");
  assert.match(block[0],/hidden disabled/u,"no unrelated inquiry receives these questions");
  assert.match(block[1],/https:\/\/www\.gida-global\.org\/careprinciples/u,
    "link to the Global Indigenous Data Alliance, not our own invented badge");
  for(const term of ["Collective benefit","Authority to control","Responsibility and ethics",
    "who can restrict, correct, withhold or withdraw permission","rights holder"]){
    assert.ok(block[1].toLowerCase().includes(term.toLowerCase()),term);
  }
  for(const name of ["data-peoples","data-authority","data-benefit",
    "data-refusal","data-responsibility"]){
    assert.ok(block[1].includes('name="'+name+'"'),name);
  }
  assert.match(block[1],/Not yet assessed/u);
  assert.match(block[1],/No review or transfer is authorized by this form/u);
  assert.match(block[1],/not proof that a rights holder has consented/u);
  assert.match(html,/dataScope\.disabled = !selected/u,
    "the same original form must disable out-of-scope governance fields");
  assert.match(html,/refreshDataScope\(\);\s*const fields = \[\.\.\.new FormData\(intake\)\]/u,
    "actual email construction checks scope before collecting relevant fields");
  assert.doesNotMatch(html,/autocomplete="on"[^>]*data-authority/u);
});

test("actual work intake asks who receives and about material/energy and coordination constraints",()=>{
  const html=read("public/contact/index.html");
  const start=html.indexOf('<label for="conditions">');
  const end=html.indexOf('<label for="evidence">',start);
  assert.ok(start>0&&end>start);
  const conditions=html.slice(start,end);
  for(const expected of ["independently check or refuse","coordination","energy",
    "material","time","operating constraints","do not paste sensitive records"]){
    assert.ok(conditions.includes(expected),expected);
  }
  assert.ok(conditions.includes('name="conditions"'));
  assert.match(html,/Preparing the draft does not send it/u);
});
