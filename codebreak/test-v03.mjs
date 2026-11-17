// Run locally: node codebreak/test-v03.mjs
// No GitHub Actions, browser automation, or external dependencies required.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const read=name=>readFileSync(join(root,name),'utf8');
const file=read('case-data.js');
const {caseInfo,missions,files}=await import('data:text/javascript;base64,'+Buffer.from(file).toString('base64'));
const index=read('index.html'),worker=read('python-worker.mjs'),game=read('game.js'),reference=read('reference.js');
const checked=[];
function check(label,fn){fn();checked.push(label);console.log('PASS '+label)}
check('Full case and defined ending',()=>{
 assert.equal(missions.length,9);
 assert.ok(caseInfo.victim&&caseInfo.ending.paragraphs.length>=4);
 assert.ok(missions.every(m=>Array.isArray(m.expected)&&m.expected.length));
});
check('Unique file names and data keys',()=>{
 assert.equal(new Set(files.map(f=>f.name)).size,files.length);
 assert.equal(new Set(files.filter(f=>f.key).map(f=>f.key)).size,files.filter(f=>f.key).length);
 assert.ok(files.every(f=>Number.isInteger(f.unlock)&&f.unlock>=0&&f.unlock<missions.length));
});
check('Evidence unlocks progressively and does not disappear',()=>{
 for(let stage=0;stage<=missions.length;stage++){
  const seen=files.filter(f=>f.unlock<=stage);
  assert.ok(seen.length>=2);
  if(stage>0)assert.ok(seen.length>=files.filter(f=>f.unlock<=stage-1).length);
 }
 assert.equal(files.filter(f=>f.unlock<=missions.length).length,files.length);
});
check('All missions have teachable requirements and hints',()=>{
 assert.ok(missions.every(m=>m.title&&m.scene&&m.objective&&m.lesson&&m.technique&&m.concepts&&m.approach&&m.starter&&m.hints.length>=3&&m.reveal));
 assert.equal(missions[6].requiredCallable,'audit_flags');
 assert.equal(missions[8].requiredCallable,'accuse');
});
check('Available evidence supports each coding output',()=>{
 const value=key=>files.find(f=>f.key===key)?.value;
 assert.deepEqual(missions[0].expected,[value('last_message')]);
 assert.deepEqual(missions[1].expected,value('staff').map(x=>x.name));
 assert.deepEqual(missions[2].expected,value('logs').filter(x=>x.hour>=22).map(x=>x.name));
 assert.deepEqual(missions[3].expected,value('exits').filter(x=>x.time<'23:00').map(x=>x.name));
 assert.deepEqual(missions[4].expected,value('presence').filter(x=>x.at_2316).map(x=>x.name));
 assert.deepEqual(missions[5].expected,value('reports').filter(x=>x.suspicious).map(x=>x.id));
 assert.deepEqual(missions[6].expected,value('audit_events').filter(x=>x.flagged).map(x=>x.label));
 const session=value('session'),camera=value('camera');
 assert.equal(session.user,camera.person);
 assert.equal(session.terminal,camera.terminal);
 assert.deepEqual(missions[7].expected,[session.user]);
 assert.deepEqual(missions[8].expected,[camera.person]);
});
check('Browser UI has persistent workspace and reference controls',()=>{
 for(const id of ['editor','file-list','file-preview','notebook','epilogue','reference-search','reference-filter','reference-list','run','next','reset'])assert.ok(index.includes('id="'+id+'"'),id);
 assert.ok(index.includes('src="./game.js"')&&index.includes('src="./reference.js"'));
 assert.ok(game.includes("const KEY='codebreak-case001-v03'"));
 assert.ok(game.includes("const OLD_KEY='codebreak-live-case001-v1'"));
 assert.ok(game.includes('state.code=state.code.trimEnd()'));
 assert.ok(game.includes('evidence,caseFiles'));
 assert.ok(reference.includes('...glossary.map')&&reference.includes('...entries.map'));
});
check('Runtime operates on complete script, enforces function requirements and stays client-side',()=>{
 assert.ok(worker.includes('compile(_cb_source'));
 assert.ok(worker.includes('_cb_files_json'));
 assert.ok(worker.includes('_cb_required'));
 assert.ok(worker.includes('callable(_cb_locals.get(_cb_required))'));
 assert.ok(game.includes('new Worker('));
 assert.ok(game.includes('worker.terminate()'));
 assert.ok(!game.includes('fetch('));
});
console.log('\n'+checked.length+' v0.3 checks passed. Run the README browser walkthrough before deploying.');
