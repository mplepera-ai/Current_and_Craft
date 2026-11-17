// CODEBREAK v0.2 offline checks — run: node codebreak/test-v02.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const base=new URL('./',import.meta.url);
const read=name=>readFileSync(new URL(name,base),'utf8');
const html=read('index.html'),shared=read('learning-support.js'),story=read('story-v02.js');
const sandbox=vm.createContext({});
vm.runInContext(shared,sandbox);
vm.runInContext(story,sandbox);
const {CodebreakLearning:teach,CodebreakStory02:caseStory}=sandbox;
assert.equal(caseStory.beats.length,5);
assert.ok(caseStory.beats.every(b=>b.headline&&b.text));
assert.ok(caseStory.ending.length>=4);
assert.match(caseStory.ending.join(' '),/Marcus Reed/);
assert.equal(teach.diagnose('IndentationError: unexpected indent').title,'Unexpected indentation');
assert.equal(teach.diagnose("SyntaxError: expected ':'").title,'Missing colon');
assert.equal(teach.diagnose("NameError: name 'x' is not defined").title,'Unknown name');
assert.match(teach.debrief(5),/Functions/);
assert.doesNotMatch(html,/11:42 REPORT/);
if(html.includes('src="./game.js"')){
  // v0.3 runs on top of the v0.2 shared learning foundation.
  for(const id of ['help-mode','technique-panel','epilogue','editor'])assert.ok(html.includes('id="'+id+'"'));
  assert.ok(html.includes('src="./learning-support.js"'));
  const game=read('game.js');
  assert.ok(game.includes("codebreak-live-case001-v1"));
  assert.ok(game.includes('CodebreakLearning.diagnose'));
  new vm.Script(game.replace(/^import .*?;\s*$/gm,''),{filename:'CODEBREAK v0.3 game.js'});
}else{
  for(const id of ['story-beat','debrief','error-guide','help-mode'])assert.ok(html.includes('id="'+id+'"'));
  assert.ok(html.includes('codebreak-live-case001-v1'));
  const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(inline);
  new vm.Script(inline[1],{filename:'CODEBREAK v0.2 inline UI'});
}
console.log('PASS: CODEBREAK v0.2 storyline, diagnostics, original progress and syntax.');
