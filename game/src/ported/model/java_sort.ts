/** M21 — crates/model/src/java_sort.rs: Java Collections.sort até 31 itens.
 * Algoritmo completo do Rust: run asc/desc e inserção binária estável.
 * `n>=32` lança erro, como o Rust que não implementa merges em comparador inconsistente. */
export function javaSortBy<T>(a:T[], compare:(a:T,b:T)=>number):void {
 const n=a.length;if(n<2)return;
 if(n>=32)throw new RangeError('Not ported: Java TimSort merges for length >=32');
 let runHi=2;
 if(compare(a[1]!,a[0]!)<0){
  while(runHi<n&&compare(a[runHi]!,a[runHi-1]!)<0)runHi++;
  const reversed=a.slice(0,runHi).reverse();for(let i=0;i<runHi;i++)a[i]=reversed[i]!;
 }else{
  while(runHi<n&&compare(a[runHi]!,a[runHi-1]!)>=0)runHi++;
 }
 for(let i=Math.max(runHi,1);i<n;i++){
  const pivot=a[i]!;let left=0,right=i;
  while(left<right){const mid=(left+right)>>>1;
   if(compare(pivot,a[mid]!)<0)right=mid;else left=mid+1;
  }
  for(let j=i;j>left;j--)a[j]=a[j-1]!;
  a[left]=pivot;
 }
}
