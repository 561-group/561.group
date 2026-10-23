import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readSourceRevision} from '../src/source-revision.mjs';
const original={repository:'561-group/561.group',origin:'https://561.group',
  sourceCommit:'0123456789abcdef0123456789abcdef01234567',
  renderer:'TUFTE',application:'LivingWebServer'};
const version='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const uri='https://561.group/source-revision.json';
const fixture=(source=original,id=version,status=200)=>{
  const methods=[];
  const env={CF_VERSION_METADATA:id===null?undefined:{id},ASSETS:{fetch:async req=>{
    methods.push(req.method);
    return status===200?new Response(typeof source==='string'?source:JSON.stringify(source),
      {headers:{'content-type':'application/json'}}):new Response('not published',{status});
  }}};
  return {env,methods};
};
test('original artifact and actual Worker version are joined without cache reuse',async()=>{
  const f=fixture();
  const resp=await readSourceRevision(new Request(uri),f.env);
  assert.equal(resp.status,200);
  assert.equal(resp.headers.get('cache-control'),'no-store');
  assert.deepEqual(await resp.json(),{...original,workerVersionId:version});
  assert.deepEqual(f.methods,['GET']);
});
test('HEAD checks the same release source but sends no body',async()=>{
  const f=fixture();
  const resp=await readSourceRevision(new Request(uri,{method:'HEAD'}),f.env);
  assert.equal(resp.status,200);
  assert.equal(await resp.text(),'');
  assert.deepEqual(f.methods,['GET']);
});
test('missing Worker version metadata fails closed rather than asserting a released commit',async()=>{
  for(const id of [null,'not-a-worker-id']){
    const f=fixture(original,id);
    const resp=await readSourceRevision(new Request(uri),f.env);
    assert.equal(resp.status,503);
    assert.equal(resp.headers.get('cache-control'),'no-store');
    assert.ok(!('workerVersionId' in await resp.json()));
  }
});
test('an absent original published artifact remains absent',async()=>{
  const f=fixture(original,version,404);
  const resp=await readSourceRevision(new Request(uri),f.env);
  assert.equal(resp.status,404);
});
test('malformed or unauthorized source metadata cannot acquire version identity',async()=>{
  for(const source of ['not JSON',{...original,origin:'https://other.example'},
    {...original,sourceCommit:'main'},{...original,application:'OtherApp'}]){
    const resp=await readSourceRevision(new Request(uri),fixture(source).env);
    assert.equal(resp.status,503);
    assert.equal((await resp.json()).workerVersionId,undefined);
  }
});
test('one original Worker declares the platform version binding',async()=>{
  const config=await readFile(new URL('../wrangler.jsonc',import.meta.url),'utf8');
  assert.match(config,/"version_metadata":\s*\{\s*"binding":\s*"CF_VERSION_METADATA"\s*\}/u);
  const worker=await readFile(new URL('../src/worker.mjs',import.meta.url),'utf8');
  assert.match(worker,/readSourceRevision\(request, env\)/u);
  const workflow=await readFile(new URL('../.github/workflows/deploy.yml',import.meta.url),'utf8');
  assert.match(workflow,/receipt\.workerVersionId/u);
  assert.match(workflow,/workers\/scripts\/561-group-site\/deployments/u);
});
