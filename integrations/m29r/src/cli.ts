/** Demonstration and checkpoint inspector; demo outcomes are NOT real Rust parity. */
import {demoWorld,demoHooks,table} from './demo';
import {advanceWorld} from './advance';
import {RandomSource} from './rng';
import {readCheckpoint} from './persistence';
function run(args:string[]):object {
 const [cmd,arg]=args;
 if(cmd==='demo'){
  const count=Number(arg??'2');if(!Number.isInteger(count)||count<1||count>30)throw Error('Season count must be integer 1..30');
  let world=demoWorld(),rng=new RandomSource(2026n),hooks=demoHooks();const summary=[];
  for(let season=0;season<count;season++){
   if(world.game.season_over){const s=advanceWorld(world,rng,hooks);world=s.world;rng=s.rng;}
   while(!world.game.season_over){const s=advanceWorld(world,rng,hooks);world=s.world;rng=s.rng;}
   summary.push({season:world.game.season,played:world.matches.filter(x=>x.played).length,champion:table(world)[0]!.club,allDaysCompleted:world.game.days.every(d=>d.done)});
  }
  return {mode:'DEMONSTRATION_NOT_RUST_PARITY',summary,rng:rng.snapshot()};
 }
 if(cmd==='inspect'&&arg){const s=readCheckpoint(arg);return {mode:'NODE_CHECKPOINT_NOT_BFN',season:s.world.game.season,day:s.world.game.day,clubs:s.world.clubs.length,matches:s.world.matches.length,seed:s.rng.snapshot().nextSeed};}
 throw Error('Usage: demo [seasons] | inspect <file.fmu-day>');
}
try{process.stdout.write(JSON.stringify(run(process.argv.slice(2)))+'\n');}
catch(e){process.stderr.write((e instanceof Error?e.message:String(e))+'\n');process.exitCode=1;}