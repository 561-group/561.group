import { mkdtemp, mkdir, cp, readFile, writeFile, symlink, readdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const scratch=await mkdtemp(path.join(tmpdir(),'apex-consumer-'));
const git=(cwd,...args)=>execFileSync('git',['-C',cwd,...args],{encoding:'utf8'});
const record=(id,host,browser='/')=>({id,hostname:host,displayName:`Fixture ${id}`,description:`Fixture ${id} source`,entryPoints:browser?{browser}:{headless:'fixture-cli'}});
const source=path.join(scratch,'source');await mkdir(source);git(source,'init','-q');git(source,'-c','user.name=Qualification','-c','user.email=qualification@example.invalid','commit','--allow-empty','-qm','Local test fixture');
for(const [id,entry] of Object.entries({new:record('new','fixture.invalid','/nested/game'),curated:record('curated','play.561.group'),terminal:record('terminal','terminal.invalid',null)})) {await mkdir(path.join(source,id));await writeFile(path.join(source,id,'catalog-entry.json'),JSON.stringify(entry));}
const app=path.join(scratch,'app');await cp(ROOT,app,{recursive:true,filter:s=>!s.includes('node_modules')});await mkdir(path.join(app,'node_modules/@causeway-services'),{recursive:true});await symlink(path.dirname(fileURLToPath(import.meta.resolve('@causeway-services/play/package.json'))),path.join(app,'node_modules/@causeway-services/play'));
const preload=path.join(scratch,'offline.mjs');await writeFile(preload,`globalThis.fetch = () => { throw new Error('Public network forbidden in local qualification'); };`);
const base={...process.env,PLAY_CATALOG_SOURCES:JSON.stringify([{repositoryRoot:source,catalogRoots:['.'],gameSiteRoots:[]}]),PLAY_CATALOG_DATE:'2026-10-12'};
const run=(extra={})=>spawnSync(process.execPath,['--import',preload,'scripts/build.mjs'],{cwd:app,env:{...base,...extra},encoding:'utf8'});
let passed=0;const check=(name,fn)=>{fn();passed++;console.log('PASS',name)};
const first=run();check('actual CLI with genuine supplier export imports',()=>assert.equal(first.status,0,first.stderr));
const names=['estate-records.json','index.html','llms.txt','humans.txt','robots.txt','sitemap.xml','sitemap.txt'];const before=Object.fromEntries(await Promise.all(names.map(async n=>[n,await readFile(path.join(app,'public',n),'utf8')])));
const textUrls=before['sitemap.txt'].trimEnd().split('\n');
const xmlUrls=[...before['sitemap.xml'].matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
check('text sitemap retains original apex entry and current contact route',()=>assert.deepEqual(textUrls,['https://561.group/','https://561.group/contact/']));
check('text and XML sitemap project exactly the same routes',()=>assert.deepEqual(textUrls,xmlUrls));
check('text sitemap is newline-terminated without markup or duplicate entries',()=>{assert.ok(before['sitemap.txt'].endsWith('\n'));assert.equal(new Set(textUrls).size,textUrls.length);assert.ok(textUrls.every(url=>new URL(url).origin==='https://561.group'))});
for(const url of textUrls){const page=await readFile(path.join(app,'public',new URL(url).pathname,'index.html'),'utf8');check('sitemap page is an actual generated or authored asset: '+url,()=>assert.match(page,/<html\b/));}
const estate=JSON.parse(before['estate-records.json']);const original=JSON.parse(await readFile(path.join(ROOT,'data/estate.json'),'utf8'));
check('all original curated nodes preserved unchanged',()=>assert.deepEqual(estate.nodes.slice(0,original.nodes.length),original.nodes));
check('same existing URL not duplicated',()=>assert.equal(estate.nodes.filter(n=>n.host==='play.561.group').length,1));
check('new authored browser entry preserves exact path',()=>assert.equal(estate.nodes.at(-1).url,'https://fixture.invalid/nested/game'));
check('terminal-only source not substituted as browser page',()=>assert.equal(estate.nodes.some(n=>n.host==='terminal.invalid'),false));
check('original machines and featured doors preserved',()=>{assert.deepEqual(estate.machines,original.machines);assert.deepEqual(estate.doors,original.doors)});
check('sitemap contains canonical page routes without invented modification dates',()=>{
  const xml=before['sitemap.xml'];
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match)=>match[1]),['https://561.group/','https://561.group/contact/']);
  assert.doesNotMatch(xml,/<lastmod>/);
});
const second=run();check('repeat actual build succeeds',()=>assert.equal(second.status,0,second.stderr));const after=Object.fromEntries(await Promise.all(names.map(async n=>[n,await readFile(path.join(app,'public',n),'utf8')])));
check('all seven outputs identical on repeat',()=>assert.deepEqual(after,before));
for(const [name,extra,pattern] of [['missing source', {PLAY_CATALOG_SOURCES:undefined},/sources are required/],['empty source',{PLAY_CATALOG_SOURCES:'[]'},/nonempty/],['invalid date',{PLAY_CATALOG_DATE:'2026-02-30'},/real UTC date/]]) {const r=run(extra);check(name+' refuses',()=>{assert.notEqual(r.status,0);assert.match(r.stderr,pattern)});}
await mkdir(path.join(source,'duplicate'));await writeFile(path.join(source,'duplicate/catalog-entry.json'),JSON.stringify(record('new','other.invalid')));let r=run();check('duplicate identity refuses',()=>{assert.notEqual(r.status,0);assert.match(r.stderr,/duplicate game id/)});
await writeFile(path.join(source,'duplicate/catalog-entry.json'),JSON.stringify(record('another','other.invalid')));
for(let i=0;i<33;i++){await mkdir(path.join(source,'extra'+i));await writeFile(path.join(source,'extra'+i,'catalog-entry.json'),JSON.stringify(record('extra'+i,`extra${i}.invalid`)));}
r=run();check('existing Worker subrequest budget still refuses oversized estate',()=>{assert.notEqual(r.status,0);assert.match(r.stderr,/subrequest budget/)});
console.log(JSON.stringify({passed,scratch,scope:'Bounded fixture catalog with genuine current play modules and unchanged full authored apex renderer; no provider install, actual games, public observation or deployment.'}));
