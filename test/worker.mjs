import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),"..");
const estate=JSON.parse(await readFile(path.join(root,'data/estate.json'),'utf8'));estate.revision='local-source-fixture';
const probes=[],puts=[],waits=[],keys=[];let cached;
const statuses=[200,301,401,402,403,404,500];
const context=vm.createContext({Request,Response,URL,AbortSignal,Date,JSON,Promise,fetch:async(url,init)=>{probes.push({url,init});if(probes.length===8)throw Error('fixture timeout');return new Response('fixture',{status:statuses[(probes.length-1)%statuses.length]})},caches:{default:{match:async key=>{keys.push(key.url);return cached},put:async(key,value)=>{puts.push({key:key.url,value})}}}});
const told=new vm.SourceTextModule(await readFile(path.join(root,'src/told.mjs'),'utf8'),{context,identifier:'authored-told'});
const data=new vm.SyntheticModule(['default'],function(){this.setExport('default',estate)},{context,identifier:'fixture-estate-records'});
const worker=new vm.SourceTextModule(await readFile(path.join(root,'src/worker.mjs'),'utf8'),{context,identifier:'authored-worker'});
await worker.link(spec=>{if(spec==='../public/estate-records.json')return data;if(spec==='./told.mjs')return told;throw Error('unexpected dependency '+spec)});await worker.evaluate();
let count=0;const check=(n,f)=>{f();count++;console.log('PASS',n)};const fetchWorker=worker.namespace.default.fetch;const ctx={waitUntil:p=>waits.push(p)};let assetRequest;
const env={ASSETS:{fetch:async request=>{assetRequest=request;return new Response('original asset body',{status:200,headers:{'content-type':'text/html'}})}}};
let response=await fetchWorker(new Request('https://www.561.group/contact/?a=b'),env,ctx);
check('original alias redirects with exact path/query',()=>{assert.equal(response.status,301);assert.equal(response.headers.get('location'),'https://561.group/contact/?a=b')});
response=await fetchWorker(new Request('https://561.group/contact/'),env,ctx);
check('existing asset route receives unchanged request',()=>assert.equal(assetRequest.url,'https://561.group/contact/'));
check('authored security/contact headers retained',()=>{assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.match(response.headers.get('content-security-policy'),/form-action mailto:/)});
check('asset body retained',()=>assert.equal(response.status,200));assert.equal(await response.text(),'original asset body');
response=await fetchWorker(new Request('https://561.group/estate.json?arbitrary=x'),env,ctx);await Promise.all(waits);const body=await response.json();
check('every authored public node and machine probed',()=>assert.equal(probes.length,estate.nodes.length+estate.machines.length));
check('probes use exact paths/manual redirects/timeout',()=>{assert.ok(probes.every(p=>p.init.method==='GET'&&p.init.redirect==='manual'&&p.init.signal instanceof AbortSignal));assert.ok(probes.some(p=>p.url==='https://cold-red-gate.561.group/healthz'))});
check('first responses keep authored four-value semantics',()=>assert.deepEqual(body.nodes.slice(0,8).map(n=>n.told),['true','true','both','both','both','false','false','false']));
check('the public reading includes the authored machine-readable service directory',()=>{
  assert.deepEqual(body.groups,estate.groups);
  assert.deepEqual(body.doors,estate.doors);
  assert.deepEqual(body.endpoints,estate.machine);
  assert.equal(body.nodes.length,estate.nodes.length);
  for (let i=0;i<estate.nodes.length;i++){
    assert.equal(body.nodes[i].host,estate.nodes[i].host);
    assert.equal(body.nodes[i].name,estate.nodes[i].name);
    assert.equal(body.nodes[i].group,estate.nodes[i].group);
    assert.equal(body.nodes[i].line,estate.nodes[i].line);
  }
  for (let i=0;i<estate.machines.length;i++){
    assert.equal(body.machines[i].name,estate.machines[i].name);
    assert.equal(body.machines[i].line,estate.machines[i].line);
  }
});
check('source revision cache key ignores arbitrary request query',()=>{assert.equal(keys[0],'https://561.group/estate.json?revision=local-source-fixture');assert.equal(puts[0].key,keys[0])});
check('cached estate retains public cache contract',()=>{assert.equal(response.headers.get('cache-control'),'public, max-age=300');assert.equal(body.ttlSeconds,300);assert.equal(body.revision,estate.revision)});
cached=puts[0].value;const probeCount=probes.length;response=await fetchWorker(new Request('https://561.group/estate.json'),env,ctx);
check('cache hit does not re-probe or lose headers',()=>{assert.equal(probes.length,probeCount);assert.equal(response.headers.get('x-content-type-options'),'nosniff')});
check('all four told values preserved including not read',()=>{assert.equal(told.namespace.toldOf(undefined),'neither');assert.equal(told.namespace.toldOf(null),'false');assert.equal(told.namespace.toldOf(204),'true');assert.equal(told.namespace.toldOf(403),'both')});
// An independently installed ACTIVITYPUB_INSTANCE receives only routes the
// site's authored static assets do not serve; no protocol implementation is
// duplicated inside the public-site Worker.
const federatedRequests=[], assetPaths=[];
const federatedEnv={
  ASSETS:{fetch:async request=>{
    const {pathname}=new URL(request.url);
    assetPaths.push([request.method,pathname]);
    if(pathname==='/contact/')return new Response('contact remains a public asset',{status:200});
    return new Response('missing static route',{status:request.method==='POST'?405:404});
  }},
  ACTIVITYPUB_INSTANCE:{fetch:async request=>{
    federatedRequests.push([request.method,new URL(request.url).origin,new URL(request.url).pathname]);
    const {pathname}=new URL(request.url);
    if(pathname==='/actors/group')return new Response(JSON.stringify({id:'https://561.group/actors/group'}),{status:200,headers:{'content-type':'application/activity+json'}});
    if(pathname==='/actors/group/inbox'&&request.method==='POST')return new Response(null,{status:202});
    return new Response(null,{status:404});
  }}
};
response=await fetchWorker(new Request('https://561.group/actors/group'),federatedEnv,ctx);
check('missing static actor route delegates to site-bound ActivityPub instance',()=>{assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/activity+json');assert.equal(response.headers.get('x-content-type-options'),'nosniff')});
const actorPayload=await response.clone().json();
check('returned ActivityPub actor belongs to exact origin',()=>assert.equal(actorPayload.id,'https://561.group/actors/group'));
response=await fetchWorker(new Request('https://561.group/actors/group/inbox',{method:'POST'}),federatedEnv,ctx);
check('POST inbox reaches the real provider after assets 405',()=>assert.equal(response.status,202));
response=await fetchWorker(new Request('https://561.group/contact/'),federatedEnv,ctx);
check('existing public page never calls federation provider',()=>{assert.equal(response.status,200);assert.equal(federatedRequests.length,2)});
response=await fetchWorker(new Request('https://561.group/no-such-route'),federatedEnv,ctx);
check('provider 404 does not replace authored static 404',()=>assert.equal(response.status,404));
response=await fetchWorker(new Request('https://561.group/_private/deliver',{method:'POST'}),federatedEnv,ctx);
check('public origin never forwards private provider queue routes',()=>{assert.equal(response.status,405);assert.equal(federatedRequests.length,3)});
response=await fetchWorker(new Request('https://561.group/actors/group'),{ASSETS:federatedEnv.ASSETS},ctx);
check('without installed provider binding old Worker remains intact',()=>assert.equal(response.status,404));
check('actor and inbox URLs keep canonical origin at provider',()=>assert.deepEqual(federatedRequests,[
 ['GET','https://561.group','/actors/group'],
 ['POST','https://561.group','/actors/group/inbox'],
 ['GET','https://561.group','/no-such-route']
]));

// Semaday: an incoming signed activity must reach the rightful provider
// *unchanged*, even when the assets adapter attempts to read the body before
// declining the POST. No duplicate protocol parser or alternate inbox.
const authoredActivity = JSON.stringify({
  '@context': 'https://www.w3.org/ns/activitystreams',
  id: 'https://peer.example/activities/complete-1',
  type: 'Create',
  actor: 'https://peer.example/actors/sender',
  object: { type: 'Note', content: 'actual activity bytes remain intact' },
});
const assetProbeBodies = [], receivedActivities = [];
const signedEnv = {
  ASSETS: { fetch: async request => {
    assetProbeBodies.push(await request.text());
    return new Response('static method refused', { status: 405 });
  } },
  ACTIVITYPUB_INSTANCE: { fetch: async request => {
    receivedActivities.push({
      method: request.method,
      url: request.url,
      contentType: request.headers.get('content-type'),
      signature: request.headers.get('signature'),
      body: await request.text(),
    });
    return new Response(null, { status: 202 });
  } },
};
response = await fetchWorker(new Request('https://561.group/actors/group/inbox', {
  method: 'POST',
  headers: {
    'content-type': 'application/activity+json',
    signature: 'keyId="https://peer.example/actors/sender#main-key",headers="date digest",signature="fixture"',
  },
  body: authoredActivity,
}), signedEnv, ctx);
check('static asset method probe never consumes the signed federation body', () => {
  assert.deepEqual(assetProbeBodies, ['']);
  assert.equal(response.status, 202);
});
check('original sender, headers, origin and exact activity bytes reach one provider', () => {
  assert.equal(receivedActivities.length, 1);
  const arrived = receivedActivities[0];
  assert.equal(arrived.method, 'POST');
  assert.equal(arrived.url, 'https://561.group/actors/group/inbox');
  assert.equal(arrived.contentType, 'application/activity+json');
  assert.match(arrived.signature, /peer.example/);
  assert.equal(arrived.body, authoredActivity);
});


// Received from the original text-sitemap recovery Work (#12). The static
// discovery route stays with the existing Worker assets before federation.
const sitemap="https://561.group/\nhttps://561.group/approach/\nhttps://561.group/contact/\nhttps://561.group/work/\n";
let sitemapFederationCalls=0;
const sitemapRequests=[];
const sitemapEnv={
  ASSETS:{fetch:async request=>{
    sitemapRequests.push(request);
    return new Response(request.method==="HEAD"?null:sitemap,{
      status:200,headers:{"content-type":"text/plain; charset=utf-8"}
    });
  }},
  ACTIVITYPUB_INSTANCE:{fetch:async()=>{sitemapFederationCalls++;throw Error("Static sitemap must not reach federation");}}
};
response=await fetchWorker(new Request("https://561.group/sitemap.txt?check=1"),sitemapEnv,ctx);
const sitemapBody=await response.text();
check("text sitemap route preserves correct bytes, headers and the original Worker security policy",()=>{
  assert.equal(response.status,200);
  assert.equal(sitemapBody,sitemap);
  assert.equal(response.headers.get("content-type"),"text/plain; charset=utf-8");
  assert.equal(response.headers.get("x-content-type-options"),"nosniff");
  assert.equal(sitemapRequests[0].url,"https://561.group/sitemap.txt?check=1");
});
response=await fetchWorker(new Request("https://561.group/sitemap.txt",{method:"HEAD"}),sitemapEnv,ctx);
check("HEAD sitemap is a bodyless original static asset request",()=>{
  assert.equal(response.status,200);
  assert.equal(response.headers.get("content-type"),"text/plain; charset=utf-8");
  assert.equal(sitemapRequests[1].method,"HEAD");
  assert.equal(sitemapFederationCalls,0);
});
response=await fetchWorker(new Request("https://www.561.group/sitemap.txt?check=1"),sitemapEnv,ctx);
check("www sitemap redirects preserving the same canonical path and query",()=>{
  assert.equal(response.status,301);
  assert.equal(response.headers.get("location"),"https://561.group/sitemap.txt?check=1");
  assert.equal(sitemapRequests.length,2);
});

console.log(JSON.stringify({passed:count,scope:'Actual authored Worker/told modules with deterministic assets and ActivityPub binding fixtures; not evidence of deployed provider.'}));

