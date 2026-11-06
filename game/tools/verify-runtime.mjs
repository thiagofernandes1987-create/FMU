/** Runtime WASM original: integridade sem afirmar gameplay QA ou portar Rust. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const p=path.join(root,'public','brasfoot-next-0.1.0-web');
const wasmFile='brasfoot-next-449724485de93118_bg.wasm',jsFile='brasfoot-next-c1effafc3fb6094b.js';
const w=fs.readFileSync(path.join(p,wasmFile)),js=fs.readFileSync(path.join(p,jsFile),'utf8'),html=fs.readFileSync(path.join(p,'index.html'),'utf8');
const wasm=await WebAssembly.compile(w);
const imports=WebAssembly.Module.imports(wasm),exports=WebAssembly.Module.exports(wasm);
if(!exports.some(x=>x.name==='main'&&x.kind==='function'))throw Error('Missing native main');
if(!html.includes(wasmFile)||!html.includes(jsFile))throw Error('Web shell/assets mismatch');
const report={native_runtime:'ORIGINAL_RUST_WASM_NOT_TYPESCRIPT',
 wasm_bytes:w.length,wasm_sha256:crypto.createHash('sha256').update(w).digest('hex'),
 js_sha256:crypto.createHash('sha256').update(js).digest('hex'),
 html_sha256:crypto.createHash('sha256').update(html).digest('hex'),
 wasm_imports:imports.length,wasm_exports:exports.length,wasm_main_exported:true,
 static_web_assets_present:true,wasm_compiles_in_node:true,browser_gameplay:'UNVERIFIED_BLOCKED_BY_BROWSER_ADMIN',
 static_qa:'PASS',ts_conversion_credit:0};
fs.writeFileSync(path.join(root,'docs','WASM_RUNTIME_AUDIT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
