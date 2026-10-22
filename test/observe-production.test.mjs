import test from 'node:test';
import assert from 'node:assert/strict';
import { observeProduction, markdownSummary } from '../scripts/observe-production.mjs';
const SHA = '1234567890abcdef1234567890abcdef12345678';
const estate = { revision: 'dated-original-archive', nodes: [{host:'node.561.group',told:'both'}] };
const revision = { repository:'561-group/561.group', origin:'https://561.group', sourceCommit:SHA,
  renderer:'TUFTE', application:'LivingWebServer' };
const headers = { 'x-content-type-options':'nosniff', 'strict-transport-security':'max-age=31536000' };
function provider({ revisionStatus = 200, aliasStatus = 301, aliasLocation = 'https://561.group/contact/?witness=1',
 estateBody = JSON.stringify(estate), abortPath = null, secure = true, claim = revision } = {}) {
  return async url => {
    const path = new URL(url).pathname;
    if (path === abortPath) throw new Error('no route observed');
    if (url.includes('www.561.group')) return new Response('',{status:aliasStatus,headers:{location:aliasLocation}});
    const security = secure ? headers : {};
    if (path === '/') return new Response('<html><main>Group</main></html>',{headers:{'content-type':'text/html',...security}});
    if (path === '/contact/') return new Response('<html>Contact</html>',{headers:{'content-type':'text/html',...security}});
    if (path === '/estate.json') return new Response(estateBody,{headers:{'content-type':'application/json'}});
    if (path === '/llms.txt') return new Response('# 561 Group',{headers:{'content-type':'text/plain'}});
    if (path === '/robots.txt') return new Response('User-agent: *\nAllow: /',{headers:{'content-type':'text/plain'}});
    if (path === '/sitemap.xml') return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',{headers:{'content-type':'application/xml'}});
    if (path === '/.well-known/security.txt') return new Response('Contact: mailto:emsenn@561.group',{headers:{'content-type':'text/plain'}});
    if (path === '/source-revision.json') return revisionStatus === 404
      ? new Response('',{status:404}) : new Response(JSON.stringify(claim),{headers:{'content-type':'application/json'}});
    throw new Error('fixture lacks path: '+path);
  };
}

test('exact selected source readback and public resources qualify only HTTP observations',async()=>{
  const r=await observeProduction({fetchImpl:provider(),expectedSourceSha:SHA,now:()=> '2026-10-22T00:00:00.000Z'});
  assert.equal(r.overall,'public-checks-passed');
  assert.equal(r.providerDeploymentVerified,false);
  assert.equal(r.independentHumanAcceptance,false);
  assert.ok(r.checks.every(c=>c.outcome==='pass'));
  assert.equal(r.checks.find(c=>c.name==='estate').estateNodes,1);
  assert.match(r.checks.at(-1).qualification,/public-self-description-only/u);
  assert.match(markdownSummary(r),/not.*established/u);
});

test('legacy 404 revision is observed absence, not a false match to source',async()=>{
  const r=await observeProduction({fetchImpl:provider({revisionStatus:404})});
  assert.equal(r.overall,'public-checks-passed');
  assert.equal(r.checks.at(-1).outcome,'not-published');
  assert.equal(r.selectedReleaseSource,null);
  assert.equal(r.providerDeploymentVerified,false);
});

test('expecting a release commit fails closed when revision is absent or mismatched',async()=>{
  for(const setting of [{revisionStatus:404},{claim:{...revision,sourceCommit:'f'.repeat(40)}}]){
    const r=await observeProduction({fetchImpl:provider(setting),expectedSourceSha:SHA});
    assert.equal(r.overall,'public-checks-failed');
    assert.equal(r.checks.at(-1).outcome,'fail');
  }
});

test('a redirect to a different origin or path is not accepted',async()=>{
  const r=await observeProduction({fetchImpl:provider({aliasLocation:'https://example.org/contact/?witness=1'})});
  assert.equal(r.overall,'public-checks-failed');
  assert.equal(r.checks.find(c=>c.name==='www-canonical-redirect').outcome,'fail');
});

test('missing HTTP observation is coverage uncertainty, not declared downtime',async()=>{
  const r=await observeProduction({fetchImpl:provider({abortPath:'/estate.json'})});
  assert.equal(r.overall,'receiving-incomplete');
  assert.equal(r.checks.find(c=>c.name==='estate').outcome,'unknown');
});

test('public information requires actual media/contract and security headers',async()=>{
  const a=await observeProduction({fetchImpl:provider({estateBody:'not JSON'})});
  assert.equal(a.overall,'public-checks-failed');
  assert.equal(a.checks.find(c=>c.name==='estate').reason,'invalid-json');
  const b=await observeProduction({fetchImpl:provider({secure:false})});
  assert.equal(b.overall,'public-checks-failed');
  assert.equal(b.checks.find(c=>c.name==='homepage').reason,'missing-security-headers');
});

test('no ill-formed exact revision selection is silently normalized',async()=>{
  await assert.rejects(observeProduction({fetchImpl:provider(),expectedSourceSha:'main'}),/40-character/u);
});
