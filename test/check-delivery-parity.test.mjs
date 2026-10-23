import test from 'node:test';
import assert from 'node:assert/strict';
import {compareDelivery} from '../scripts/check-delivery-parity.mjs';
const source='0123456789abcdef0123456789abcdef01234567';
const version='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const requiredRoutes=['homepage','contact','estate','agent-discovery','crawl-policy','sitemap','www-canonical-redirect'];
const http={
  origin:'https://561.group',selectedReleaseSource:source,overall:'public-checks-passed',
  checks:[...requiredRoutes.map(name=>({name,outcome:'pass',required:true})),
    {name:'source-revision-claim',outcome:'pass',claimedSourceCommit:source,claimedWorkerVersionId:version}]
};
const native={
  origin:'https://561.group',worker:'561-group-site',status:'observed',
  deploymentId:'11111111-1111-4111-8111-111111111111',
  versions:[{versionId:version,trafficPercentage:100}]
};
const receive=(pub=http,provider=native)=>compareDelivery({publicObservation:pub,providerObservation:provider});

test('same public Worker version and active provider deployment correspond without claiming source authentication',()=>{
  const a=receive();
  assert.equal(a.status,'version-correspondence-observed');
  assert.equal(a.publicWorkerVersion,version);
  assert.equal(a.providerWorkerVersion,version);
  assert.equal(a.sourceIntegrityIndependentlyAuthenticated,false);
  assert.equal(a.independentReaderAccepted,false);
  assert.deepEqual(a.diagnostics,[]);
});
test('wrong active provider version is a disagreement, not a missing measurement',()=>{
  const a=receive(http,{...native,versions:[{versionId:'bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee',trafficPercentage:100}]});
  assert.equal(a.status,'contradicted');
  assert.ok(a.diagnostics.includes('public-provider-version-disagreement'));
});
test('unmounted read credential and missing source receipt are separate coverage gaps',()=>{
  const a=receive({...http,overall:'public-checks-failed',checks:[
    {name:'source-revision-claim',outcome:'fail',reason:'no-public-revision-receipt'}
  ]},{status:'coverage-unmounted',origin:'https://561.group',worker:'561-group-site'});
  assert.equal(a.status,'receiving-incomplete');
  assert.ok(a.diagnostics.includes('provider-credential-coverage-unmounted'));
  assert.ok(a.diagnostics.includes('public-source-claim-unreceived'));
  assert.ok(!a.diagnostics.includes('public-provider-version-disagreement'));
});
test('split provider rollout does not certify one installed version',()=>{
  const a=receive(http,{...native,versions:[{versionId:version,trafficPercentage:90},
    {versionId:'bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee',trafficPercentage:10}]});
  assert.equal(a.status,'receiving-incomplete');
  assert.ok(a.diagnostics.includes('provider-active-version-not-single-100-percent'));
});
test('a source-selected commit mismatch remains independently actionable even if Worker version matches',()=>{
  const a=receive({...http,selectedReleaseSource:'f'.repeat(40)});
  assert.equal(a.status,'receiving-incomplete');
  assert.ok(a.diagnostics.includes('source-commit-mismatch'));
});
test('missing observer artifacts cannot claim an available deployment',()=>{
  const a=receive(null,null);
  assert.equal(a.status,'receiving-incomplete');
  assert.ok(a.diagnostics.includes('public-coverage-unavailable'));
  assert.ok(a.diagnostics.includes('provider-identity-unobserved'));
});
test('public entrypoint regressions remain distinct from version agreement',()=>{
  const routes=http.checks.map(check=>check.name==='homepage'?{...check,outcome:'fail'}:check);
  const a=receive({...http,overall:'public-checks-failed',checks:routes});
  assert.equal(a.status,'receiving-incomplete');
  assert.ok(a.diagnostics.includes('public-routes-not-independently-received'));
});
test('missing source receipt does not falsify successful public route observations',()=>{
  const checks=http.checks.map(check=>check.name==='source-revision-claim'?{
    ...check,outcome:'fail',reason:'no-public-revision-receipt'}:check);
  const a=receive({...http,overall:'public-checks-failed',checks});
  assert.equal(a.status,'receiving-incomplete');
  assert.ok(a.diagnostics.includes('public-source-claim-unreceived'));
  assert.ok(!a.diagnostics.includes('public-routes-not-independently-received'));
});
test('a missing required public route is not silently accepted',()=>{
  const checks=http.checks.filter(check=>check.name!=='sitemap');
  const a=receive({...http,checks});
  assert.equal(a.status,'receiving-incomplete');
  assert.ok(a.diagnostics.includes('public-routes-not-independently-received'));
});
