/**
 * Port funcional: crates/systems/src/config.rs (Brasfoot Next).
 * Entrada: texto bfmod.config. Saídas: chaves, flags, intensidade do mercado.
 * Dependências: nenhuma; sem efeitos externos. A última chave repetida vence.
 * Testes: tests/m20_systems.test.ts; controle de validade em `npm test`.
 */
export const SWITCH_KEYS = {
  News:'JORNAL', AwardEffects:'EFEITOS_PREMIOS', Offers:'PROPOSTAS',
  UserWindow:'JANELA_USUARIO', AiLoans:'EMPRESTIMOS_IA',LoanRequests:'PEDIDOS_EMPRESTIMO',
  Youth:'BASE',Sponsorship:'PATROCINIO',Investor:'INVESTIDOR',Fans:'TORCIDA',
  ModernLook:'VISUAL_MODERNO',Tactics:'TATICAS',AutoTactics:'TATICA_AUTO',
  Staff:'COMISSAO',YouthLeague:'CAMPEONATO_BASE',Assets:'PATRIMONIO',
  Stadiums:'ESTADIOS',Credit:'CREDITO',Satellites:'SATELITES'
} as const;
export type Switch=keyof typeof SWITCH_KEYS;
export type MarketIntensity='Off'|'Contained'|'Realistic'|'Busy';
export class ModConfig {
  private constructor(private readonly values:ReadonlyMap<string,string>) {}
  /** Fonte: Config::parse; ignora `#` apenas na PRIMEIRA posição da linha. */
  static parse(text:string):ModConfig {
    const values=new Map<string,string>();
    for(const line of text.split(/\r?\n/)){
      const i=line.indexOf('=');
      if(i>0&&!line.startsWith('#'))values.set(line.slice(0,i).trim(),line.slice(i+1).trim());
    }
    return new ModConfig(values);
  }
  /** Qualquer valor salvo diferente de `1` desabilita a chave. Ausente => true. */
  on(option:Switch):boolean {const value=this.values.get(SWITCH_KEYS[option]);return value===undefined||value==='1';}
  /** Constante desconhecida usa o padrão realista do Rust. */
  market():MarketIntensity {
    switch(this.values.get('MERCADO')){
      case 'DESLIGADO':return 'Off';case 'CONTIDO':return 'Contained';
      case 'AGITADO':return 'Busy';default:return 'Realistic';
    }
  }
  /** Cópia defensiva para persistência/debbuging; não vaza o Map interno. */
  entries():ReadonlyArray<readonly [string,string]>{return [...this.values];}
}
