import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {qualifyRollback,verifyRollback,fetchDeployments} from '../scripts/worker-recovery.mjs';

const currentId='11111111-1111-4111-8111-111111111111';
const afterId='22222222-2222-4222-8222-222222222222';
const previousId='33333333-3333-4333-8333-333333333333';
const currentVersion='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const olderVersion='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const unknownVersion='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const deployment=(id,version,percentage=100)=>({
  id, versions:[{version_id:version,percentage}],created_on:'2026-10-22T00:00:00Z'
});
const history=(active=deployment(currentId,currentVersion))=>({
  success:true,result:{deployments:[active,deployment(previousId,olderVersion)]}
});
const args={expectedDeploymentId:currentId,targetVersionId:olderVersion};

test('exact historical, provider-native 100%-traffic release qualifies without executing rollback',()=>{
  const got=qualifyRollback(history(),args);
  assert.equal(got.worker,'561-group-site');
  assert.equal(got.rollbackPerformed,false);
  assert.equal(got.activeVersionId,currentVersion);
  assert.equal(got.targetVersionId,olderVersion);
  assert.equal(got.historicalDeploymentId,previousId);
  assert.equal(got.schema,'561.group.worker-recovery-preflight/v1');
});

test('stale operator selection refuses a changed active Cloudflare deployment',()=>{
  assert.throws(()=>qualifyRollback(history(),{...args,expectedDeploymentId:previousId}),/Active deployment changed/);
});

test('unrecognized or already active targets refuse instead of guessing the previous upload',()=>{
  assert.throws(()=>qualifyRollback(history(),{...args,targetVersionId:unknownVersion}),/was not witnessed/);
  assert.throws(()=>qualifyRollback(history(),{...args,targetVersionId:currentVersion}),/already the active/);
  assert.throws(()=>qualifyRollback(history(),{...args,targetVersionId:'latest'}),/exact Cloudflare UUID/);
});

test('split deployments and non-full historical traffic do not silently qualify',()=>{
  const split=deployment(currentId,currentVersion,75);
  split.versions.push({version_id:olderVersion,percentage:25});
  assert.throws(()=>qualifyRollback(history(split),args),/split or unqualified/);
  const past=history();
  past.result.deployments[1].versions[0].percentage=50;
  assert.throws(()=>qualifyRollback(past,args),/was not witnessed/);
});

test('untrusted or incomplete provider data fails closed',()=>{
  for (const response of [null,{}, {success:false,result:{deployments:[]}},
    {success:true,result:{deployments:[]}}, {success:true,result:{deployments:[{id:'oops',versions:[]}]}}]) {
    assert.throws(()=>qualifyRollback(response,args));
  }
});

test('a new provider deployment must serve exactly the rollback target',()=>{
  const before=qualifyRollback(history(),args);
  const success=verifyRollback(history(deployment(afterId,olderVersion)),before);
  assert.equal(success.receivedDeploymentId,afterId);
  assert.equal(success.providerVersionReceived,true);
  assert.equal(success.publicHttpReceived,false);
  assert.equal(success.independentReaderAccepted,false);
  assert.equal(success.priorDeploymentId,currentId);
});

test('provider receipt cannot be invented by a successful CLI exit',()=>{
  const before=qualifyRollback(history(),args);
  assert.throws(()=>verifyRollback(history(),before),/No new deployment/);
  assert.throws(()=>verifyRollback(history(deployment(afterId,currentVersion)),before),/explicitly selected/);
  assert.throws(()=>verifyRollback(history(deployment(afterId,olderVersion,90)),before),/explicitly selected/);
  assert.throws(()=>verifyRollback(history(deployment(afterId,olderVersion)),{}),/Missing site-owned provider preflight/);
});

test('provider read requires bounded official Cloudflare account credentials and uses only GET',async()=>{
  const used=[];
  const json=JSON.stringify(history());
  const fake=async (url,options)=>{
    used.push({url,options});
    return new Response(json,{status:200,headers:{'content-type':'application/json'}});
  };
  const payload=await fetchDeployments({
    accountId:'1'.repeat(32),apiToken:'unexposed-test-token',fetchImpl:fake
  });
  assert.equal(payload.result.deployments.length,2);
  assert.equal(used.length,1);
  assert.match(used[0].url,/^https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\/[a-f0-9]{32}\/workers\/scripts\/561-group-site\/deployments\?per_page=100$/u);
  assert.equal(used[0].options.method,'GET');
  assert.equal(used[0].options.headers.authorization,'Bearer unexposed-test-token');
  await assert.rejects(fetchDeployments({accountId:'wrong',apiToken:'token',fetchImpl:fake}),/Exact Cloudflare/);
  assert.equal(used.length,1);
  await assert.rejects(fetchDeployments({
    accountId:'1'.repeat(32),apiToken:'token',fetchImpl:async()=>new Response('not authorized',{status:403})
  }),/HTTP 403/);
});

test('recovery remains manually dispatched, main-only and serialized with publisher',()=>{
  const workflow=readFileSync(new URL('../.github/workflows/recover-worker.yml',import.meta.url),'utf8');
  assert.match(workflow,/^on:\s*\n\s+workflow_dispatch:\s*$/mu);
  assert.match(workflow,/group: 561-group-production/u);
  assert.match(workflow,/cancel-in-progress: false/u);
  assert.match(workflow,/github\.ref == 'refs\/heads\/main'/u);
  assert.match(workflow,/ROLLBACK 561\.group/u);
  const pre=workflow.indexOf('worker-recovery.mjs preflight');
  const mutation=workflow.indexOf('cloudflare/wrangler-action@');
  const after=workflow.indexOf('worker-recovery.mjs verify');
  assert.ok(pre>0&&mutation>pre&&after>mutation);
  assert.match(workflow,/inputs\.target_version_id/u);
  assert.match(workflow,/inputs\.expected_deployment_id/u);
  assert.doesNotMatch(workflow,/^\s+push:\s*$/mu);
});
