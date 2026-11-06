/** Rust crates/app/src/patches/store.rs: storage trait semantics mirrored by a
 * transactional in-memory store for testing and offline browser persistence.
 * Platform disk and HTTP storage adapters are NOT included. */
export interface PatchStore {read(key:string):Promise<Uint8Array|undefined>;write(key:string,bytes:Uint8Array):Promise<void>;remove(key:string):Promise<void>;keys(prefix:string):Promise<string[]>;}
export class MemoryPatchStore implements PatchStore {
 private readonly bytes=new Map<string,Uint8Array>();
 async read(key:string):Promise<Uint8Array|undefined>{const b=this.bytes.get(key);return b?new Uint8Array(b):undefined;}
 async write(key:string,value:Uint8Array):Promise<void>{this.bytes.set(key,new Uint8Array(value));}
 async remove(key:string):Promise<void>{this.bytes.delete(key);}
 async keys(prefix:string):Promise<string[]>{return [...this.bytes.keys()].filter(k=>k.startsWith(prefix)).sort();}
}
