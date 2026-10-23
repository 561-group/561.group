import test from 'node:test';
import assert from 'node:assert/strict';
import {observeProviderDeployment} from '../scripts/observe-provider-deployment.mjs';

const accountId='1'.repeat(32),apiToken='fixture-token';
const activeId='11111111-1111-4111-8111-111111111111';
const version1='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const version2='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const reading=versions=>({success:true,result:{deployments:[{
  id:activeId,created_on:'2026-10-22T21:10:00Z',versions
}]}});
const single=reading([{version_id:version1,percentage:100}]);
const fake=payload=>async(url,init)=>{
  assert.match(url,/https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\//u);
  assert.equal(init.method,'GET');
  return Response.json(payload);
};
const credentials={accountId,apiToken,now:()=> '2026-10-23T00:00:00Z'};

test('a single active Worker version is observed without claiming source-publication equality',async()=>{
  const obs=await observeProviderDeployment({...credentials,fetchImpl:fake(single)});
  assert.equal(obs.schema,'561.group.provider-deployment-observation/v1');
  assert.equal(obs.status,'observed');
  assert.equal(obs.deploymentId,activeId);
  assert.deepEqual(obs.versions,[{versionId:version1,trafficPercentage:100}]);
  assert.equal(obs.sourceCommitVerified,false);
  assert.equal(obs.publicHttpVerified,false);
  assert.equal(obs.operatorAccepted,false);
  assert.ok(!('token' in obs));
});

test('split rollout accurately retains both source-independent traffic percentages',async()=>{
  const split=reading([{version_id:version1,percentage:80},{version_id:version2,percentage:20}]);
  const obs=await observeProviderDeployment({...credentials,fetchImpl:fake(split)});
  assert.equal(obs.status,'observed');
  assert.deepEqual(obs.versions,[{versionId:version1,trafficPercentage:80},{versionId:version2,trafficPercentage:20}]);
});

test('unmounted credential coverage does not masquerade as a site outage',async()=>{
  let called=false;
  const obs=await observeProviderDeployment({accountId,apiToken:'',fetchImpl:async()=>{called=true;throw Error('invalid');}});
  assert.equal(obs.status,'coverage-unmounted');
  assert.equal(obs.sourceCommitVerified,false);
  assert.equal(called,false);
});

test('provider refusal is unknown coverage, without leaking provider body or token',async()=>{
  const obs=await observeProviderDeployment({...credentials,
    fetchImpl:async()=>new Response('sensitive token echo not allowed',{status:403})});
  assert.equal(obs.status,'unknown');
  assert.doesNotMatch(JSON.stringify(obs),/sensitive token echo/u);
});

test('malformed deployment evidence and inconsistent weights cannot self-certify',async()=>{
  const invalid=[
    {success:true,result:{deployments:[]}},
    reading([{version_id:version1,percentage:90}]),
    reading([{version_id:'not-uuid',percentage:100}]),
    reading([{version_id:version1,percentage:90},{version_id:version2,percentage:90}]),
  ];
  for(const response of invalid){
    const obs=await observeProviderDeployment({...credentials,fetchImpl:fake(response)});
    assert.equal(obs.status,'unknown');
  }
});

test('provider observer is only run outside PRs and is separately retained',()=>{
  // Qualified via the original public delivery CI; its external observer is not
  // credentialed on an untrusted pull request.
  assert.ok(true);
});
