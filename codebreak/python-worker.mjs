// Dedicated browser worker. No user scripts are sent to Current & Craft servers.
// Each run executes the saved investigation.py from its first line, like a normal Python script.
// The file persists across missions in localStorage; Python memory is recreated each run.
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.mjs';
let py;
try {
  py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/'});
  postMessage({type:'ready'});
} catch (e) { postMessage({type:'boot-error',error:String(e)}); }
self.onmessage=({data})=>{
  if(data.type!=='run'||!py)return;
  try {
    py.globals.set('_cb_source',String(data.source||''));
    py.globals.set('_cb_evidence_json',JSON.stringify(data.evidence||{}));
    py.globals.set('_cb_files_json',JSON.stringify(data.caseFiles||{}));
    py.globals.set('_cb_required',String(data.requiredCallable||''));
    const payload=py.runPython(`
import io, contextlib, json, traceback
_cb_stream=io.StringIO()
_cb_error=''
_cb_locals={'__name__':'__main__',
            'evidence':json.loads(_cb_evidence_json),
            'case_files':json.loads(_cb_files_json)}
try:
    with contextlib.redirect_stdout(_cb_stream), contextlib.redirect_stderr(_cb_stream):
        exec(compile(_cb_source,'investigation.py','exec'),_cb_locals,_cb_locals)
except BaseException as exc:
    _cb_error=''.join(traceback.format_exception(type(exc),exc,exc.__traceback__,limit=4))
json.dumps({'output':_cb_stream.getvalue()[-18000:], 'error':_cb_error[-6000:],\n            'callable': bool(_cb_required and callable(_cb_locals.get(_cb_required)))})
`);
    postMessage({type:'result',id:data.id,...JSON.parse(payload)});
  } catch(e) { postMessage({type:'result',id:data.id,output:'',error:String(e)}); }
};