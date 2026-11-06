/** Fonte: systems/src/credit.rs. Risco bancário e alavancagem por rating 0..7.
 * Dependência: classificação de risco calculada no sistema externo. */
export const CREDIT_RATE22=[.006,.008,.011,.015,.022,.032,.045,.060] as const;
export const CREDIT_LEVERAGE22=[1.2,1,.8,.6,.4,.25,.12,0] as const;
export function baseCreditRate22(rating:number):number{const v=CREDIT_RATE22[rating];if(v===undefined)throw RangeError('Invalid credit rating');return v;}
export function leverage22(rating:number):number{const v=CREDIT_LEVERAGE22[rating];if(v===undefined)throw RangeError('Invalid credit rating');return v;}
/** `Rating::down`: nunca piora além da faixa 7. */
export function ratingDown22(rating:number,steps:number):number{if(!Number.isInteger(rating)||rating<0||rating>7||steps<0)throw RangeError('Invalid rating');return Math.min(7,rating+steps);}
