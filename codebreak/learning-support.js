/* CODEBREAK learning support shared by v0.2 and v0.3. No mission answers. */
(function(root){
 'use strict';
 const rules=[
  [/IndentationError:\s*unexpected indent/i,{title:'Unexpected indentation',why:'Python found spaces where no code block was opened.',fix:'Compare the leading spaces on this line with the nearest for, if, and def statements.'}],
  [/IndentationError:\s*expected an indented block/i,{title:'Missing indentation',why:'A statement ending in a colon needs an indented body.',fix:'Indent the following statement consistently, usually four spaces.'}],
  [/SyntaxError:\s*expected ['"]?:['"]?/i,{title:'Missing colon',why:'A block-opening line needs a colon at its end.',fix:'Inspect the line containing for, if, def or else for a missing colon.'}],
  [/SyntaxError/i,{title:'Python syntax',why:'Python cannot read part of the statement.',fix:'Check quotes, commas, parentheses and colons around the reported line.'}],
  [/NameError/i,{title:'Unknown name',why:'Python does not recognize a variable or function name.',fix:'Check the spelling and capitalization; confirm the name was defined before use.'}],
  [/KeyError/i,{title:'Missing dictionary key',why:'The requested field is not present in the dictionary.',fix:'Inspect the data record in the evidence viewer and copy the exact field name.'}],
  [/TypeError/i,{title:'Incompatible types',why:'An operation received a value of an unexpected type.',fix:'Check whether you are using a list, dictionary, string or number at that point.'}],
  [/IndexError/i,{title:'List index out of range',why:'A list position is not available.',fix:'Remember that indexing starts at zero and inspect the list length.'}],
  [/ModuleNotFoundError|ImportError/i,{title:'Unavailable package',why:'That library is not available in the in-browser Python environment.',fix:'Use built-in Python constructs for this challenge.'}]
 ];
 function diagnose(error){
  const text=String(error||'');
  const found=rules.find(([pattern])=>pattern.test(text));
  return found?found[1]:{title:'Python error',why:'The program stopped during execution.',fix:'Read the error type and line number, then adjust one statement and try again.'};
 }
 const skillLabels=['Dictionary output','Variables and text','Loops and comparisons','Booleans and filtering','Functions and iteration'];
 function debrief(completed){
  const learned=skillLabels.slice(0,Math.min(Math.max(0,completed||0),skillLabels.length));
  return 'Programming techniques practiced: '+learned.join(' · ')+'.';
 }
 root.CodebreakLearning=Object.freeze({diagnose,debrief});
})(globalThis);
