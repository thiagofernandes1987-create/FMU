/**
 * M24: bundle determinístico sem dependências externas do compilado CommonJS.
 * Entrada: dist/src/m24/web/browser.js. Localiza apenas `require()` relativos
 * e normaliza paths POSIX, produz um IIFE para o navegador no public/fmu-m24/.
 * Sem eval de módulos remotos, imports externos ou bundling de arquivos secretos.
 */
const fs=require('node:fs'),path=require('node:path');
const dist=path.resolve('dist'),entry='src/m24/web/browser.js';
const modules=new Map();
function normalize(p){const q=path.posix.normalize(p);if(q.startsWith('../')||path.posix.isAbsolute(q))throw Error('Import outside dist: '+q);return q;}
function walk(id){id=normalize(id);if(modules.has(id))return;
 const file=path.resolve(dist,id);if(!file.startsWith(dist+path.sep)||!fs.existsSync(file))throw Error('Missing dist module '+id);
 let code=fs.readFileSync(file,'utf8');modules.set(id,'');
 code=code.replace(/require\("([^"]+)"\)/g,(raw,imp)=>{
  if(!imp.startsWith('.'))throw Error('External import forbidden in browser bundle: '+imp);
  const linked=normalize(path.posix.join(path.posix.dirname(id),imp+'.js'));walk(linked);
  return '__require('+JSON.stringify(linked)+')';
 });
 modules.set(id,code);
}
walk(entry);
const out='"use strict";\n(()=>{const modules={\n'+[...modules].sort((a,b)=>a[0].localeCompare(b[0])).map(([id,code])=>JSON.stringify(id)+':function(module,exports,__require){\n'+code+'\n}').join(',\n')+'\n};const cache={};function __require(id){if(cache[id])return cache[id].exports;const fn=modules[id];if(!fn)throw Error("Module not found "+id);const module={exports:{}};cache[id]=module;fn(module,module.exports,__require);return module.exports;}__require('+JSON.stringify(entry)+');})();\n';
fs.writeFileSync('public/fmu-m24/app.bundle.js',out);
console.log('M24 browser bundle:',modules.size,'modules',out.length,'bytes');
