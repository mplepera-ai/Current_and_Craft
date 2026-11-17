import {caseInfo,files,missions} from './case-data.js';

const $ = id=>document.getElementById(id);
const KEY='codebreak-case001-v03';
const OLD_KEY='codebreak-live-case001-v1';
const marker = index=>'# === MISSION '+(index+1)+': '+missions[index].title.toUpperCase()+' ===';
const startCode = '# CODEBREAK / CASE 001 / investigation.py\n# Every new mission appends code to this same file.\n# Available data: evidence (dictionary), case_files (file dictionary).\n# Run executes the whole file from the top.\n\n'+marker(0)+'\n'+missions[0].starter;
let state={mission:0,completed:[],snapshots:{},code:startCode,hints:{},version:3};
try {
 const stored=JSON.parse(localStorage.getItem(KEY)||'null');
 if(stored&&stored.version===3&&typeof stored.code==='string'&&Array.isArray(stored.completed)) state={...state,...stored};
} catch {}
state.mission=Math.max(0,Math.min(missions.length-1,Number(state.mission)||0));
state.completed=Array.from(new Set(state.completed.filter(i=>Number.isInteger(i)&&i>=0&&i<missions.length))).sort((a,b)=>a-b);
if(typeof state.code!=='string'||!state.code.trim())state.code=startCode;
let selectedFile=null,worker=null,ready=false,busy=false,runId=0,deadline=null;
let diagnosticCache='';

function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){setFeedback('Browser storage is full or disabled. Progress may not survive a refresh.')}}
function activeMission(){return missions[state.mission]}
function unlockLevel(){return state.completed.length}
function accessible(){return files.filter(f=>f.unlock<=unlockLevel())}
function context(){
 const evidence={},caseFiles={};
 for(const f of accessible()){
  if(f.key)evidence[f.key]=structuredClone(f.value);
  caseFiles[f.name]=f.content??JSON.stringify(f.value,null,2);
 }
 return {evidence,caseFiles};
}
function setFeedback(value){$('feedback').textContent=value}
function safeText(tag,value,className){const n=document.createElement(tag);n.textContent=value;if(className)n.className=className;return n}
function copyButton(code){
 const b=document.createElement('button');b.type='button';b.textContent='Copy saved code';
 b.onclick=async()=>{try{await navigator.clipboard.writeText(code);b.textContent='Copied'}catch{b.textContent='Clipboard unavailable'}};
 return b;
}
function renderNotebook(){
 const root=$('notebook');root.replaceChildren();
 if(!state.completed.length){root.append(safeText('p','Complete a mission to save a code snapshot.','note'));return}
 for(const index of state.completed){
  const card=document.createElement('details');card.className='notebook-entry';
  const summary=safeText('summary',(index+1)+'. '+missions[index].title);
  const note=safeText('p',missions[index].skill,'note');
  const source=typeof state.snapshots[index]==='string'?state.snapshots[index]:'Snapshot unavailable.';
  const pre=safeText('pre',source);
  card.append(summary,note,pre);
  if(state.snapshots[index])card.append(copyButton(source));
  root.append(card);
 }
}
function renderLegacy(){
 const root=$('legacy');root.replaceChildren();
 try{
  const old=JSON.parse(localStorage.getItem(OLD_KEY)||'null');
  if(!old||!Array.isArray(old.completed)){root.textContent='No previous case progress found on this browser.';return}
  root.append(safeText('p','Original five-mission prototype: '+old.completed.length+' / 5 completed. Stored separately; v0.3 does not erase it.','note'));
  for(const index of old.completed){
   const draft=old.drafts?.[index];
   if(typeof draft!=='string')continue;
   const d=document.createElement('details');d.className='notebook-entry';
   d.append(safeText('summary','Original mission '+(index+1)),safeText('pre',draft),copyButton(draft));root.append(d);
  }
 }catch{root.textContent='Prior prototype progress could not be read.'}
}
function renderChapters(){
 const root=$('chapters');root.replaceChildren();
 missions.forEach((m,i)=>{
  const row=document.createElement('div');
  row.className='chapter '+(state.completed.includes(i)?'done':i===state.mission?'active':'');
  row.textContent=(state.completed.includes(i)?'✓ ':(i+1+' / '))+m.title;
  root.append(row);
 });
 $('progresslabel').textContent=state.completed.length+' / '+missions.length+' missions complete';
 $('bar').style.width=(state.completed.length/missions.length*100)+'%';
 $('xp').textContent=state.completed.length*100+' XP';
}
function renderFiles(){
 const list=$('file-list');list.replaceChildren();
 for(const f of files){
  const unlocked=f.unlock<=unlockLevel();
  const b=document.createElement('button');b.type='button';b.className='file-row'+(selectedFile===f.name?' active':'');
  b.disabled=!unlocked;
  b.textContent=unlocked?'▣ '+f.name:'🔒 Evidence packet '+f.unlock;
  b.title=unlocked?f.summary:'Complete more missions to unlock';
  b.onclick=()=>{selectedFile=f.name;const current=accessible().find(x=>x.name===selectedFile);$('file-preview').textContent=current?(current.content??JSON.stringify(current.value,null,2)):'Locked';renderFiles()};
  list.append(b);
 }
 const selected=accessible().find(f=>f.name===selectedFile);
 if(selected)$('file-preview').textContent=selected.content??JSON.stringify(selected.value,null,2);
 else if(selectedFile)$('file-preview').textContent='Choose an unlocked file to inspect its contents.';
}
function renderTimeline(){
 const chronology=[
  {at:1320,unlock:3,text:'22:00 — Elena enters the laboratory'},
  {at:1338,unlock:4,text:'22:18 — Elena leaves the restricted wing'},
  {at:1380,unlock:3,text:'23:00 — Marcus enters the laboratory'},
  {at:1390,unlock:5,text:'23:10–23:30 — estimated death window'},
  {at:1396,unlock:8,text:'23:16 — Ellis confronts Marcus (audio)'},
  {at:1406,unlock:4,text:'23:26 — Marcus leaves restricted wing'},
  {at:1421,unlock:8,text:'23:41 — administrative office camera'},
  {at:1422,unlock:6,text:'23:42 — report R-142 overwritten'},
  {at:1424,unlock:7,text:'23:44 — audit hash mismatch'},
  {at:1453,unlock:0,text:'00:13 — Ellis found in the archive'}
 ];
 $('case-timeline').textContent=chronology.filter(x=>x.unlock<=unlockLevel()).sort((a,b)=>a.at-b.at).map(x=>'• '+x.text).join('\n');
}
function renderEnding(){
 const done=state.completed.includes(missions.length-1);
 $('epilogue').classList.toggle('show',done);
 if(!done)return;
 $('ending-headline').textContent=caseInfo.ending.headline;
 const root=$('ending-text');root.replaceChildren();
 for(const paragraph of caseInfo.ending.paragraphs)root.append(safeText('p',paragraph));
}
function render(){
 const m=activeMission();
 $('scene-title').textContent=m.title;
 $('scene-time').textContent=m.time;
 $('scene-text').textContent=state.mission===0?caseInfo.opening+' '+m.scene:m.scene;
 $('speaker').textContent=m.speaker;
 $('dialogue').textContent=m.dialogue;
 $('objective').textContent=m.objective;
 $('technique').textContent=m.technique;
 $('concepts').textContent='CONCEPTS: '+m.concepts;
 $('approach').textContent=m.approach;
 $('lesson').textContent=m.lesson;
 if($('editor').value!==state.code)$('editor').value=state.code;
 $('run').disabled=!ready||busy;
 const complete=state.completed.includes(state.mission);
 $('next').disabled=!complete||state.mission===missions.length-1;
 $('next').textContent=state.mission===missions.length-1?'Case complete':'Continue investigation →';
 $('outcome').classList.toggle('show',complete);
 $('outcome-text').textContent=complete?m.reveal:'';
 renderChapters();renderNotebook();renderFiles();renderTimeline();renderEnding();renderLegacy();
}
function explainError(error){
 if(/IndentationError: unexpected indent/i.test(error))return 'Indentation: a line has spaces Python did not expect. Check which for, if, or def block it belongs to.';
 if(/IndentationError: expected an indented block/i.test(error))return 'Indentation: a statement ending in a colon needs indented instructions underneath it.';
 if(/SyntaxError: expected ':'/i.test(error))return 'Syntax: Python expects a colon (:) after a def, for, or if header.';
 if(/SyntaxError/i.test(error))return 'Syntax: check punctuation, quotation marks, parentheses, and the line shown above.';
 if(/NameError/i.test(error))return 'NameError: a variable or function name is missing or spelled differently. Check capitalization.';
 if(/KeyError/i.test(error))return 'KeyError: that dictionary key was not found. Use the unlocked file viewer to confirm the field name.';
 if(/TypeError/i.test(error))return 'TypeError: an operation received the wrong kind of value (for example, a list instead of a string).';
 if(/IndexError/i.test(error))return 'IndexError: a list index is outside the available values.';
 if(/ModuleNotFoundError|ImportError/i.test(error))return 'Import error: this package is not available in the browser Python runtime.';
 return 'Read the Python traceback above. Check the named line, then try a smaller change.';
}
function showRuntimeError(error){
 $('output').textContent=error;
 $('diagnostic').textContent=explainError(error);
 setFeedback('Python stopped with an error. Fix it and run again. Your code is still saved.');
}
function startWorker(){
 ready=false;busy=false;clearTimeout(deadline);
 if(worker)worker.terminate();
 $('runtime').textContent='LOADING PYTHON…';$('run').disabled=true;
 worker=new Worker('./python-worker.mjs',{type:'module'});
 worker.onmessage=({data})=>{
  if(data.type==='ready'){ready=true;$('runtime').textContent='PYTHON ONLINE';$('output').textContent='> Python ready. All unlocked evidence is available.';render();return}
  if(data.type==='boot-error'){$('runtime').textContent='PYTHON UNAVAILABLE';$('output').textContent='Unable to load Python. Check internet access and reload. '+data.error;return}
  if(data.type!=='result'||data.id!==runId)return;
  clearTimeout(deadline);busy=false;ready=true;
  if(data.error){showRuntimeError(data.error);render();return}
  const output=String(data.output||'');
  $('output').textContent=output||'(No output)';
  $('diagnostic').textContent='';
  const m=activeMission();
  const lines=output.trim().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const expected=m.expected;
  const match=lines.length>=expected.length&&expected.every((value,i)=>lines[lines.length-expected.length+i]===value);
  const callableOK=!m.requiredCallable||data.callable===true;
  if(match&&callableOK){
   if(!state.completed.includes(state.mission)){
    state.completed.push(state.mission);state.completed.sort((a,b)=>a-b);
    state.snapshots[state.mission]=state.code;
    save();
   }
   setFeedback(state.mission===missions.length-1?'Correct. Full case report unlocked below.':'Correct. New evidence recovered. Review the Case Files, then continue.');
  }else if(!callableOK){setFeedback('The output looks right, but this mission also requires the named function to be defined. Review the function reference.')}
  else setFeedback('Your program ran, but the final output does not match the mission objective. Check formatting and your logic. Earlier mission output may appear above.');
  render();
 };
 worker.onerror=()=>{$('runtime').textContent='PYTHON ERROR';$('output').textContent='Python worker failed. Reload the page.';ready=false;busy=false;render()};
}
$('editor').addEventListener('input',()=>{state.code=$('editor').value;save()});
$('editor').addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 event.preventDefault();const a=event.target.selectionStart,b=event.target.selectionEnd;
 event.target.setRangeText('    ',a,b,'end');state.code=event.target.value;save();
});
$('run').onclick=()=>{
 if(!ready||busy)return;
 state.code=$('editor').value;
 if(!state.code.trim()){setFeedback('Write Python code before running.');return}
 if(state.code.length>50000){setFeedback('Your script exceeds the 50,000-character prototype limit.');return}
 save();busy=true;$('run').disabled=true;
 $('output').textContent='> Executing complete investigation.py…';$('diagnostic').textContent='';
 const id=++runId,level=state.mission;
 const {evidence,caseFiles}=context();
 worker.postMessage({type:'run',id,source:state.code,evidence,caseFiles,requiredCallable:missions[level].requiredCallable||''});
 deadline=setTimeout(()=>{if(id!==runId||!busy)return;$('output').textContent='Execution timed out after 9 seconds. Python is restarting. Your script was preserved.';setFeedback('Check for a loop that never stops, then try again.');startWorker()},9000);
};
$('hint').onclick=()=>{
 const i=state.mission,level=Math.min(2,state.hints[i]||0);
 setFeedback('HINT '+(level+1)+': '+missions[i].hints[level]);
 state.hints[i]=Math.min(2,level+1);save();
};
$('restore').onclick=()=>{
 const token=marker(state.mission),at=state.code.lastIndexOf(token);
 if(at<0){setFeedback('The current mission marker was edited or removed. To protect earlier code, this action was canceled.');return}
 if(!confirm('Replace only the current mission section? Earlier work will be kept.'))return;
 state.code=state.code.slice(0,at)+token+'\n'+activeMission().starter;
 save();render();setFeedback('Current mission starter restored; previous code retained.');
};
$('next').onclick=()=>{
 if(!state.completed.includes(state.mission)||state.mission>=missions.length-1)return;
 state.mission++;
 const token=marker(state.mission);
 if(!state.code.includes(token))state.code=state.code.trimEnd()+'\n\n'+token+'\n'+activeMission().starter;
 selectedFile=null;save();render();
 $('output').textContent='> Mission loaded. Previous code remains above in investigation.py.';
 $('diagnostic').textContent='';setFeedback('New evidence is available in the case file explorer.');
 $('editor').focus();$('editor').setSelectionRange(state.code.length,state.code.length);
};
$('reset').onclick=()=>{
 if(!confirm('Restart v0.3? This clears its progress and cumulative investigation.py. Your older prototype remains unchanged.'))return;
 state={mission:0,completed:[],snapshots:{},code:startCode,hints:{},version:3};selectedFile=null;save();render();setFeedback('v0.3 restarted.');
 $('output').textContent='> Case reset. Run Python when ready.';
};
render();startWorker();