declare const process: {argv:string[];stdout:{write(x:string):void};stderr:{write(x:string):void};exitCode?:number;cwd():string};
declare const require: (name:string)=>any;
declare const Buffer: {from(input:Uint8Array|string,encoding?:string):any;concat(inputs:Uint8Array[]):Uint8Array};
