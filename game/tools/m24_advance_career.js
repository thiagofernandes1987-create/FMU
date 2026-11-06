/**
 * M24 — execução ilustrativa de `crates/app/examples/advance_career.rs`.
 * Usa a carreira sandbox e não o save `.s22` ou simulação Rust.
 * Sem efeitos externos além de relatório JSON em stdout. Executar:
 * `npm run build && node tools/m24_advance_career.js 2`
 */
const {createDemoCareer,advanceDemoRound,standings,nextDemoSeason,roundsInSeason}
 =require('../dist/src/m24/web/career_demo.js');
const count=Number(process.argv[2]??2);
if(!Number.isInteger(count)||count<1||count>20){console.error('Season count must be integer 1..20');process.exitCode=2;}
else{
 let world=createDemoCareer('Coach de Teste','c0',2026);const years=[];
 for(let y=0;y<count;y++){
  const year=world.season;
  for(let i=0;i<roundsInSeason(world);i++)world=advanceDemoRound(world);
  const top=standings(world)[0];
  years.push({year,championId:top.clubId,points:top.points,matches:world.fixtures.filter(x=>x.played).length,clubs:world.clubs.length});
  world=nextDemoSeason(world);
 }
 process.stdout.write(JSON.stringify({mode:'SANDBOX_NOT_RUST_PARITY',seasons:years,finalSeason:world.season})+'\n');
}
