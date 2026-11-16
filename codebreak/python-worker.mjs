import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.mjs';
let py;
try { py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/'}); postMessage({type:'ready'}); }
catch(e){postMessage({type:'boot-error',error:String(e)});}
self.onmessage=({data})=>{
 if(data.type!=='run'||!py)return;
 try{
  py.globals.set('_cb_script',data.source);py.globals.set('_cb_data',JSON.stringify(data.evidence));
  const result=py.runPython(`
import io, contextlib, traceback, json
_cb_stream=io.StringIO()
_cb_error=''
_cb_globals={'__name__':'__main__','evidence':json.loads(_cb_data)}
try:
    with contextlib.redirect_stdout(_cb_stream), contextlib.redirect_stderr(_cb_stream):
        exec(compile(_cb_script,'investigation.py','exec'),_cb_globals,_cb_globals)
except BaseException as exc:
    _cb_error=''.join(traceback.format_exception_only(type(exc),exc)).strip()
json.dumps({'output':_cb_stream.getvalue()[:12000],'error':_cb_error})
`);
  postMessage({type:'result',id:data.id,...JSON.parse(result)});
 }catch(e){postMessage({type:'result',id:data.id,output:'',error:String(e)})}
};