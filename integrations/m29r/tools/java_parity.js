/** Run the exact same sequences through JDK's java.util.Random and the TS port.
 * Fails nonzero upon ANY difference, including 64-bit values and IEEE754 bits.
 */
const cp=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {JavaRandom}=require('../dist/src/rng.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fmu-jdk-parity-'));
try {
 cp.execFileSync('javac',['-d',dir,path.join(__dirname,'JavaParity.java')],{encoding:'utf8'});
 const bounds=[2,3,7,16,31,100,1000,700000000,2147483647];
 let checks=0;
 for(const seed of [0n,42n,-7n,123456789012345n]){
  const lines=cp.execFileSync('java',['-cp',dir,'JavaParity',String(seed)],{encoding:'utf8'}).trim().split(/\r?\n/);
  const rng=new JavaRandom(seed);let cursor=0;
  const expect=(type,value)=>{
   const got=lines[cursor++],wanted=`${type}:${value}`;if(got!==wanted)throw Error(`JDK mismatch seed ${seed} line ${cursor}: ${got} vs ${wanted}`);
   checks++;
  };
  for(let i=0;i<256;i++){
   const bound=bounds[i%bounds.length];expect('B',`${bound}:${rng.bounded(bound)}`);
   expect('L',rng.long());
   const f=new DataView(new ArrayBuffer(4));f.setFloat32(0,rng.float());expect('F',f.getInt32(0));
   const d=new DataView(new ArrayBuffer(8));d.setFloat64(0,rng.double());expect('D',d.getBigInt64(0));
   expect('I',rng.int());
  }
  const arr=Array.from({length:10},(_,i)=>i);rng.shuffle(arr);expect('S','['+arr.join(', ')+']');
  if(cursor!==lines.length)throw Error('Unexpected Java output after '+cursor);
 }
 console.log(JSON.stringify({jdk_vs_ts:'PASS',seeds:4,checks,includes:'nextIntBounded nextLong nextFloat nextDouble nextInt shuffle'}));
}finally{fs.rmSync(dir,{recursive:true,force:true});}
